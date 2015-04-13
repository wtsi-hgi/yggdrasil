// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var assert  = require('assert'),
    textual = require('../type/textual');

describe('Textual Type Checker', function() {
  it('should validate any free text', function() {
    var t = textual()
    assert.equal(true, t.test('foo bar!'));
  });

  it('should validate by regular expression', function() {
    var pattern = '^(foo|bar)$',
        t = textual('/' + pattern);

    assert.equal(pattern, t.pattern);
    assert.equal(true, t.test('foo'));
    assert.equal(true, t.test('bar'));
    assert.equal(false, t.test('foo bar'));
  });

  it('should validate dates and date-times', function() {
    var t = textual('datetime');
    assert.equal('datetime', t.pattern);
    assert.equal(true, t.test('1981-09-25'));
    assert.equal(true, t.test('1981-09-25t05:55:00z+00:00'));
    assert.equal(true, t.test('1981-09-25t05:55:00.123z+00:00'));
    assert.equal(false, t.test('2015'));
    assert.equal(false, t.test('foo bar'));
    assert.equal(false, t.test('2015-01-45'));
    assert.equal(false, t.test('2015-20-01'));
    assert.equal(false, t.test('2015-04-13T00:00'));
    assert.equal(false, t.test('2015-04-13T01:02:03'));
    assert.equal(false, t.test('2015-04-13T01:02:03z+04'));
    assert.equal(false, t.test('2015-04-13T00:00:00Z+00:99'));
    assert.equal(false, t.test('2015-04-13T00:00:00Z+99:00'));
    assert.equal(false, t.test('2015-04-13T00:00:99Z+00:00'));
    assert.equal(false, t.test('2015-04-13T00:99:00Z+00:00'));
    assert.equal(false, t.test('2015-04-13T99:00:00Z+00:00'));
  });

  it('should validate base64 encoded data', function() {
    var t = textual('media/type');
    assert.equal('media/type', t.pattern);
    assert.equal(true, t.test(Buffer('foo bar').toString('base64')));
    assert.equal(false, t.test('foo bar'));
  });

  it('should validate IRIs', function() {
    // Not a full test suite, as just a wrapper
    var t = textual('iri');
    assert.equal('iri', t.pattern);
    assert.equal(true, t.test('http://www.sanger.ac.uk'));
    assert.equal(true, t.test('https://www.google.com/foo'));
    assert.equal(true, t.test('/absolute/path'));
    assert.equal(false, t.test('foo'));
  });

  it('should validate e-mail addresses', function() {
    // Not a full test suite, as just a wrapper
    var t = textual('email');
    assert.equal('email', t.pattern);
    assert.equal(true, t.test('foo@example.com'));
    assert.equal(true, t.test('foo.bar@some.domain.foo'));
    assert.equal(false, t.test('foo.bar AT some.domain.foo'));
  });
});
