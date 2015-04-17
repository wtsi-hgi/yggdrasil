// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var isJSType    = require('../type/isJSType'),
    levenshtein = require('fast-levenshtein');

// Type coercion
// source is always a string, which must be coerced into target's type;
// target can be string, number, Boolean or null
var coerce = function(source, target) {
  switch(isJSType.whatIs(target)) {
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

// Functional lexicon, the members of which are used to make up the
// nodes of the parsed AST
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

  // Equality comparator (infix)
  // Supports * (any) and ? (single) wildcards, escaped using \, on strings
  "=": function(lhs, rhs) {
    var hasWildcards = function(input) {
      return /(?:[^\\]|^)[*?]/g.test(input);
    };

    var matchWildcard = function(pattern, input) {
      // DRAGONS BE HERE...
      // First we escape all potent regexp punctuation
      // Reverse the string because JS only supports -ve lookaheads
      // Replace our escaped punctuation with regexp equivalents
      // Unescape any double-escaped punctuation
      // Unescape any double-escaped wildcards
      // Reverse the string back (hence *. rather than .*)
      // Anchor the pattern to match the whole string
      var re = pattern.replace(/[\\^$+.*?()|{}[\]]/g, '\\$&')
                      .split('').reverse().join('')
                      .replace(/(\*\\(?!\\))+/g, '*.')
                      .replace(/\?\\(?!\\)/g, '.')
                      .replace(/([*?])\\\\/g, '$1')
                      .replace(/(?:(\*)|\?)\\\\\\(?!\\)/g, '$1.\\')
                      .split('').reverse().join('')
                      .replace(/^.*$/, '^$&$');

      return RegExp(re).test(input);
    };

    return function(input) {
      return input.hasOwnProperty(lhs)
          && (hasWildcards(rhs) ? matchWildcard(rhs, input[lhs])
                                : input[lhs] == coerce(rhs, input[lhs]));
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

// Parser
var grammar = {
  // expression = "(" ( clause / predicate ) ")"
  expression: function(tokens) {
    // TODO
  },

  // clause = conjugation / disjunction / negation
  clause:function(tokens) {
    // TODO
  },

  // conjunction = "and" expression expression
  conjunction: function(tokens) {
    // TODO
  },

  // disjunction = "or" expression expression
  disjunction: function(tokens) {
    // TODO
  },

  // negations = "not" expression
  negation: function(tokens) {
    // TODO
  },

  // predicate = key comparator value
  predicate: function(tokens) {
    // TODO
  },

  // key = <JSON has key>
  key: function(tokens) {
    // TODO
  },

  // comparator = [ "<" / ">" / "~" ] "="
  comparator: function(tokens) {
    // TODO
  },

  // value = <arbitrary, escaped string>
  value: function(tokens) {
    // TODO
  }
};

// Consume an escaped string and convert into an array of tokens, by
// delimiter and unescaped strings... This is a bit messy :P
var tokenise = (function() {
  var isDelimiter = /^[()<>~=]$/, isLongDelim = /^[<>~]$/,
      T = function(delim, value) { return {delim: delim, val: value}; };

  return function(input) {
    var i = 0, n = input.length,
        thisC, nextC, lastI, newT,
        out = [];

    while (i < n) {
      thisC = input.substr(i, 1);
      nextC = input.substr(i + 1, 1);
      newT  = undefined;
      ++i;

      // Deal with escape sequences
      if (thisC == '\\') {
        if (nextC) {
          ++i;
          
          // Special escape sequences
          switch (nextC) {
            case 'n': nextC = '\n'; break;
            case 'r': nextC = '\r'; break;
            case 't': nextC = '\t'; break;
          }

          if (lastI !== undefined ? out[lastI].delim : true) {
            // Context switch
            newT = T(false, nextC);
          } else {
            out[lastI].val += nextC;
          }
        } else {
          // Break the loop on an invalid escape sequence
          break;
        }

      // Non-escaped characters
      } else {
        if (isDelimiter.test(thisC)) {
          if (lastI !== undefined && out[lastI].delim && thisC == '=' && isLongDelim.test(out[lastI].val)) {
            out[lastI].val += thisC;
          } else {
            // Context switch
            newT = T(true, thisC);
          }
        } else {
          if (lastI !== undefined && !out[lastI].delim) {
            out[lastI].val += thisC;
          } else {
            // Context switch
            newT = T(false, thisC);
          }
        }
      }

      if (newT) { lastI = out.push(newT) - 1; }
    }

    return out;
  };
})();

// Compile query into executable AST
module.exports = function(source) {
  var tokens = tokenise(source),
      ast    = grammar.expression(tokens);

  if (isJSType.function(ast)) {
    // Successfully compiled
    return function(input) {
      return isJSType.object(input)
          && ast(input);
    }

  } else {
    // Compilation failure
    return undefined;
  }
};
