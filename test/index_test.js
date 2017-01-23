import Validator from "../src/index";

describe("Validator", function() {
  describe("Simple validation", function() {
    let rules = [
      {
        validator: "required",
        fields: [ "person.firstName", "person.lastName" ],
        message: "First and/or last name required"
      }
    ]

    it("validates correctly", function() {
      let data = {
        person: {
          firstName: "Ronald",
          lastName: "Dump"
        }
      }

      let subject = new Validator(rules, data);

      subject.validate();
      subject.isValid().should.equal(true);
      subject.isFieldValid('person.firstName').should.equal(true);
      subject.isFieldValid('person.lastName').should.equal(true);
    });

    it("validates falsey", function() {
      let data = {
        person: {
          firstName: null,
          lastName: "    "
        }
      }

      let subject = new Validator(rules, data);

      subject.validate();
      subject.isValid().should.equal(false);
      subject.isFieldValid('person.firstName').should.equal(false);
      subject.isFieldValid('person.lastName').should.equal(false);
      subject.getErrorMessagesForField('person.firstName').should == [
        'First and/or last name required'
      ];
      subject.getErrorMessagesForField('person.lastName').should == [
        'First and/or last name required'
      ];
      subject.getErrorMessages().should == [
        'First and/or last name required'
      ];
    });
  });

  describe("Validators", function() {
    describe("Required fields", function() {
      let data = {
        person: {
          firstName: null,
          lastName: null
        }
      }

      let rules = [
        {
          validator: "required",
          fields: [ "person.firstName", "person.lastName" ],
        }
      ]

      let subject = new Validator(rules, data);

      it("validates null", function() {
        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates empty string", function() {
        data.person.firstName = "     ";
        data.person.lastName = "   \n   ";

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates filled string", function() {
        data.person.firstName = "FIRST";
        data.person.lastName = " NAME ";

        subject.validate();
        subject.isValid().should.equal(true);
      });
    });

    describe("Numbers", function() {
      let data = {
        person: {
        }
      }

      let rules = [
        {
          validator: "number",
          fields: [ "person.age" ]
        }
      ]

      let subject = new Validator(rules, data);

      it("validates undefined", function() {
        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates null", function() {
        data.person.age = null;

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates string", function() {
        data.person.age = "1abc";

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates string with number", function() {
        data.person.age = "1";

        subject.validate();
        subject.isValid().should.equal(true);
      });

      it("validates number", function() {
        data.person.age = 1;

        subject.validate();
        subject.isValid().should.equal(true);
      });
    });

    describe("Length", function() {
      let data = {
        person: {
        }
      }

      let rules = [
        {
          validator: "length",
          fields: [ "person.name" ],
          gte: 2,
          lte: 10
        }
      ]

      let subject = new Validator(rules, data);

      it("validates undefined", function() {
        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates null", function() {
        data.person.name = null;

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates incorrect string length", function() {
        data.person.name = "";

        subject.validate();
        subject.isValid().should.equal(false);

        data.person.name = "1";

        subject.validate();
        subject.isValid().should.equal(false);

        data.person.name = "01234567890";

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates correct string length", function() {
        data.person.name = "01";

        subject.validate();
        subject.isValid().should.equal(true);

        data.person.name = "0123456789";

        subject.validate();
        subject.isValid().should.equal(true);
      });
    });

    describe("Format", function() {
      let data = {
        company: {
        }
      }

      let rules = [
        {
          validator: "format",
          fields: [ "company.vatNumber" ],
          match: /^NL[0-9]{10}$/
        }
      ]

      let subject = new Validator(rules, data);

      it("validates null", function() {
        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates empty string", function() {
        data.company.vatNumber = "";

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates correct format", function() {
        data.company.vatNumber = "NL1234567890";

        subject.validate();
        subject.isValid().should.equal(true);
      });

      it("validates correct format", function() {
        data.company.vatNumber = "BE1234567890";

        subject.validate();
        subject.isValid().should.equal(false);
      });
    });

    describe("Custom", function() {
      let data = {
        company: {}
      }

      let rules = [
        {
          validator: "custom",
          fields: [ "company.idNumber" ],
          validation: function(data) {
            return data.company.idNumber > 10 && data.company.idNumber / 4 == 5;
          }
        }
      ]

      let subject = new Validator(rules, data);

      it("validates incorrectly", function() {
        data.company.idNumber = 9;

        subject.validate();
        subject.isValid().should.equal(false);

        data.company.idNumber = 11;

        subject.validate();
        subject.isValid().should.equal(false);
      });

      it("validates correctly", function() {
        data.company.idNumber = 20;

        subject.validate();
        subject.isValid().should.equal(true);
      });
    });
  });
});
