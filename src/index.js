'use strict';

var htmlhint = require('gulp-htmlhint');
var lazypipe = require('lazypipe');

module.exports = {

  validateHTML: function () {
    return pipelineFactory();
  }

};

function pipelineFactory () {
  var stream;

  stream = lazypipe()
    .pipe(htmlhint)
    .pipe(htmlhint.reporter)
    .pipe(htmlhint.failReporter);

  return stream();
}