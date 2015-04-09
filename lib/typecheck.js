// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

// Type definition constructor from JSON
var Type = (function() {

  var isJSType = function(type, constructor) {
    return function(x) {
      return typeof x == type
          && constructor ? x.constructor == constructor : true;
    }
  };

  var parsePrimitive = (function() {
    var primitives = 'null,text,number,bool,collection'.split(',');

    return function(primitive) {
      // Simple primitive
      if (primitives.indexOf(primitive) != -1) {
        return true;

      // Enumerations
      } else if (isJSType('object', Object)(primitive)) {
        return Object.keys(primitive).every(function(k) {
                 return isJSType('string')(primitive[k]);
               });
      
      } else {
        return false;
      }
    };
  })();

  var parseSubtype = (function() {
    var subtypes = {
      // Textual subtypes
      text: function(subtype) {

      },

      // Numeric subtypes
      number: (function() {
        // This is split up into multiple regular expressions to make
        // our future lives waaaay easier!!
        var set    = /^(int|float)\b/,
            range  = /(\[|\))(.*),(.*)(\]|\))/,
            step   = /\/(.+)$/;

        // Check and return number from serialisation,
        // or fallback otherwise
        var extractNumber = (function() {
          var number = /^-?\d+(?:\.\d+)?$/;

          return function(x, fallback) {
            return number.test(x) ? parseFloat(x, 10)
                                  : fallback;
          };
        })();

        return function(subtype) {
          var match,
              params = {
                set:   'float',
                start: '(',
                min:   -Infinity,
                max:   Infinity,
                end:   ')',
                step:  null
              };
          
          // Extract set
          if (match = subtype.match(set)) {
            // $1: set
            params.set = match[1];

            // Extract range
            if (match = subtype.match(range)) {
              // $1: interval start
              // $2: interval minimum (or empty)
              // $3: interval maximum (or empty)
              // $4: interval end
              params.start = match[1];
              params.min   = extractNumber(match[2], -Infinity);
              params.max   = extractNumber(match[3], Infinity);
              params.end   = match[4];

              // Range must make sense
              if (params.max < params.min) {
                params.min = -Infinity;
                params.max = Infinity;
              }

              // Extract stepping
              if (Math.abs(params.min) != Infinity && (match = subtype.match(step))) {
                // $1: stepping
                params.step = extractNumber(match[1], null);

                // Stepping must make sense
                if (params.step <= 0) {
                  params.step = null;
                } else if (params.max != Infinity && params.step > params.max - params.min) {
                  params.step = null;
                }
              }
            }
          }
          
          return params;
        };
      })(),

      // Collection subtypes
      collection: function(subtype) {
        // TODO
        return false;
      }
    };

    return function(primitive, subtype) {
      // Standard subtypes
      if (isJSType('string')(primitive) && primitive in subtypes) {
        return subtypes[primitive](subtype || '');

      // Specified a non-defined subtype
      } else {
        return false;
      }
    }
  })();

  return parseSubtype;
  
})();

module.exports = Type;
