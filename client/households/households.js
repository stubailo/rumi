Template.new_household.events = {
  "submit form": function(event, template) {
    event.preventDefault();
    var formData = Util.serializeForm(template.find("form"));

    formData.user_ids = [Meteor.user()._id];

    // only insert attributes defined in Household model
    var new_household_id = Households.insert(_.pick(formData, Household.attributes));

    // redirect to newly created household
    Router.go("household", {_id: new_household_id});
  }
};

Template.household_add_user.error = function () {
  return PageSession.get("household_add_user_error");
};

Template.household_add_user.events = {
  "submit form": function(event, template) {
    event.preventDefault();
    var formData = Util.serializeForm(template.find("form"));

    // email of user to add
    var email = formData.email;

    Meteor.call("addUserToHousehold", email, this._id, function(error) {
      if(error) {
        PageSession.set("household_add_user_error", error.reason);
      } else {
        PageSession.set("household_add_user_error", undefined);
        $(template.find("input")).val("");
      }
    });

  }
};

Template.household_leave.events = {
  "click button": function(event, template) {
    event.preventDefault();
    Meteor.call("removeSelfFromHousehold", this._id);

    // leave the now-invalid page
    Router.go("households");
  }
};
