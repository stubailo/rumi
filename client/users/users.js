Template.user_logged_in.events({
  "click #log-out": function(event, template) {
    Meteor.logout(function(error) {
      if(error) {
        console.log("There was an error with logging out.");
      }
    });
  }
});

Template.user_logged_in.helpers({
  currentHousehold: function() {
    return PageSession.get("household");
  },

  anyHouseholds: function() {
   return Meteor.user().households().fetch().length;
  }
});

Template.user_registration.error = function() {
  return PageSession.get("registration_error");
};

Template.user_registration.events({
  "submit form": function(event, template) {
    event.preventDefault();

    var email = template.find("[name=email]").value,
      password = template.find("[name=password]").value;

    Accounts.createUser({
      email: email,
      password: password
    }, function (error) {
      if(error) {
        PageSession.set("registration_error", error);
      } else {
        PageSession.set("registration_error", null);
      }
    });
  }
});

Template.user_login.error = function() {
  return PageSession.get("login_error");
};

Template.user_login.events({
  "submit form": function(event, template) {
    event.preventDefault();

    var email = template.find("[name=email]").value,
      password = template.find("[name=password]").value;

    Meteor.loginWithPassword(email, password, function(error) {
      if(error) {
        PageSession.set("login_error", error);
      } else {
        PageSession.set("login_error", null);
      }
    });
    
  }
});
