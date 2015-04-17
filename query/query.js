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
    var equals;

    if (/(?:[^\\]|^)(?:\\\\)*[*?]/.test(rhs)) {
      // DRAGONS BE HERE...
      // First we escape all potent regexp punctuation
      // Reverse the string because JS only supports -ve lookAHEADs
      // Replace our escaped punctuation with regexp equivalents
      // Unescape any double-escaped punctuation
      // Unescape any double-escaped wildcards
      // Reverse the string back (hence *. rather than .*)
      // Anchor the pattern to match the whole string
      rhs = new RegExp(rhs.replace(/[\\^$+.*?()|{}[\]]/g, '\\$&')
                          .split('').reverse().join('')
                          .replace(/(\*\\(?!\\))+/g, '*.')
                          .replace(/\?\\(?!\\)/g, '.')
                          .replace(/([*?])\\\\/g, '$1')
                          .replace(/(?:(\*)|\?)\\\\\\(?!\\)/g, '$1.\\\\')
                          .split('').reverse().join('')
                          .replace(/^.*$/, '^$&$'));

      equals = function(input) { return rhs.test(input); }

    } else {
      // Unescape input for simple equality
      rhs = rhs.replace(/\\(.)/g, '$1');
      equals = function(input) { return input == coerce(rhs, input); };
    }

    return function(input) {
      return input.hasOwnProperty(lhs)
          && equals(input[lhs])
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
// All functions take an input token array and return an object with
// either one or two properties:
// * tokens  The remaining tokens left to parse, equal to the input
//           array in the event of a parse error.
// * exec    The compiled input, if everything worked out. Otherwise,
//           this property won't be present.
var grammar = {
  // expression = "(" ( clause / predicate ) ")"
  expression: function(tokens) {
    var t, original = tokens.slice(),
        expression;

    if ((t = tokens.shift()) && t.delim && t.val == '(') {
      // Found the opening parenthesis
      expression = grammar.clause(tokens);
      if (!expression.exec) {
        // Not a clause, so try a predicate
        expression = grammar.predicate(expression.tokens);
      }

      if (expression.exec) {
        // Found a clause or predicate
        if ((t = expression.tokens.shift()) && t.delim && t.val == ')') {
          // Found the closing parenthesis... yay!
          return expression;
        }
      }
    }

    // Epic fail
    return {tokens: original};
  },

  // clause = junction / negation
  clause: function(tokens) {
    var clause

    // Do we have a con/disjunction?
    clause = grammar.junction(tokens);
    if (!clause.exec) {
      // Not a con/disjunction, so try a negation
      clause = grammar.negation(clause.tokens);
    }

    return clause;
  },

  // junction = ( "and" / "or" ) expression expression
  // ...Apparently there's no hypernym for dyadic logical connectives
  junction: function(tokens) {
    var t, original = tokens.slice(),
        junction, expr1, expr2;

    if ((t = tokens.shift()) && !t.delim && /^(or|and)$/.test(t.val)) {
      // Found the "and" or "or" keyword
      junction = t.val;
      expr1 = grammar.expression(tokens);
      if (expr1.exec) {
        // Found the first argument
        expr2 = grammar.expression(expr1.tokens);
        if (expr2.exec) {
          // Found the second argument... yay!
          return {
            tokens: expr2.tokens,
            exec:   lexicon[junction](expr1.exec, expr2.exec)
          };
        }
      }
    }

    // Epic fail
    return {tokens: original};
  },

  // negation = "not" expression
  negation: function(tokens) {
    var t, original = tokens.slice(),
        expression;

    if ((t = tokens.shift()) && !t.delim && t.val == 'not') {
      // Found the "not" keyword
      expression = grammar.expression(tokens);
      if(expression.exec) {
        // Found a valid expression... yay!
        return {
          tokens: expression.tokens,
          exec:   lexicon.not(expression.exec)
        };
      } 
    }

    // Epic fail
    return {tokens: original};
  },

  // predicate = key comparator value
  predicate: function(tokens) {
    var t, original = tokens.slice(),
        key, comparator, value;

    if((t = tokens.shift()) && !t.delim) {
      // Found a valid key
      key = t.val;
      if ((t = tokens.shift()) && t.delim && lexicon.hasOwnProperty(t.val)) {
        // Found a valid comparator
        comparator = t.val;
        if ((t = tokens.shift()) && !t.delim) {
          // Found a valid value... yay!
          value = t.val;
          return {
            tokens: tokens,
            exec:   lexicon[comparator](key, value)
          };
        }
      }
    }

    // Epic fail
    return {tokens: original};
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

            // Preserve escaped wildcards and escaper
            case '*':
            case '?':
            case '\\':
              nextC = '\\' + nextC;
              break;
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

  if (!ast.tokens.length && ast.exec) {
    // Successfully compiled
    return function(input) {
      return isJSType.object(input)
          && ast.exec(input);
    }

  } else {
    // Compilation failure
    return undefined;
  }
};
