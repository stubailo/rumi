TempSession = {
  set: function(key, value) {
    var temp = Session.get("temp");
    if(!temp) {
      temp = {};
    }

    temp[key] = value;
    Session.set("temp", temp);
  },

  get: function(key) {
    var temp = Session.get("temp");
    if(temp) {
      return temp[key];
    }

    return undefined;
  }
};
