Template.user_logged_in.events({
  "click #log-out": function(event, template) {
    Meteor.logout(function(error) {
      console.log("There was an error with logging out.");
    });
  }
});

Template.user_logged_in.currentHousehold = function() {
  return PageSession.get("household");
};

Template.user_registration.error = function() {
  return TempSession.get("registration_error");
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
        TempSession.set("registration_error", error);
      } else {
        TempSession.set("registration_error", null);
      }
    });
  }
});

Template.user_login.error = function() {
  return TempSession.get("login_error");
};

Template.user_login.events({
  "submit form": function(event, template) {
    event.preventDefault();

    var email = template.find("[name=email]").value,
      password = template.find("[name=password]").value;

    Meteor.loginWithPassword(email, password, function(error) {
      if(error) {
        TempSession.set("login_error", error);
      } else {
        TempSession.set("login_error", null);
      }
    });
    
  }
});
