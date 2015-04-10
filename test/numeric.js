// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert  = require('assert'),
    numeric = require('../type/numeric.js');

describe('Numeric Type Checker', function() {
  it('should fallback to float', function() {
    var t = numeric('foobar');
    assert.equal('float',   t.set);
    assert.equal(-Infinity, t.interval.range.min);
    assert.equal(Infinity,  t.interval.range.max);
    assert.equal(false,     t.interval.strict.min);
    assert.equal(false,     t.interval.strict.max);
    assert.equal(null,      t.step);
  });

  it('should select integers', function() {
    var t = numeric('int');
    assert.equal('int', t.set);
  });

  it('should select float with an open interval', function() {
    var t = numeric('float(2,3)');
    assert.equal('float', t.set);
    assert.equal(2,       t.interval.range.min);
    assert.equal(3,       t.interval.range.max);
    assert.equal(false,   t.interval.strict.min);
    assert.equal(false,   t.interval.strict.max);
  });

  it('should select integers with a half-open interval', function() {
    var t = numeric('int(0,8]');
    assert.equal('int', t.set);
    assert.equal(0,     t.interval.range.min);
    assert.equal(8,     t.interval.range.max);
    assert.equal(false, t.interval.strict.min);
    assert.equal(true,  t.interval.strict.max);
  });

  it('should select float with a closed interval', function() {
    var t = numeric('float[-10,-5]');
    assert.equal('float', t.set);
    assert.equal(-10,     t.interval.range.min);
    assert.equal(-5,      t.interval.range.max);
    assert.equal(true,    t.interval.strict.min);
    assert.equal(true,    t.interval.strict.max);
  });

  it('should mirror intervals that are top-heavy', function() {
    var t = numeric('float(10,5]');
    assert.equal(5,     t.interval.range.min);
    assert.equal(10,    t.interval.range.max);
    assert.equal(true,  t.interval.strict.min);
    assert.equal(false, t.interval.strict.max);
  });

  it('should fallback to -Infinity when minimum endpoint is missing', function() {
    var t = numeric('int(, 12)');
    assert.equal(-Infinity, t.interval.range.min);
  });

  it('should fallback to Infinity when maximum endpoint is missing', function() {
    var t = numeric('int(12,)');
    assert.equal(Infinity, t.interval.range.max);
  });

  it('should fallback to open infinite intervals', function() {
    var t = numeric('float[,]');
    assert.equal(false, t.interval.strict.min);
    assert.equal(false, t.interval.strict.max);
  });

  it('should allow decimal interval endpoints', function() {
    var t = numeric('float(2.713,3.141)');
    assert.equal(2.713, t.interval.range.min);
    assert.equal(3.141, t.interval.range.max);
  });

  it('should allow scientific notation for endpoints', function() {
    var t = numeric('float(-3e-2,4e3)');
    assert.equal(-0.03, t.interval.range.min);
    assert.equal(4000,  t.interval.range.max);
  });

  it('should specify the stepping', function() {
    var t = numeric('float(0,10)/5');
    assert.equal(5, t.step);
  });

  it('should not allow stepping with an infinite minimum', function() {
    var t = numeric('int(,10)/2');
    assert.equal(null, t.step);
  });

  it('should allow decimal steps', function() {
    var t = numeric('float(0,10)/0.1');
    assert.equal(0.1, t.step);
  });

  it('should allow scientific notation steps', function() {
    var t = numeric('float(0,)/1e2');
    assert.equal(100, t.step);
  });

  it('should not allow zero stepping', function() {
    var t = numeric('float(0,10)/0');
    assert.equal(null, t.step);
  });

  it('should not allow negative stepping', function() {
    var t = numeric('float(0,10)/-1');
    assert.equal(null, t.step);
  });

  it('should not allow steps larger than the interval width', function() {
    var t = numeric('int[1,2]/5');
    assert.equal(null, t.step);
  });

  it('should only allow integers when specified as such', function() {
    var t = numeric('int');
    assert.equal(true,  t.test(0));
    assert.equal(true,  t.test(-1));
    assert.equal(true,  t.test(1));
    assert.equal(false, t.test(0.5));
    assert.equal(false, t.test(-1e-1));
  });

  it('should only allow values within the specified open interval', function() {
    var t = numeric('float(-5,5)');
    assert.equal(true,  t.test(0));
    assert.equal(false, t.test(-5));
    assert.equal(false, t.test(5));
  });

  it('should only allow values within the specified half-open interval', function() {
    var t = numeric('float(-5,5]');
    assert.equal(true,  t.test(0));
    assert.equal(false, t.test(-5));
    assert.equal(true,  t.test(5));
  });

  it('should only allow values within the specified closed interval', function() {
    var t = numeric('float[-5,5]');
    assert.equal(true, t.test(0));
    assert.equal(true, t.test(-5));
    assert.equal(true, t.test(5));
  });

  it('should only allow values at the specified stepping (even integers)', function() {
    var t = numeric('int[0,)/2');
    assert.equal(true,  t.test(0));
    assert.equal(false, t.test(1));
    assert.equal(true,  t.test(2));
  });

  it('should only allow values at the specified stepping (quarters)', function() {
    var t = numeric('float[0,1)/0.25');
    assert.equal(true,  t.test(0));
    assert.equal(true,  t.test(0.25));
    assert.equal(true,  t.test(0.5));
    assert.equal(false, t.test(0.6));
    assert.equal(true,  t.test(0.75));
    assert.equal(false, t.test(1));
  });
});
