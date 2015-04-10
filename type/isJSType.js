// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

// JavaScript Type Checker

var isJSType = function(type, constructor) {
  // null and undefined *don't* have a constructor property
  var hasConstructor = function(x) {
    return typeof x != 'undefined' && x !== null;
  };

  return function(x) {
    return typeof x == type
        && (!constructor || (hasConstructor(x) && x.constructor == constructor));
  };
};

module.exports = (function() {
  var output = {};

  var types  = {
    string:    ['string'],
    number:    ['number'],
    boolean:   ['boolean'],
    undefined: ['undefined'],
    array:     ['object', Array],
    object:    ['object', Object],
    date:      ['object', Date],
    regexp:    ['object', RegExp]
  };

  for (t in types) {
    output[t] = isJSType.apply(null, types[t]);
  }

  // Nullity check
  output.null = function(x) {
    return isJSType('object')(x) && x === null;
  };

  // Primitives
  // (Not really useful, but could be used as a constructor test)
  output.primitive = isJSType;

  return output;
})();
