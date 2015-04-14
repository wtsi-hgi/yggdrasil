// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType   = require('./isJSType'),
    parseEMail = require('email-addresses');

// Convert subtype specification string into object
module.exports = (function() {
  // Complex patterns
  var is = {
    regExp: function(type) {
      var pattern = /^\/(.*)$/;
      return (type.match(pattern) || [, false])[1];
    },

    mediaType: function(type) {
      // per RFC6838
      var pattern = /^[a-z0-9][a-z0-9!#$&^_.+-]{0,126}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,126}$/i;
      return pattern.test(type) && type;
    }
  };

  // Standard patterns
  ['datetime', 'iri', 'email'].forEach(function(t) {
    is[t] = function(type) { return type == t && type; };
  });

  // Subtype classifier
  var classify = function(type) {
    return type && Object.keys(is).reduce(function(a, t) {
      return !a && is[t](type) !== false ? t : a;
    }, undefined);
  };

  // Validation functions
  var validate = {
    // Validate by regular expression
    regExp: function(pattern) {
      var re = new RegExp(pattern);
      return function(input) { return re.test(input); }
    },

    // Validate base64 encoded data
    mediaType: function() {
      var re = /^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{2}==|[a-z0-9+/]{3}=)?$/i;
      return function(input) { return re.test(input); }
    },

    // Validate ISO 8601 date-time per RFC3339
    datetime: function() {
      var fullDate = /^\d{4}-\d{2}-\d{2}$/,
          fullTime = /^(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?z[+-](\d{2}):(\d{2})$/i;

      var between = function(x, a, b) {
        return x >= a && x <= b;
      };

      var checkDate = function(input) {
        // Check the format by regexp, but use JS to parse...
        // That said, Date.parse is really bloody stupid: It will parse
        // every month as having 31 days, then just add the difference
        // to the next month! For example, 2000-02-31 = 2nd March 2000
        return fullDate.test(input)
            && Date.parse(input) ? true : false;
      };

      var checkDateTime = function(input) {
        // Check the time by regexp
        var parts = input.split(/t/i),
            match = (parts[1] || '').match(fullTime);

        // $1 = hours
        // $2 = minutes
        // $3 = seconds
        // $4 = hour offset
        // $5 = minute offset

        return checkDate(parts[0])
            && (match ? true : false)
            && between(parseInt(match[1], 10), 0, 23)
            && between(parseInt(match[2], 10), 0, 59)
            && between(parseInt(match[3], 10), 0, 59)
            && between(parseInt(match[4], 10), 0, 23)
            && between(parseInt(match[5], 10), 0, 59);
      };

      return function(input) {
        return checkDate(input) || checkDateTime(input);
      }
    },

    // Vacuously validate IRIs
    // i.e., Any string could be an IRI, but we just mark it as such
    // so that is has semantics that differ from free text
    iri: function() { return function() { return true; } },

    // Validate e-mails
    email: function() {
      return function(input) {
        return parseEMail(input) ? true : false;
      }
    }
  };
  
  // Classify and Checker
  return function(subtype) {
    var output = {}
        t = classify(subtype);
  
    if (t) {
      output.pattern = is[t](subtype);
      output.test = function(x) {
        return isJSType.string(x)
            && validate[t](output.pattern)(x);
      }

    } else {
      // Vacuously validate free text (presuming it's a string)
      output.test = isJSType.string;
    }

    return output;
  };
})();
