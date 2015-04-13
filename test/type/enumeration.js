// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert      = require('assert'),
    enumeration = require('../../type/enumeration');

describe('Enumeration Type Checker', function() {
  it('should only accept objects of string', function() {
    var t = enumeration({foo: 'bar', baz: 'quux'});
    assert.deepEqual(['foo', 'baz'], t.options);
    assert.equal(true, t.test('foo'));
    assert.equal(true, t.test('baz'));
    assert.equal(false, t.test('foobar'));
  });

  it('should fallback to having no options', function() {
    var t = enumeration('foo bar');
    assert.deepEqual([], t.options);
    assert.equal(false, t.test('foo'));
  });
});
