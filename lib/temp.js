/**
 * This is a per-page session object.  It is created anew by the router
 * on every page load so that we can keep track of page-specific state,
 * such as which tabs are open.
 */

PageSession = {
  keys: {},
  deps: {},

  set: function(key, value) {
    this.ensureDeps(key);
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
