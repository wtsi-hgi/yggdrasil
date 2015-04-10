// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var Type     = require('./interface.js'),
    isJSType = require('./isJSType.js');

// Convert subtype specification string into object
var parseSubtype = (function() {
  // TODO
  return function(subtype) {
    // TODO
  };
})();

// Textual data type
var Textual = new Type(parseSubtype);
module.exports = Textual;
