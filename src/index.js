'use strict';

var htmllint = require('gulp-htmllint');
var lazypipe = require('lazypipe');
var path = require('path');
var handyman = require('pipeline-handyman');
var fs = require('fs');

var DEFAULT_PATH = path.join(process.cwd(), 'node_modules/pipeline-validate-html/.htmllintrc');
var DEFAULT_OPTIONS = {
  rules: {},
  config: DEFAULT_PATH,
  plugins: [],
  failOnError: false
};

module.exports = {

  validateHTML: function (options) {
    return pipelineFactory(options);
  }

};

function pipelineFactory (options) {
  var stream;

  var rules;

  if (typeof options === 'object') {

    rules = handyman.mergeConfig(retrieveDefaultOptions(), options);

    options = handyman.mergeConfig(DEFAULT_OPTIONS, {
      rules: rules,
      config: null
    });

  } else {
    options = DEFAULT_OPTIONS;

  }

  stream = lazypipe()
    .pipe(htmllint, options);

  return stream();
}

function retrieveDefaultOptions () {
  var defaultOptions = {};

  try {
    defaultOptions = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf-8'));

  } catch (ex) {
    handyman.log('Could not retrieve default options from included config file at %s.', DEFAULT_PATH);

  }

  return defaultOptions;
}