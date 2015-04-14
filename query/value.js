// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType    = require('../type/isJSType'),
    levenshtein = require('fast-levenshtein');

// Type coercion
// source is always a string, which must be coerced into target's type
// target can be string, number, Boolean or null
var coerce = function(source, target) {
  var targetType = Object.keys(isJSType).reduce(function(a, t) {
    return !a
        && isJSType.function(isJSType[t])
        && isJSType[t](target)
         ? t
         : a;
  }, false);
  
  switch(targetType) {
    case 'string':
      return String(source);
      break;

    case 'number':
      return Number(source);
      break;

    case 'boolean':
      // f(alse)/n(ull)/no/0 -> false; otherwise true
      switch(source.toLowerCase().trim()) {
        case 'false':
        case 'null':
        case 'no':
        case 'f':
        case 'n':
        case '0':
        case '':
          return false;
          break;

        default:
          return true;
          break;
      }
      break;

    case 'null':
      // Empty string -> null
      return source ? undefined : null;
      break;

    default:
      // Only applies to scalar JSON primitives
      return undefined;
  }
};

var lexicon = {
  // Conjunction clause (prefix)
  and: function(op1, op2) {
    return function(input) { return op1(input) && op2(input); }; 
  },

  // Disjunction clause (prefix)
  or: function(op1, op2) {
    return function(input) { return op1(input) || op2(input); }; 
  },

  // Negation clause (prefix)
  not: function(op) {
    return function(input) { return !op(input); };
  },

  // The comparators always get their RHS as a string, from the query.
  // Thus, where appropriate, we coerce its value to match the type of
  // the data pointed to by the LHS.

  // TODO Wildcard support on string equality

  // Equality comparator (infix)
  "=": function(lhs, rhs) {
    return function(input) {
      return input.hasOwnProperty(lhs)
          && input[lhs] == coerce(rhs, input[lhs]);
    };
  },

  // Greater than or equal to comparator (infix)
  ">=": function(lhs, rhs) {
    return function(input) {
      return input.hasOwnProperty(lhs)
          && input[lhs] >= coerce(rhs, input[lhs]);
    };
  },

  // Less than or equal to comparator (infix)
  "<=": function(lhs, rhs) {
    return function(input) {
      return input.hasOwnProperty(lhs)
          && input[lhs] <= coerce(rhs, input[lhs]);
    };
  },

  // Similarity comparator (infix; strings only)
  "~=": function(lhs, rhs) {
    var similarity = function(lhs, rhs) {
      var denominator = Math.max(lhs.length, rhs.length);

      if (denominator) {
        return 1 - (levenshtein.get(lhs, rhs) / denominator);

      } else {
        // zero denominator => two empty strings => equality
        return 1;
      }
    };

    return function(input) {
      return input.hasOwnProperty(lhs)
          && isJSType.string(input[lhs])
          && similarity(input[lhs], rhs) >= 0.75;
    };
  }
};

// Compile value query into executable AST
module.exports = (function() {
  // TODO compile AST
  // TODO execute AST
})();
