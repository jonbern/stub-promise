var expect = require('expectations');
var sinon = require('sinon');
var stubPromiseFunction = require('./');

var http = {
  get: function() {
    // simulates a http module with a GET function
  }
};
var someFunction = function() {};

// code under test
function getUsers() {
  http.get('/users.html').then(function(response) {
      someFunction(response);
    });
};

// test code
describe('#getUsers()', function() {

  beforeEach(function() {
    someFunction = sinon.spy();
    http.get = stubPromiseFunction();
  });

  beforeEach(function() {
    getUsers();
  });

  it('uses http to get users', () => {
    expect(http.get.called).toBe(true);
    expect(http.get.getCall(0).args[0]).toBe('/users.html');
  });

  describe('when http.get resolves', function() {

    var response;

    beforeEach(function() {
      response = {
        data: 'foo'
      }
      http.get.resolve(response);
    });

    describe('when resolved', function() {

      it('invokes someFunction', function() {
        expect(someFunction.called).toBe(true);
        expect(someFunction.getCall(0).args[0]).toBe(response);
      });

    });

  });

});

describe('multiple calls', function() {

  beforeEach(function() {
    someFunction = sinon.spy();
    http.get = stubPromiseFunction();
  });

  beforeEach(function() {
    getUsers();
    getUsers();
  });

  describe('resolving multiple calls', function() {

    var response1;
    var response2;

    beforeEach(function() {
      response1 = {
        data: 'Jon'
      };
      http.get.resolve(response1)

      response2 = {
        data: 'Ana'
      };
      http.get.resolve(response2)
    });

    describe('when resolved', function() {

      it('it has resolved both http get calls', function() {
        expect(someFunction.callCount).toBe(2);
        expect(someFunction.getCall(0).args[0]).toBe(response1);
        expect(someFunction.getCall(1).args[0]).toBe(response2);
      });

    });

  });

});
