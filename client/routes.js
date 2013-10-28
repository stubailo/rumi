Router.configure({
  layoutTemplate: "application_layout",
  waitOn: function () {
    return [Meteor.subscribe("households"), Meteor.subscribe("allUsers")];
  }
});

function checkSignIn() {
  if (!Meteor.user()) {
    this.setLayout("application_layout");
    this.render("home");
    this.stop();
  }
}

function clearTemp() {
  Session.set("temp", {});
}

// only render the home page if user is not signed in
Router.before(checkSignIn, {except: ["home"]});
Router.before(clearTemp);

Router.map(function () {
  this.route("home", {
    path: "/",
    action: function() {
      if(Meteor.user()) {
        var lastVisited;
        
        if(Meteor.user().profile) {
          lastVisited = Meteor.user().profile.lastHouseholdVisited;
        }

        if(lastVisited) {
          this.redirect("household", {_id: lastVisited});
        } else if (Meteor.user().households().fetch().length > 0) {
          this.redirect("household", {_id: Meteor.user().households().fetch()[0]});
        } else {
          this.redirect("new_household");
        }
      }
    }
  });

  // Households
  this.route("new_household", {
    path: "/households/new"
  });
  
  this.route("household", {
    path: "/households/:_id",
    data: function () {
      var household = Households.findOne({_id: this.params._id});
      if(household) {
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {"profile.lastHouseholdVisited": this.params._id}});
        PageSession.set("household", household);
      } else {
        this.setLayout("application_layout");
        this.render("not_found");
        this.stop();
      }
      return household;
    }
  });
  
  this.route("households", {
    path: "/households"
  });

  this.route("not_found", {
    path: "*"
  });
});
