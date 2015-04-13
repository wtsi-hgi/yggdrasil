// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert = require('assert'),
    slice  = require('../../query/slice');

describe('Slice Query Parser', function() {
  it('should accept defined endpoints', function() {
    var t = slice('1:5');
    assert.equal(2, t.length);
    assert.equal(1, t[0]);
    assert.equal(5, t[1]);
  });

  it('should understand an omitted inital point as the collection start', function() {
    var t = slice(':5');
    assert.equal(2, t.length);
    assert.equal(0, t[0]);
    assert.equal(5, t[1]);
  });

  it('should understand an omitted terminal point as the collection end', function() {
    var t = slice('1:');
    assert.equal(1, t.length);
    assert.equal(1, t[0]);
  });

  it('should understand omitted indices to be the whole collection', function() {
    var t = slice(':');
    assert.equal(0, t.length);
  });

  it('should mirror indices that are top-heavy', function() {
    var t = slice('5:1');
    assert.equal(2, t.length);
    assert.equal(1, t[0]);
    assert.equal(5, t[1]);
  });

  it('should fallback to an open-ended slice if the indicies are the same', function() {
    var t = slice('1:1');
    assert.equal(1, t.length);
    assert.equal(1, t[0]);
  });

  it('should fallback to the whole collection when given nonsense', function() {
    var t = slice('foo:bar');
    assert.equal(0, t.length);
  });
});
