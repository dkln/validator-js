import Validator from "../index";

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
      subject.isValid().should == true;
      subject.isFieldValid('person.firstName').should == true;
      subject.isFieldValid('person.lastName').should == true;
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
      subject.isValid().should == false;
      subject.isFieldValid('person.firstName').should == false;
      subject.isFieldValid('person.lastName').should == false;
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
      it("validates required fields", function() {
        let data = {
          person: {
            firstName: null,
            lastName: "     "
          }
        }

        let rules = [
          {
            validator: "required",
            fields: [ "person.firstName", "person.lastName" ],
          }
        ]

        let subject = new Validator(rules, data);
        subject.validate();

        subject.isValid().should == false;

        data.person = {
          firstName: "FIRST",
          lastName: " NAME "
        };

        subject.validate();

        subject.isValid().should == true;
      });
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

    it("validates null", function() {
      data.person.age = null;

      subject.validate();
      subject.isValid().should == false;
    });

    it("validates string", function() {
      data.person.age = "1";

      subject.validate();
      subject.isValid().should == false;
    });

    it("validates number", function() {
      data.person.age = 1;

      subject.validate();
      subject.isValid().should == true;
    });
  });
});
