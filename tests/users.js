var assert = require('assert');

suite('Server -', function() {
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

  test('only allow one account per email', function(done, server) {
    var error = server.evalSyncExpectError('form validation', function() {
      Accounts.createUser({email: 'user@mit.edu', password: 'account1'});
      Accounts.createUser({email: 'user@mit.edu', password: 'account2'});
      emit('return');
    });

    assert.ok(error.message.match(/Email already exists/));
    done();
  });
});