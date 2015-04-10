// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert   = require('assert'),
    isJSType = require('../type/isJSType.js');

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

var testType = function(type) {
  describe('#' + type + '()', function() {
    it('should only validate ' + type + ' values', function() {
      for (t in testData) {
        for (i in testData[t]) {
          assert.equal(t == type, isJSType[type](testData[t][i]));
        }
      }
    });
  });
};

describe('isJSType', function() {
  for (t in testData) {
    testType(t); 
  }
});
