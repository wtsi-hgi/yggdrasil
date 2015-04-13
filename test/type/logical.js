// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert  = require('assert'),
    logical = require('../../type/logical.js');

describe('Logical Type Checker', function() {
  it('should only accept Booleans', function() {
    // Not a full test suite, as just a wrapper
    var t = logical();
    assert.equal(true, t.test(true));
    assert.equal(true, t.test(false));
    assert.equal(false, t.test('foo bar'));
  });
});
