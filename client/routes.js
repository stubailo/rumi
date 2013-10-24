function checkSignIn() {
  if (!Meteor.user()) {
    Router.go("home");
  }
}

// only render the home page if user is not signed in
Router.before(checkSignIn, {except: ["home"]});

Router.configure({
  notFoundTemplate: "not_found",
  layoutTemplate: "application_layout"
});

Router.map(function () {
  this.route("home", {
    path: "/"
  });

  // Households
  this.route("new_household", {
    path: "/households/new"
  });
  
  this.route("household", {
    path: "/households/:_id",
    waitOn: function () {
      return [Meteor.subscribe("households"), Meteor.subscribe("allUsers")];
    },
    data: function () {
      return Households.findOne({_id: this.params._id});
    }
  });
  
  this.route("households", {
    path: "/households",
    waitOn: function () {
      return Meteor.subscribe("households");
    },
    data: function () {
      return {
        households: Households.find().fetch()
      };
    }
  });

  this.route("household_pay", {
    path: "/households/:_id/pay",
    waitOn: function () {
      return [Meteor.subscribe("households"), Meteor.subscribe("allUsers")];
    },
    data: function () {
      return Households.findOne({_id: this.params._id});
    }
  });
});
