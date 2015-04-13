// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType = require('./isJSType');

// This one is relatively simple
module.exports = function(subtype) {
  var output = {
    options: isJSType.objectOf.string(subtype) ? Object.keys(subtype)
                                               : []
  };

  output.test = function(x) {
    return isJSType.string(x)
        && output.options.length
        && output.options.indexOf(x) != -1;
  };

  return output;
};
