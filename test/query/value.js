// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var value = require('../../query/value');

describe('Value Query Compiler', function() {
  it('should validate a simple equality predicate', function() {
    var t = value('(foo=bar)');
    assert.equal(false, {});
    assert.equal(true,  t.test({foo: 'bar'}));
    assert.equal(false, t.test({foo: 'baz'}));
  });

  it('should validate a simple inequality predicate (GTE)', function() {
    var t = value('(foo>=0)');
    assert.equal(false, t.test({foo: 'bar'}));
    assert.equal(true,  t.test({foo: 0}));
    assert.equal(true,  t.test({foo: 5}));
  });

  it('should validate a simple inequality predicate (LTE)', function() {
    var t = value('(foo<=0)');
    assert.equal(false, t.test({foo: 'bar'}));
    assert.equal(true,  t.test({foo: 0}));
    assert.equal(true,  t.test({foo: -5}));
  });

  it('should validate a simple similarity predicate (Levenshtein)', function() {
    var t = value('(foo~=bar)');
    assert.equal(false, t.test({foo: 'quux'}));
    assert.equal(true,  t.test({foo: 'bar'}));
    assert.equal(true,  t.test({foo: 'baz'}));
  });

  it('should validate a conjunction', function() {
    var t = value('(and(foo=bar)(baz=quux))');
    assert.equal(false, t.test({foo: 'quux', baz: 'bar'}));
    assert.equal(true,  t.test({foo: 'bar',  baz: 'quux'}));
  });

  it('should validate a disjunction', function() {
    var t = value('(or(foo=bar)(foo=baz))');
    assert.equal(false, t.test({foo: 'quux'}));
    assert.equal(true,  t.test({foo: 'bar'}));
    assert.equal(true,  t.test({foo: 'baz'}));
  });

  it('should validate a negation', function() {
    var t = value('(not(foo=bar))');
    assert.equal(false, t.test({foo: 'bar'}));
    assert.equal(true,  t.test({foo: 'baz'}));
  });

  it('should validate a complex clause', function() {
    var t = value('(or(not(foo=bar))(and(foo=bar)(baz=quux)))');
    assert.equal(true,  t.test({foo: 'bar',  baz: 'quux'}));
    assert.equal(false, t.test({foo: 'bar',  baz: 'foo'}));
    assert.equal(true,  t.test({foo: 'quux', baz: 'bar'}));
  });
});
