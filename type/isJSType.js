// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

// JavaScript Type Checker

var jsPrimitive = function(type, constructor) {
  // null and undefined *don't* have a constructor property
  var hasConstructor = function(x) {
    return typeof x != 'undefined' && x !== null;
  };

  return function(x) {
    return typeof x == type
        && (!constructor || (hasConstructor(x) && x.constructor == constructor));
  };
};

// Primitives
var isJSType = (function() {
  var output = {};

  var types  = {
    string:    ['string'],
    number:    ['number'],
    boolean:   ['boolean'],
    function:  ['function'],
    undefined: ['undefined'],
    array:     ['object', Array],
    object:    ['object', Object],
    date:      ['object', Date],
    regexp:    ['object', RegExp]
  };

  for (t in types) {
    output[t] = jsPrimitive.apply(null, types[t]);
  }

  // Nullity check
  output.null = function(x) {
    return jsPrimitive('object')(x) && x === null;
  };
  
  return output;
})();

// Homogeneous collections (.arrayOf and .objectOf)
// Note that this isn't chainable :(
(function() {
  var primitives  = Object.keys(isJSType),
      collections = ['array', 'object'];

  collections.forEach(function(coll) {
    isJSType[coll + 'Of'] = (function() {
      var output = {};

      primitives.forEach(function(type) {
        output[type] = function(x) {
          var param = {
            array:  { index: x,
                      test:  isJSType[type] },
            object: { index: Object.keys(x),
                      test:  function(a) { return isJSType[type](x[a]); } }
          };

          return isJSType[coll](x)
              && param[coll].index.length
              && param[coll].index.every(param[coll].test);
        };
      });

      return output;
    })();
  });
})();

module.exports = isJSType;
