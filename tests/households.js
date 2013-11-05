/* Unit tests for household model and methods - creation and adding or removing
 * of users. Makes use of the Laika framework (http://arunoda.github.io/laika),
 * which can simulate both server and client elements. These can emit events (and
 * any relevant data) in response to changes in the db, and use Node's assert
 * library to compare actual vs. expected values and catch errors via regex.
 */

 var assert = require('assert');

 suite('Households, server only -', function() {
  // creating a new household should add a new record to the db
  test('household saves to db', function(done, server) {
    server.eval(function() {
      Households.insert({name: 'MIT'});
      var docs = Households.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 1);
      done();
    });
  });

  // creating multiple households should add that many records to the db
  test('multiple households can be created', function(done, server) {
    server.eval(function() {
      Households.insert({name: 'MIT'});
      Households.insert({name: 'Harvard'});
      Households.insert({name: 'Caltech'});
      var docs = Households.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 3);
      done();
    });
  });

  // adding a user to a household should update the db
  test('adding user to household saves to db', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'security'});
      Households.insert({name: 'MIT'});

      var user = Meteor.users.findOne();
      var household = Households.findOne();

      Households.update({_id: household._id}, {$addToSet: {user_ids: user._id}});

      var docs = user.households().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs[0].name, 'MIT');
      done();
    });
  });

  // adding multiple users to a household should be supported
  test('adding multiple users to one household', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user1@mit.edu', password: 'security'});
      Accounts.createUser({email: 'user2@mit.edu', password: 'password'});
      Accounts.createUser({email: 'user3@mit.edu', password: 'sosecure'});
      Households.insert({name: 'MIT'});

      var users = Meteor.users.find();
      var household = Households.findOne();

      users.forEach(function(user) {
        Households.update({_id: household._id}, {$addToSet: {user_ids: user._id}});
      });

      var docs = Households.findOne();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.user_ids.length, 3);
      done();
    });
  });

  // adding a user to multiple households should be supported
  test('adding one user to multiple households', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'password'});
      Households.insert({name: 'Kappa Alpha Theta'});
      Households.insert({name: 'Phi Sigma Kappa'});
      Households.insert({name: 'East Campus'});

      var user = Meteor.users.findOne();
      var households = Households.find();

      households.forEach(function(household) {
        Households.update({_id: household._id}, {$addToSet: {user_ids: user._id}});
      });

      var docs = Meteor.users.findOne().households().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 3);
      done();
    });
  });

  // removing a user from a household should update the db
  test('removing user from household updates db', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'password'});
      Households.insert({name: 'MIT'});

      var user = Meteor.users.findOne();
      var household = Households.findOne();

      Households.update({_id: household._id}, {$addToSet: {user_ids: user._id}});
      Households.update({_id: household._id}, {$pull: {user_ids: user._id}});

      var docs = Households.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs[0].user_ids.length, 0);
      done();
    });
  });
});