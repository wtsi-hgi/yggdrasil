// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType = require('./isJSType');

// Convert subtype specification string into object
module.exports = (function() {
  // This is split up into multiple regular expressions to make
  // our future lives waaaay easier!!
  var set    = /^(int|float)\b/,
      range  = /([[(])(.*),(.*)([\])])/,
      step   = /\/(.+)$/;
        
  // Check and return number from serialisation, otherwise fallback
  // n.b., Supports integer, floating point and "scientific" notation
  var extractNumber = (function() {
    var number = /^-?\d+(?:\.\d+)?(?:e-?\d+)?$/i;

    return function(x, fallback) {
      return number.test(x) ? parseFloat(x) : fallback;
    };
  })();

  // Simple check for integers
  var isInteger = function(x) {
    return Math.floor(x) == x;
  };

  // Real bounded interval constructor
  var Interval = function(lTerm, min, max, rTerm) {
    var strict,
        lBoundary = /^[[(]$/,
        rBoundary = /^[\])]$/;

    // Type check arguments
    if (!isJSType.string(lTerm) || !isJSType.string(rTerm)) {
      throw new TypeError('Invalid interval: Terminals must be strings');
    } else {
      if (!lBoundary.test(lTerm) || !rBoundary.test(rTerm)) {
        throw new TypeError('Invalid interval: Must be open, half-open or closed');
      }
    }

    if (!isJSType.number(min) || !isJSType.number(max)) {
      throw new TypeError('Invalid interval: Endpoints must be numeric');
    }

    // If specified the wrong way around, then just mirror everything
    // i.e., Don't consider this to be an empty set
    if (max < min) (function() {
      var tmp = rTerm;
      
      switch(lTerm) {
        case '(': rTerm = ')'; break;
        case '[': rTerm = ']'; break;
      }
      
      switch(tmp) {
        case ')': lTerm = '('; break;
        case ']': lTerm = '['; break;
      }

      tmp = min; min = max; max = tmp;
    })();

    // For the sake of mathematical purity (the best kind), infinite
    // endpoints must be strict inequalities
    if (min == -Infinity && lTerm == '[') { lTerm = '('; }
    if (max ==  Infinity && rTerm == ']') { rTerm = ')'; }

    this.range = { min: min, max: max }
    this.strict = strict = { min: lTerm == '[', max: rTerm == ']' };

    // Check if x is an element of the interval
    this.test = function(x) {
      if (!isJSType.number(x)) {
        throw new TypeError('Interval is numeric');
      }
    
      return (x > min || (strict.min && x == min))
          && (x < max || (strict.max && x == max));
    };

    this.toString = function() {
      return lTerm + min + ',' + max + rTerm;
    }
  };

  // Parser and Checker
  return function(subtype) {
    var match,
        output = {
          set:      'float',
          interval: new Interval('(', -Infinity, Infinity, ')'),
          step:     null
        };

    // Extract set
    if (match = subtype.match(set)) {
      // $1 = set
      output.set = match[1]

      // Extract range
      if (match = subtype.match(range)) {
        // $1 = left terminal
        // $2 = minimum (or empty)
        // $3 = maximum (or empty)
        // $4 = right terminal
        output.interval = new Interval(
          match[1],
          extractNumber(match[2], -Infinity),
          extractNumber(match[3],  Infinity),
          match[4]
        );

        // Extract stepping (if it makes sense)
        if (output.interval.range.min != -Infinity) {
          if (match = subtype.match(step)) {
            // $1 = step
            match = extractNumber(match[1], 0);
            if (match > 0) {
              if (match <= output.interval.range.max - output.interval.range.min) {
                output.step = match;
              }
            }
          }
        }
      }
    }

    // Check if x is in the set
    output.test = function(x) {
      // Type check arguments
      if (!isJSType.number(x)) {
        throw new TypeError('Type is numeric');
      }

      // Check integers
      if (output.set == 'int' && !isInteger(x)) {
        return false;
      }

      // Check interval membership
      if (!output.interval.test(x)) {
        return false;
      }

      // Check stepping
      // FIXME This isn't resilient to floating point rounding
      if (output.step) {
        if (!isInteger((x - output.interval.range.min) / output.step)) {
          return false;
        }
      }

      return true;
    };

    return output;
  };
})();
