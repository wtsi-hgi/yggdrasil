// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

var format = /^(\d*):(\d*)$/;

// Slice Query Parser
module.exports = function(slice) {
  var match, min, max,
      output = [];

  if (match = slice.match(format)) {
    // $1 = min
    // $2 = max
    min = match[1] == '' ? 0 : parseInt(match[1], 10);
    max = match[2] == '' ? Infinity : parseInt(match[2], 10);

    // Swap if min > max
    if (min > max) (function() {
      var tmp = max; max = min; min = tmp;
    })();

    // Indices shouldn't be the same
    if (min == max) {
      max = Infinity;
    }

    // Define output array to apply against Array.prototype.slice
    if (min != 0 || max != Infinity) {
      output.push(min);
      if (max != Infinity) {
        output.push(max);
      }
    }
  }

  return output;
};
