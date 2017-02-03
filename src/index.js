var trim = require("trim");
var isArray = require("isarray");
var ObjectPath = require("object-path");

const VALIDATORS = {
  required: function(value) {
    return isPresent(value.toString());
  },

  number: function(value, options) {
    var valid = (value || "").toString().match(/^[0-9]+$/m) != null;

    value = parseFloat(value);

    valid = valid && (!options.gt || (options.gt && value > options.gt));
    valid = valid && (!options.gte || (options.gte && value >= options.gte));
    valid = valid && (!options.lt || (options.lt && value < options.lt));
    valid = valid && (!options.lte || (options.lte && value <= options.lte));

    return valid;
  },

  length: function(value, options) {
    var valid = true;

    valid = valid && (!options.gt || (value && options.gt && value.length > options.gt));
    valid = valid && (!options.gte || (value && options.gte && value.length >= options.gte));
    valid = valid && (!options.lt || (value && options.lt && value.length < options.lt));
    valid = valid && (!options.lte || (value && options.lte && value.length <= options.lte));

    return valid;
  },

  format: function(value, options) {
    return (value || "").toString().match(options.match) != null;
  }
}

export default class {
  constructor(rules, data) {
    this.rules = rules;
    this.data = data;
    this.clear();
  }

  clear() {
    this.event = null;
    this.results = {};
  }

  validate() {
    this.clear();

    this.rules.forEach((rule, index) => {
      // does rule have an `if` condition?
      if(skipRunRule(rule, this.event, this.data)) return;

      // walk over fields
      rule.fields.forEach((field) => {
        // grab the value from object
        let fieldValue = ObjectPath.get(this.data, field);

        // skip?
        if(skipRuleOnField(rule, field, fieldValue)) return;

        if(!this.results[field])
          this.results[field] = {};

        this.results[field][index] = isFieldValid(rule, this.data, fieldValue);
      });
    });
  }

  isValid() {
    for(let field in this.results) {
      for(let index in this.results[field]) {
        let validField = this.results[field][index];

        if(!validField) return false;
      }
    }

    return true;
  }

  isFieldValid(field) {
    if(!this.results[field]) return true;

    for(let index in this.results[field]) {
      if(!this.results[field][index]) return false;
    }

    return true;
  }

  getErrorMessagesForField(field) {
    if(!this.results[field]) return [];

    var messages = [];

    for(let index in this.results[field]) {
      if(!this.results[field][index]) {
        messages.push(this.rules[index].message);
      }
    }

    return messages;
  }

  getErrorMessages() {
    var messages = [];

    for(let field in this.results) {
      for(let index in this.results[field]) {
        let message = this.rules[index].message;

        if(!this.results[field][index] && messages.indexOf(message) == -1) {
          messages.push(message);
        }
      }
    }

    return messages;
  }

  removeFieldResult(field) {
    if(!this.results || !this.results[field]) return;
    delete this.results[field];
  }
}

function isPresent(value) {
  if(isArray(value)) {
    return value.length > 0;
  } else {
    return value && !(typeof(value) === "undefined") && trim(value) != "";
  }
}

function skipRunRule(rule, event, data) {
  return (rule.on && event != rule.on) || (rule.if && !rule.if(data));
}

function skipRuleOnField(rule, field, fieldValue) {
  return rule.allowBlank && !isPresent(fieldValue);
}

function isFieldValid(rule, data, value) {
  if(rule.validator == "custom") {
    return !!(rule.validation(data));

  } else if(VALIDATORS[rule.validator]) {
    return !!(VALIDATORS[rule.validator](value, rule));

  } else {
    throw `Unknown validator ${rule.validator}`;
  }
}
