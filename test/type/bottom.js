// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert = require('assert'),
    bottom = require('../../type/bottom.js');

describe('Bottom Type Checker', function() {
  it('should only accept null', function() {
    // Not a full test suite, as just a wrapper
    var t = bottom();
    assert.equal(true, t.test(null));
    assert.equal(false, t.test('foo bar'));
  });
});
