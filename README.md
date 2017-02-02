# pipeline-validate-html

## Information

| Package       | Description   | Version|
| ------------- |:-------------:| -----:|
| pipeline-validate-html| This pipeline validates HTML files using HTML Hint | 0.1.0 |

# Overview

A pipeline for validating HTML files using HTML Hint.

## Install

```bash
$ npm install pipeline-validate-html --save-dev
```

## Usage

### Options
The following options are available to customize linting. They can be passed via an object or by storing within a `.htmllintrc` file and providing a path to the pipeline method.

These options are provided to `gulp-htmllint`. Please refer to that [project's Options for more information](https://github.com/yvanavermaet/gulp-htmllint#options). 

|Name | Type | Default | Description
|-----|------|---------|------------|
|rules|Object|see the included [`.htmllintrc`](/.htmllintrc)|Object containing [htmllint options](https://github.com/htmllint/htmllint/wiki/Options), which are merged with the default rules within the `.htmllintrc` file.|
|config|String|`path/pipeline-validate-html/.htmllintrc`|A path to a custom config file.|
|plugins|Array|[]|An array of plugins that should be utilized during linting.|
|failOnError|Boolean|false|Determine whether the pipeline exits with an error code|
 
## Examples

### Using default rules

```javascript
// using default rules

var gulp = require('gulp');
var validateHtmlPipeline = require('pipeline-validate-html');


gulp.task('validate:html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(validateHtmlPipeline.validateHTML());
});
```

### Custom file path 

A custom file path can be provided which points to a config file with a complete or partial list of linting rules. These rules will be merged with the default rules found in the `.htmllintrc` file provied with this repo. This allows for a partial list of overrides to be provied, while retaining the default settings for those rules not provied.
 
**NOTE:** When providing a String, all [additional options](#Options) are kept as default 

```javascript
// using a custom file path

var gulp = require('gulp');
var validateHtmlPipeline = require('pipeline-validate-html');


gulp.task('validate:html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(validateHtmlPipeline.validateHTML('path/to/another/.htmllintrc'));
});
```

### Config Object 

```javascript
// using a config object

var gulp = require('gulp');
var validateHtmlPipeline = require('pipeline-validate-html');

var lintOpts = {
  plugins: ['lint-plugin-name'],
  failOnError: true,
  rules: { /* rule definitions to override default */ },
  /* -- OR -- */
  config: 'path/to/.htmllintrc'
}

gulp.task('validate:html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(validateHtmlPipeline.validateHTML(lintOpts));
});
```

#### Providing Rules and a Config

Passing both `rules` and a `config` path will first merge the provided rules with the config file rules, then merged with the default options. Rules will follow the following priority:

```text
options.rules <- options.config <- default config
```

This priority order allows for a custom config to be utilized across projects, while providing a means of tweaking rules on a per use basis.

```javascript
// using a config object with both rules and config properties

var gulp = require('gulp');
var validateHtmlPipeline = require('pipeline-validate-html');

var lintOpts = {
  plugins: ['lint-plugin-name'],
  failOnError: true,
  rules: { /* rule definitions to override custom config */ },
  config: 'path/to/.htmllintrc' // this file will override the default options
}

gulp.task('validate:html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(validateHtmlPipeline.validateHTML(lintOpts));
});
```


## Results

This pipeline returns a stream object. This object receives a stream with the HTML files to validate. You can call the _validateHTML_ method to run the validation. The method will report if any issues were found during the process. If no issues are present, it will return the stream.

## LICENSE

Copyright (c) 2017 Kenzan <http://kenzan.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
