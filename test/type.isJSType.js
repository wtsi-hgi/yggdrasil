// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert   = require('assert'),
    isJSType = require('../type/isJSType');

var typeData = {
  string:    ['', 'foo', '123'],
  number:    [0, 123, -123, 3.141, 1e3],
  boolean:   [true, false],
  function:  [function() {}, console.log],
  undefined: [undefined],
  array:     [[], [1], [1, 2, 3]],
  object:    [{}, {foo: 123, bar: 456}],
  regexp:    [/foo/],
  date:      [new Date()],
  null:      [null]
};

var collectionData = {
  array: {
    string:    [['foo'], ['foo', 'bar']],
    number:    [[123], [123, 456]],
    boolean:   [[true], [true, false]],
    function:  [[function() {}], [function() {}, console.log]],
    undefined: [[undefined], [undefined, undefined]],
    array:     [[[]], [[], ['foo']]],
    object:    [[{}], [{}, {foo: 'bar'}]],
    regexp:    [[/foo/], [/foo/, /bar/]],
    date:      [[new Date()], [new Date(), new Date()]],
    null:      [[null], [null, null]]
  },
  object: {
    string:    [{foo: 'bar'}, {foo: 'bar', baz: 'quux'}],
    number:    [{foo: 123}, {foo: 123, baz: 456}],
    boolean:   [{foo: true}, {foo: true, baz: false}],
    function:  [{foo: function() {}}, {foo: function() {}, baz: console.log}],
    undefined: [{foo: undefined}, {foo: undefined, baz: undefined}],
    array:     [{foo: []}, {foo: [], baz: ['foo']}],
    object:    [{foo: {}}, {foo: {}, baz: {foo: 'bar'}}],
    regexp:    [{foo: /bar/}, {foo: /bar/, baz: /quux/}],
    date:      [{foo: new Date()}, {foo: new Date(), baz: new Date()}],
    null:      [{foo: null}, {foo: null, baz: null}]
  }
};

var typeTest = function(type) {
  describe('.' + type + '()', function() {
    it('should only validate ' + type + ' values', function() {
      for (t in typeData) {
        for (i in typeData[t]) {
          assert.equal(t == type, isJSType[type](typeData[t][i]));
        }
      }
    });
  });
};

// Refactor the hell out of this...
var collectionTest = function(collection, type) {
  describe('.' + collection + 'Of.' + type + '()', function() {
    it('should only validate ' + collection + 's of ' + type + ' values', function() {
      for (t in collectionData[collection]) {
        for (i in collectionData[collection][t]) {
          assert.equal(t == type, isJSType[collection + 'Of'][type](collectionData[collection][t][i]));
        }
      }
    });
  });
};

describe('JavaScript Type Checker', function() {
  for (t in typeData) {
    typeTest(t);
    collectionTest('array', t);
    collectionTest('object', t);
  }
});
