// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert   = require('assert'),
    isJSType = require('../type/isJSType');

// Note to self:
// Refactor the hell out of this to make it DRY!

var testData = {
  string:    ['', 'foo', '123'],
  number:    [0, 123, -123, 3.141, 1e3],
  boolean:   [true, false],
  undefined: [undefined],
  array:     [[], [1], [1, 2, 3]],
  object:    [{}, {foo: 123, bar: 456}],
  regexp:    [/foo/],
  date:      [new Date()],
  null:      [null]
};

var testArrayData = {
  string:    [['foo'], ['foo', 'bar']],
  number:    [[123], [123, 456]],
  boolean:   [[true], [true, false]],
  undefined: [[undefined], [undefined, undefined]],
  array:     [[[]], [[], ['foo']]],
  object:    [[{}], [{}, {foo: 'bar'}]],
  regexp:    [[/foo/], [/foo/, /bar/]],
  date:      [[new Date()], [new Date(), new Date()]],
  null:      [[null], [null, null]]
};

var testObjectData = {
  string:    [{foo: 'bar'}, {foo: 'bar', baz: 'quux'}],
  number:    [{foo: 123}, {foo: 123, baz: 456}],
  boolean:   [{foo: true}, {foo: true, baz: false}],
  undefined: [{foo: undefined}, {foo: undefined, baz: undefined}],
  array:     [{foo: []}, {foo: [], baz: ['foo']}],
  object:    [{foo: {}}, {foo: {}, baz: {foo: 'bar'}}],
  regexp:    [{foo: /bar/}, {foo: /bar/, baz: /quux/}],
  date:      [{foo: new Date()}, {foo: new Date(), baz: new Date()}],
  null:      [{foo: null}, {foo: null, baz: null}]
};

var dataTest = function(type) {
  describe('.' + type + '()', function() {
    it('should only validate ' + type + ' values', function() {
      for (t in testData) {
        for (i in testData[t]) {
          assert.equal(t == type, isJSType[type](testData[t][i]));
        }
      }
    });
  });
};

var arrayTest = function(type) {
  describe('.arrayOf.' + type + '()', function() {
    it('should only validate arrays of ' + type + ' values', function() {
      for (t in testArrayData) {
        for (i in testArrayData[t]) {
          assert.equal(t == type, isJSType.arrayOf[type](testArrayData[t][i]));
        }
      }
    });
  });
};

var objectTest = function(type) {
  describe('.objectOf.' + type + '()', function() {
    it('should only validate objects of ' + type + ' values', function() {
      for (t in testObjectData) {
        for (i in testObjectData[t]) {
          assert.equal(t == type, isJSType.objectOf[type](testObjectData[t][i]));
        }
      }
    });
  });
};

describe('isJSType Module', function() {
  for (t in testData) {
    dataTest(t);
    arrayTest(t);
    objectTest(t);
  }
});
