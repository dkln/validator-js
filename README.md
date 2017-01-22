Validator JS
============

Validations for objects. Can be used to validate form inputs and such.

## Installation

```
npm install validator-js
```

### How to use

```javascript
import Validator from "validator-js";

var data = {
  person: {
    firstName: "Ronald",
    lastName: "Dump"
  },
  address: {
    street: "",
    houseNumber: null
  }
}

var rules = [
  {
    validator: "required",
    fields: [ "person.firstName", "person.lastName" ],
    message: "First and/or last name are required"
  },
  {
    validator: "required",
    fields: [ "address.street"],
    message: "Street is required"
  },
  {
    validator: "number",
    fields: [ "address.houseNumber" ],
    message: "House number must be a number",
    allowBlank: true
  }
];

validator = new Validator(data, rules);
validator.validate();
```

### Rule options

* `validator`: One of the built in validators:
  * required
  * number
    * gt: > number
    * gte: >= number
    * lt: < number
    * lte: <= number
  * length
    * gt: > length
    * gte: >= length
    * lt: < length
    * lte: <= length
  * format
  * email
  * custom
    * validation: custom validation function
* `fields`: Determines which fields should be validated in this rule
* `message`: The error message for the fields when validation fails
* `if`: Contains function that determines if the rule should be ran
* `on`: Only runs rule when the given event matches
* `allowBlank`: Allows blank values
