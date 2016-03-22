'use strict';
var Q = require('q');
var sinon = require('sinon');

module.exports = function() {
  var deferred = Q.defer();

  var func = sinon.stub().returns(deferred.promise);

  func.resolve = function(value) {
    deferred.resolve(value);
  }

  func.reject = function(reason) {
    deferred.reject(reason);
  }

  return func;
}
