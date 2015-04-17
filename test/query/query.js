// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert = require('assert'),
    query  = require('../../query/query');

describe('Query Compiler', function() {
  it('should validate a simple equality predicate', function() {
    var t = query('(foo=bar)');
    assert.equal(false, t({}));
    assert.equal(true,  t({foo: 'bar'}));
    assert.equal(false, t({foo: 'baz'}));
  });

  it('should validate a simple equality predicate with a \'?\' wildcard', function() {
    var t = query('(foo=bar?)');
    assert.equal(false, t({}));
    assert.equal(true,  t({foo: 'barX'}));
    assert.equal(false, t({foo: 'bar'}));
  });

  it('should validate a simple equality predicate with a \'*\' wildcard', function() {
    var t = query('(foo=bar*)');
    assert.equal(false, t({}));
    assert.equal(true,  t({foo: 'bar'}));
    assert.equal(true,  t({foo: 'barX'}));
    assert.equal(true,  t({foo: 'barXXX'}));
    assert.equal(false, t({foo: 'ba'}));
  });

  it('should validate a simple inequality predicate (GTE)', function() {
    var t = query('(foo>=0)');
    assert.equal(true, t({foo: 'bar'}));  // 'bar' >= '0' (type coercion)
    assert.equal(true, t({foo: 0}));
    assert.equal(true, t({foo: 5}));
  });

  it('should validate a simple inequality predicate (LTE)', function() {
    var t = query('(foo<=0)');
    assert.equal(false, t({foo: 'bar'}));  // 'bar' <= '0' (type coercion)
    assert.equal(true,  t({foo: 0}));
    assert.equal(true,  t({foo: -5}));
  });

  it('should validate a simple similarity predicate (relative Levenshtein)', function() {
    var t = query('(foo~=quux)');
    assert.equal(false, t({foo: 'something completely different'}));
    assert.equal(true,  t({foo: 'quux'}));
    assert.equal(true,  t({foo: 'quuz'}));
  });

  it('should validate a conjunction', function() {
    var t = query('(and(foo=bar)(baz=quux))');
    assert.equal(false, t({foo: 'quux', baz: 'bar'}));
    assert.equal(true,  t({foo: 'bar',  baz: 'quux'}));
  });

  it('should validate a disjunction', function() {
    var t = query('(or(foo=bar)(foo=baz))');
    assert.equal(false, t({foo: 'quux'}));
    assert.equal(true,  t({foo: 'bar'}));
    assert.equal(true,  t({foo: 'baz'}));
  });

  it('should validate a negation', function() {
    var t = query('(not(foo=bar))');
    assert.equal(false, t({foo: 'bar'}));
    assert.equal(true,  t({foo: 'baz'}));
  });

  it('should validate a complex clause', function() {
    var t = query('(or(not(foo=bar))(and(foo=bar)(baz=quux)))');
    assert.equal(true,  t({foo: 'bar',  baz: 'quux'}));
    assert.equal(false, t({foo: 'bar',  baz: 'foo'}));
    assert.equal(true,  t({foo: 'quux', baz: 'bar'}));
  });
});
