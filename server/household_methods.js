Meteor.methods({
  addUserToHousehold: function (email, household_id) {
    var user = Meteor.users.findOne({"emails.address": email});
    if(!user) {
      throw new Meteor.Error(404, "User with email " + email + " doesn't exist.");
    }
    var user_id = user._id;
    Households.update({_id: household_id}, {$addToSet: {user_ids: user_id}});
  },
  removeSelfFromHousehold: function (household_id) {
    Households.update({_id: household_id}, {$pull: {user_ids: this.userId}});
  }
});
