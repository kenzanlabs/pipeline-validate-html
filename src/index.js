'use strict';

var htmllint = require('gulp-htmllint');
var lazypipe = require('lazypipe');
var path = require('path');
var handyman = require('pipeline-handyman');
var fs = require('fs');

var DEFAULT_RULES_PATH = path.join(process.cwd(), 'node_modules/pipeline-validate-html/.htmllintrc');
var DEFAULT_CONFIG = {
  rules: {},
  config: DEFAULT_RULES_PATH,
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

    rules = handyman.mergeConfig(retrieveDefaultOptions(), options.rules);

    options = handyman.mergeConfig(DEFAULT_CONFIG, {
      rules: rules,
      config: null
    });

  } else if (typeof options === 'string') {
    // NOOP

  } else {
    options = DEFAULT_CONFIG;

  }

  stream = lazypipe()
    .pipe(htmllint, options);

  return stream();
}

function retrieveDefaultOptions () {
  var defaultOptions = {};

  try {
    defaultOptions = JSON.parse(fs.readFileSync(DEFAULT_RULES_PATH, 'utf-8'));

  } catch (ex) {
    handyman.log('Could not retrieve default options from included config file at ' + DEFAULT_RULES_PATH);

  }

  return defaultOptions;
}