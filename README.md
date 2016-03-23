# stub-promise-function
A tiny test utility that lets you stub functions that return promises and manage the control flow of the returned promise.

## npm package

```javascript
npm install stub-promise-function --save-dev
```

## Example

```javascript
var stubPromiseFunction = require('stub-promise-function');

// code under test
function getUsers() {
  http.get('/users.html').then(function(response) {
      console.log(response.data);
    });
};

// test code
describe('#getUsers()', function() {

  beforeEach(function() {
    http.get = stubPromiseFunction();
    sinon.spy(console, 'log');
  });

  beforeEach(function() {
    getUsers();
  });

  it('uses http to get users', () => {
    expect(http.get.called).toBe(true);
    expect(http.get.getCall(0).args[0]).toBe('/users.html');
  });

  describe('when getUsers resolves', function() {

    beforeEach(function() {
      var response = {
        data: 'foo'
      }
      http.get.resolve(response);
    });

    describe('when resolved', function() {

      it('logs response.data to console', function() {
        expect(console.log.getCall(0).args[0]).toBe('foo');
      });

    });

  });

});
```

## Documentation

```javascript
describe('#stubPromiseFunction()', function() {

  var http;
  var promise;

  beforeEach(function() {
    http = {
      get: stubPromiseFunction()
    };
  });

  it('returns a function which returns a promise', function() {
    promise = http.get();
    expect(promise.then).toBeDefined();
    expect(typeof promise.then === "function");
  });

  describe('returned promise', function() {

    beforeEach(function() {
      promise = http.get('http://whatever');
    });

    it('has a #resolve function', function() {
      expect(http.get.resolve).toBeDefined();
      expect(typeof promise.resolve === "function");
    });

    it('has a #reject function', function() {
      expect(http.get.reject).toBeDefined();
      expect(typeof promise.reject === "function");
    });

    describe('#resolve()', function() {

      it('resolves the promise', function(done) {
        var expectedResponse = { data: 42 };

        promise.then(function(response) {
          expect(response).toEqual(expectedResponse);
          done();
        });

        http.get.resolve(expectedResponse);
      });

    });

    describe('#reject()', function() {

      it('rejects the promise', function(done) {
        var expectedReason = 'some reason why';

        promise.catch(function(error) {
          expect(error).toEqual(expectedReason);
          done();
        });

        http.get.reject(expectedReason);
      });

    });

  });

  describe('spy functionality (using sinon.spy internally)', function() {

    beforeEach(function simulateApi() {
      http.get('http://whatever');
    });

    it('can be used together with test spies', function() {
      expect(http.get.called).toBe(true);
      expect(http.get.getCall(0).args[0]).toBe('http://whatever');
    });

  });

  describe('multiple invocation by re-instantiation', function() {

    var http;
    var promise;

    beforeEach(function() {
      http = {
        get: stubPromiseFunction()
      };

      promise = http.get('http://whatever');

      promise.then(function(response) {
        expect(response.data).toEqual(42);
      })

      http.get.resolve({
        data: 42
      });

    });

    it('can be reinstantiated and then resolved', function() {
      http.get = stubPromiseFunction();

      promise = http.get('http://another');

      promise.then(function(response) {
        expect(response.data).toEqual(84);
      })

      http.get.resolve({
        data: 82
      });

    });

  });

});
```
