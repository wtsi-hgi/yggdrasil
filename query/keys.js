// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType = require('../type/isJSType');

var explode = function(query) {
  // Split query by comma and filter out null-strings
  return query.trim()
              .split(/\s*,\s*/)
              .filter(function(x) { return x; });
};

// Key Query Parser
// It might be nice to use, say, Object.prototype.filter() but
// overloading default objects is generally not cool
module.exports = function(query, input) {
  if (!isJSType.string(query) || !isJSType.object(input)) {
    throw new TypeError('Invalid arguments');
  }

  var output = {},
      empty  = true;

  explode(query).forEach(function(key) {
    if (input.hasOwnProperty(key) && !output.hasOwnProperty(key)) {
      output[key] = input[key];
      empty = false;
    }
  });

  // If no matches were found, then we return everything
  return empty ? input : output;
};
