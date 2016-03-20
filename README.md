# stub-promise
A tiny test utility that lets you stub promises and manage their control flow

It can be used to stub functions that return promises, for instance a "http" object that has a get() function which is implemented using a promise.

stubPromise() returns an actual promise, but in addition it adds resolve() and reject() to the method it stubs, so that you can manage the control flow in your tests. For instance, http.get.resolve({data: 42:}) will resolve a http.get(http://whatever).

## npm package

```
npm install stub-promise --save-dev
```

## Usage

```
var expect = require('expectations');
var sinon = require('sinon');
var stubPromise = require('./index');

describe('stubPromise', function() {

  var http;
  var promise;

  beforeEach(function() {
    http = {
      get: stubPromise()
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

  describe('test spy example', function() {

    beforeEach(function() {
      sinon.spy(http, 'get');
    });

    beforeEach(function simulateApi() {
      http.get('http://whatever');
    });

    it('can be used together with test spies', function() {
      expect(http.get.called).toBe(true);
      expect(http.get.getCall(0).args[0]).toBe('http://whatever');
    });

  });

  describe('multiple invocation by re-instantiation example', function() {

    var http;
    var promise;

    beforeEach(function() {
      http = {
        get: stubPromise()
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
      http.get = stubPromise();

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
