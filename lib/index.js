"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var trim = require("trim");
var isArray = require("isarray");
var ObjectPath = require("object-path");

var VALIDATORS = {
  required: function required(value) {
    return isPresent(value);
  },

  number: function number(value, options) {
    var valid = (value || "").toString().match(/^[0-9]+$/m) != null;

    value = parseFloat(value);

    valid = valid && (!options.gt || options.gt && value > options.gt);
    valid = valid && (!options.gte || options.gte && value >= options.gte);
    valid = valid && (!options.lt || options.lt && value < options.lt);
    valid = valid && (!options.lte || options.lte && value <= options.lte);

    return valid;
  },

  length: function length(value, options) {
    var valid = true;

    valid = valid && (!options.gt || value && options.gt && value.length > options.gt);
    valid = valid && (!options.gte || value && options.gte && value.length >= options.gte);
    valid = valid && (!options.lt || value && options.lt && value.length < options.lt);
    valid = valid && (!options.lte || value && options.lte && value.length <= options.lte);

    return valid;
  },

  format: function format(value, options) {
    return (value || "").toString().match(options.match) != null;
  }
};

var _class = function () {
  function _class(rules, data) {
    _classCallCheck(this, _class);

    this.rules = rules;
    this.data = data;
    this.clear();
  }

  _createClass(_class, [{
    key: "clear",
    value: function clear() {
      this.event = null;
      this.results = {};
    }
  }, {
    key: "validate",
    value: function validate() {
      var _this = this;

      this.clear();

      this.rules.forEach(function (rule, index) {
        // does rule have an `if` condition?
        if (skipRunRule(rule, _this.event, _this.data)) return;

        // walk over fields
        rule.fields.forEach(function (field) {
          // grab the value from object
          var fieldValue = ObjectPath.get(_this.data, field);

          // skip?
          if (skipRuleOnField(rule, field, fieldValue)) return;

          if (!_this.results[field]) _this.results[field] = {};

          _this.results[field][index] = isFieldValid(rule, _this.data, fieldValue);
        });
      });
    }
  }, {
    key: "isValid",
    value: function isValid() {
      for (var field in this.results) {
        for (var index in this.results[field]) {
          var validField = this.results[field][index];

          if (!validField) return false;
        }
      }

      return true;
    }
  }, {
    key: "isFieldValid",
    value: function isFieldValid(field) {
      if (!this.results[field]) return true;

      for (var index in this.results[field]) {
        if (!this.results[field][index]) return false;
      }

      return true;
    }
  }, {
    key: "getErrorMessagesForField",
    value: function getErrorMessagesForField(field) {
      if (!this.results[field]) return [];

      var messages = [];

      for (var index in this.results[field]) {
        if (!this.results[field][index]) {
          messages.push(this.rules[index].message);
        }
      }

      return messages;
    }
  }, {
    key: "getErrorMessages",
    value: function getErrorMessages() {
      var messages = [];

      for (var field in this.results) {
        for (var index in this.results[field]) {
          var message = this.rules[index].message;

          if (!this.results[field][index] && messages.indexOf(message) == -1) {
            messages.push(message);
          }
        }
      }

      return messages;
    }
  }, {
    key: "removeFieldResult",
    value: function removeFieldResult(field) {
      if (!this.results || !this.results[field]) return;
      delete this.results[field];
    }
  }]);

  return _class;
}();

exports.default = _class;


function isPresent(value) {
  if (typeof value === "undefined") {
    return false;
  } else if (isArray(value)) {
    return value.length > 0;
  } else {
    return value && !(typeof value === "undefined") && trim(value) != "";
  }
}

function skipRunRule(rule, event, data) {
  return rule.on && event != rule.on || rule.if && !rule.if(data);
}

function skipRuleOnField(rule, field, fieldValue) {
  return rule.allowBlank && !isPresent(fieldValue);
}

function isFieldValid(rule, data, value) {
  if (rule.validator == "custom") {
    return !!rule.validation(data);
  } else if (VALIDATORS[rule.validator]) {
    return !!VALIDATORS[rule.validator](value, rule);
  } else {
    throw "Unknown validator " + rule.validator;
  }
}