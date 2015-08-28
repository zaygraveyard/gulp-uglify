# gulp-uglify 

[![Build Status](http://img.shields.io/travis/terinjokes/gulp-uglify.svg?style=flat)](https://travis-ci.org/terinjokes/gulp-uglify) [![](http://img.shields.io/npm/dm/gulp-uglify.svg?style=flat)](https://www.npmjs.org/package/gulp-uglify) [![](http://img.shields.io/npm/v/gulp-uglify.svg?style=flat)](https://www.npmjs.org/package/gulp-uglify) [![](http://img.shields.io/codeclimate/github/terinjokes/gulp-uglify.svg?style=flat)](https://codeclimate.com/github/terinjokes/gulp-uglify) [![](http://img.shields.io/codeclimate/coverage/github/terinjokes/gulp-uglify.svg?style=flat)](https://codeclimate.com/github/terinjokes/gulp-uglify)

> [Gulp][gulp] plugin to minify JavaScript using [UglifyJS2][uglifyjs].

## Regarding Issues

This is just a simple [gulp][gulp] plugin, which means it's nothing more than a thin wrapper around the [`uglify-js`][uglifyjs] module.
If it looks like you are having JavaScript-related issues, please contact [UglifyJS][uglifyjs-issues].
Only create a new issue if it looks like you're having a problem with this plugin itself.

## Installation

Install package with npm and add it to your development dependencies:

`npm install --save-dev gulp-uglify`

## API

```javascript
var gulpUglify = require('gulp-uglify');
```

### gulpUglify([options])
*options*: `Object`  
Return: [stream.Transform][stream-transform]

Options are directly passed to the [UglifyJS.minify][uglifyjs-simple-way] function, so all the UglifyJS options are available.

```javascript
var gulp = require('gulp');
var gulpUglify = require('gulp-uglify');

gulp.task('minify-js', function() {
  return gulp.src('lib/*.js')
    .pipe(gulpUglify({
      compress: {
        screw_ie8: true
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        screw_ie8: true
      }
    }))
    .pipe(gulp.dest('dist'));
});
```

For compatibility with [gulp][gulp], the "fromString" option is automatically set to `true`.

Due to backwards compatibility, one additional, but deprecated, option is available.
If you use this option, it's recommended that you replace it with the noted replacement.

- `preserveComments` (deprecated)

  A convenience option for `options.output.comments`. Defaults to preserving no
  comments.

  - `all`

    Preserve all comments in code blocks.

    Replaced with `options.output.comments = true;`.

  - `license`

    Attempts to preserve comments that likely contain licensing information, even if the comment does not have directives such as `@license` or `/*!`.

    Implemented via the [`uglify-save-license`][uglify-save-license] module, this option preserves a comment if one of the following is true:

    1. The comment is in the *first* line of a file
    2. A regular expression matches the string of the comment. For example: `MIT`, `@license`, or `Copyright`.
    3. There is a comment at the *previous* line, and it matches 1, 2, or 3.

    Replaced with `options.output.comments = require('uglify-save-license');`.

  - `function`

    Specify your own comment preservation function. You will be passed the current node and the current comment and are expected to return either `true` or `false`.

    Replaced with `options.output.comments = function() {};`.

  - `some`

    Preserve comments that start with a bang (`!`) or include a Closure Compiler directive (`@preserve`, `@license`, `@cc_on`).

    Replaced with `options.output.comments = /^!|@preserve|@license|@cc_on/i;`.
    It's recommended that you follow the replacement noted in the `license` section above.

  ```javascript
var gulp = require('gulp');
var gulpUglify = require('gulp-uglify');

gulp.task('minify-js', function() {
  return gulp.src('lib/*.js')
    .pipe(gulpUglify({
      preserveComments: 'license'
    })
    .pipe(gulp.dest('dist'));
});
  ```

## Errors

`gulp-uglify` emits an 'error' event if it is unable to minify a specific file.
Wherever possible, the PluginError object will contain the following properties:

- `fileName`
- `lineNumber`
- `message`

To handle errors across your entire pipeline, see the [gulp][gulp-handle-errors-doc] documentation.

## Bring your own UglifyJS2

If you would like to use a specific version of [UglifyJS2][uglifyjs], you can require the `gulp-uglify` factory function, and provide your own UglifyJS.

```javascript
var uglifyjs = require('uglify-js');
var gulpUglifyFactory = require('gulp-uglify/minifier');

gulp.task('minify-js', function() {
  return gulp.src('lib/*.js')
    .pipe(gulpUglifyFactory({}, uglifyjs))
    .pipe(gulp.dest('dist'));
});
```

[gulp]: http://gulpjs.com/
[uglifyjs]: https://github.com/mishoo/UglifyJS2
[uglifyjs-issues]: https://github.com/mishoo/UglifyJS2/issues
[stream-transform]: https://nodejs.org/docs/latest/api/stream.html#stream_class_stream_transform
[uglifyjs-simple-way]: https://github.com/mishoo/UglifyJS2#the-simple-way
[uglify-save-license]: https://github.com/shinnn/uglify-save-license
[gulp-handle-errors-doc]: https://github.com/gulpjs/gulp/blob/master/docs/recipes/combining-streams-to-handle-errors.md#combining-streams-to-handle-errors
