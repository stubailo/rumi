Ability = {
  can: function (action, type, obj) {
    switch(action + " " + type) {
      case "edit expense":
        return Meteor.user()._id === obj.user_id;
      default:
        return false;
    }
  }
};
