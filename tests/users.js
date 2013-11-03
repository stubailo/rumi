/* Unit tests for user model and methods - registration, login, authorization */
var assert = require('assert');

suite('Server only -', function() {
  // registering a new account should add a new record to the db
  test('account registers to Meteor.users', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'sosecure'});
      var docs = Meteor.users.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 1);
      done();
    });
  });

  // registering multiple accounts should add that many records to the db
  test('multiple accounts can be registered', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user1@mit.edu', password: 'security'});
      Accounts.createUser({email: 'user2@mit.edu', password: 'airtight'});
      Accounts.createUser({email: 'user3@mit.edu', password: 'password'});
      var docs = Meteor.users.find().fetch();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.length, 3);
      done();
    });
  });

  // a user record should retain the email it was registered with
  test('email param gets saved to db', function(done, server) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'sosecure'});
      var docs = Meteor.users.findOne();
      emit('docs', docs);
    });

    server.once('docs', function(docs) {
      assert.equal(docs.emails[0].address, 'user@mit.edu');
      done();
    });
  });

  // there should be a one-to-one relationship between users and emails
  test('only allow one account per email', function(done, server) {
    var error = server.evalSyncExpectError('failed signup', function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'account1'});
      Accounts.createUser({email: 'user@mit.edu', password: 'account2'});
      emit('return');
    });

    assert.ok(error.message.match(/Email already exists/));
    done();
  });
});

suite('Server + client -', function() {
  // registering a new account should also work from the client side
  test('account registers to Meteor.users (client-side)', function(done, server, client) {
    server.eval(function() {
      Meteor.users.find().observe({
        added: function(doc) {
          emit('added', doc);
        }
      });
    }).once('added', function(doc) {
      assert.equal(doc.emails[0].address, 'user@mit.edu');
      done();
    });

    client.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'password'});
    });
  });

  // TODO: an invalid log in should return an error
  // (I've tried everything here, to no avail - will come back later)

  // a registered user should be able to log in and create a household
  test('registered user can log in and create a household', function(done, server, client) {
    server.eval(function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'password'});
      emit('done');
    }).once('done', function() {
      server.eval(function() {
        Households.find().observe({
          added: function(doc) {
            emit('added', doc);
          }
        });
      });
    });

    server.once('added', function(doc) {
      assert.equal(doc.name, 'MIT');
      done();
    });

    client.eval(function() {
      Meteor.loginWithPassword('user@mit.edu', 'password', function() {
        Households.insert({name: 'MIT'}); // this is a stub - we're just checking authorization
      });
    });
  });

  // an unregistered user should be unable to create a household
  test('unregistered user cannot make a household', function(done, server, client) {
    client.eval(function() {
      Households.find().observe({
        removed: function(doc) { // unauthorized households are instantly removed
          emit('remove', doc);
        }
      });

      Households.insert({name: 'Harvard'}); // this is a stub - we're just checking authorization
    });

    client.once('remove', function(doc) {
      assert.equal(doc.name, 'Harvard');
      done();
    });
  });
});