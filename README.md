# pipeline-validate-html

## Information

| Package       | Description   | Version|
| ------------- |:-------------:| -----:|
| pipeline-validate-html| This pipeline validates HTML files using HTML Hint | 0.1.0 |

# Overview

A pipeline for validating HTML files using HTML Hint.

## Install

`npm install pipeline-validate-html --save-dev`

## Usage
```javascript
var gulp = require('gulp');
var validateHtmlPipeline = require('pipeline-validate-html');


gulp.task('validate:html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(validateHtmlPipeline.validateHTML());
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
