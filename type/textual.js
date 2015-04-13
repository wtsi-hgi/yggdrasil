// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType = require('./isJSType');

// Convert subtype specification string into object
module.exports = (function() {
  // Complex patterns
  var is = {
    regExp: function(type) {
      var pattern = /^\/(.*)$/;
      return (type.match(pattern) || [, false])[1];
    },

    mediaType: function(type) {
      var pattern = /^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$/i;
      return pattern.test(type) && type;
    }
  };

  // Set patterns
  ['datetime', 'iri', 'email'].forEach(function(t) {
    is[t] = function(type) { return type == t && type; };
  });

  // Subtype classifier
  var classify = function(type) {
    return type && Object.keys(is).reduce(function(a, t) {
      return !a && is[t](type) !== false ? t : a;
    }, false);
  };

  // Validation functions
  var validate = {
    // Validate by regular expression
    regExp: function(pattern) {
      return function(input) {
        return true;
      }
    },

    // Validate base64 encoded data
    mediaType: function() {
      return function(input) {
        return true;
      }
    },

    // Validate ISO8601 date-time
    datetime: function() {
      return function(input) {
        return true;
      }
    },

    // Validate IRIs
    iri: function() {
      return function(input) {
        return true;
      }
    },

    // Validate e-mails
    email: function() {
      return function(input) {
        return true;
      }
    }
  };
  
  // Classify and Checker
  return function(subtype) {
    var output = {}
        t = classify(subtype);
  
    if (t) {
      output.pattern = is[t](subtype);
      output.test = validate[t](output.pattern);

    } else {
      // Vacuously validate free text
      output.test = function() { return true; }
    }

    return output;
  };
})();
