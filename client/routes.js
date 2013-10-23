function checkSignIn() {
  if (!Meteor.user()) {
    this.render("home");
    this.stop();
  }
}

// only render the home page if user is not signed in
Router.before(checkSignIn);

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
});
