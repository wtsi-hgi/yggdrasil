// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert = require('assert'),
    keys   = require('../../query/keys');

var test = {foo: 'bar', baz: 'quux'};

describe('Key Query Parser', function() {
  it('should select specified keys (1/3)', function() {
    var filtered = keys('foo', test),
        fKeys = Object.keys(filtered);

    assert.deepEqual(['foo'], fKeys);
    assert.deepEqual({foo: 'bar'}, filtered);
  });

  it('should select specified keys (2/3)', function() {
    var filtered = keys('baz', test),
        fKeys = Object.keys(filtered);

    assert.deepEqual(['baz'], fKeys);
    assert.deepEqual({baz: 'quux'}, filtered);
  });

  it('should select specified keys (3/3)', function() {
    var filtered = keys('baz,foo', test),
        fKeys = Object.keys(filtered);

    assert.deepEqual(['baz', 'foo'], fKeys);
    assert.deepEqual(test, filtered);
  });

  it('should ignore spaces between keys', function() {
    var filtered = keys('  baz ,     foo ', test);
    assert.deepEqual(test, filtered);
  });

  it('should ignore non-existant keys', function() {
    var filtered = keys('bar,foo,quux', test),
        fKeys = Object.keys(filtered);

    assert.deepEqual(['foo'], fKeys);
    assert.deepEqual({foo: 'bar'}, filtered);
  });

  it('should fallback to returning everyting (1/2)', function() {
    var filtered = keys('', test);
    assert.deepEqual(test, filtered);
  });

  it('should fallback to returning everyting (2/2)', function() {
    var filtered = keys('quux,boo!', test);
    assert.deepEqual(test, filtered);
  });
});
