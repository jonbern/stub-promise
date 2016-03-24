'use strict';
var Q = require('q');
var sinon = require('sinon');

module.exports = function() {
  var calls = [];

  var func = function() {
    var deferred = Q.defer();
    calls.push(deferred);
    return deferred.promise;
  };

  func.resolve = function(value) {
    if (calls.length > 0) {
      calls.shift().resolve(value);
    } else {
      throw 'Resolve cannot be called when there are no more promises to resolve/reject';
    }
  };

  func.reject = function(reason) {
    if (calls.length > 0) {
      calls.shift().reject(reason);
    } else {
      throw 'Reject cannot be called when there are no more promises to resolve/reject';
    }
  };

  return sinon.spy(func);
}
