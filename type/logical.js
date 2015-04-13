// GPLv3 or later
// Copyright (c) 2015 Genome Research Limited

// This one is *really* simple!
var isJSType = require('./isJSType');
module.exports = function() { return { test: isJSType.boolean } };
