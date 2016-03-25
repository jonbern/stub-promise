'use strict';
var expect = require('expectations');
var sinon = require('sinon');
var stubPromise = require('./index');

describe('#stubPromiseFunction()', function() {

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

  describe('spy functionality', function() {

    beforeEach(function simulateApi() {
      http.get('http://whatever');
    });

    it('exposes sinon.spy() API', function() {
      expect(http.get.called).toBe(true);
      expect(http.get.getCall(0).args[0]).toBe('http://whatever');
    });

  });

  describe('multiple calls', function() {

    var spy1;
    var spy2;
    var spy3;

    var rejectSpy1;
    var rejectSpy2;
    var rejectSpy3;

    beforeEach(function() {
      spy1 = sinon.spy();
      spy2 = sinon.spy();
      spy3 = sinon.spy();

      rejectSpy1 = sinon.spy();
      rejectSpy2 = sinon.spy();
      rejectSpy3 = sinon.spy();

      http.get('http://some-url-1').then(spy1).catch(rejectSpy1);
      http.get('http://some-url-2').then(spy2).catch(rejectSpy2);
      http.get('http://some-url-3').then(spy3).catch(rejectSpy3);
    });

    it('records all calls', function() {
      expect(http.get.callCount).toBe(3);
      expect(http.get.getCall(0).args[0]).toBe('http://some-url-1');
      expect(http.get.getCall(1).args[0]).toBe('http://some-url-2');
      expect(http.get.getCall(2).args[0]).toBe('http://some-url-3');
    });

    describe('#resolve()', function() {

      describe('when calling resolve just once', function() {

        beforeEach(function() {
          http.get.resolve('first');
        });

        describe('when resolved', function() {

          it('resolves the first promise, not the others', function() {
            expect(spy1.called).toBe(true);
            expect(spy2.called).toBe(false);
            expect(spy3.called).toBe(false);
          });

        });

      });

      describe('when calling #resolve() multiple times', function() {

        beforeEach(function() {
          http.get.resolve('first');
          http.get.resolve('second');
        });

        describe('when resolved', function() {

          it('resolves promises sequentially (first in, first out)', function() {
            expect(spy1.called).toBe(true);
            expect(spy1.getCall(0).args[0]).toBe('first');

            expect(spy2.called).toBe(true);
            expect(spy2.getCall(0).args[0]).toBe('second');

            expect(spy3.called).toBe(false);
          });

        });

      });

      describe('when calling #resolve() more times than there are calls remaining', function() {

        beforeEach(function() {
          http.get.resolve('first');
          http.get.resolve('second');
          http.get.resolve('third');
        });

        it('it throws an error', function() {
          expect(function() {
            http.get.resolve('fourth, will cause an error');
          }).toThrow(new Error('Resolve cannot be called when there are no more promises to resolve/reject'));
        });

      });

      describe('when calling #reject() more times than there are calls remaining', function() {

        beforeEach(function() {
          http.get.reject('first');
          http.get.reject('second');
          http.get.reject('third');
        });

        it('it throws an error', function() {
          expect(function() {
            http.get.reject('fourth, will cause an error');
          }).toThrow(new Error('Reject cannot be called when there are no more promises to resolve/reject'))
        });

      });

    });

    describe('#reject()', function() {

      describe('when calling #reject() just once', function() {

        beforeEach(function() {
          http.get.reject('first');
        });

        describe('when rejected', function() {

          it('reject the first promise, not the others', function() {
            expect(rejectSpy1.called).toBe(true);
            expect(rejectSpy2.called).toBe(false);
            expect(rejectSpy3.called).toBe(false);
          });

        });

      });

      describe('when calling #reject() twice and #resolve() once', function() {

        beforeEach(function() {
          http.get.reject('error1');
          http.get.resolve('no-error');
          http.get.reject('error2');
        });

        describe('when rejected/resolved', function() {

          it('reject promises sequentially', function() {
            expect(rejectSpy1.called).toBe(true);
            expect(rejectSpy1.getCall(0).args[0]).toBe('error1');

            expect(spy2.called).toBe(true)
            expect(spy2.getCall(0).args[0]).toBe('no-error');

            expect(rejectSpy3.called).toBe(true);
            expect(rejectSpy3.getCall(0).args[0]).toBe('error2');
          });

        });

      });

    });

  });

  describe('multiple invocation by re-instantiation', function() {

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
