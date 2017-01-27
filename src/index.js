'use strict';

var htmllint = require('gulp-htmllint');
var lazypipe = require('lazypipe');

module.exports = {

  validateHTML: function (options) {
    return pipelineFactory(options);
  }

};

function pipelineFactory (options) {
  var stream;

  stream = lazypipe()
    .pipe(htmllint, options);

  return stream();
}