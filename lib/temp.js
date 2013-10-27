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

PageSession = {
  keys: {},
  deps: {},

  set: function(key, value) {
    this.keys[key] = value;
    this.deps[key].changed();
  },

  get: function(key) {
    this.ensureDeps(key);
    this.deps[key].depend();
    return this.keys[key];
  },

  ensureDeps: function(key) {
    if(!this.deps[key]) {
      this.deps[key] = new Deps.Dependency();
    }
  }
};
