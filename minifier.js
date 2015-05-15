'use strict';
var through = require('through2');
var defined = require('defined');
var PluginError = require('gulp-util/lib/PluginError');
var pluginName = 'gulp-uglify';

function trycatch(fn, handle) {
  try {
    return fn();
  } catch (e) {
    return handle(e);
  }
}

function setup(opts) {
  var options = {
    output: defined(opts.output, {}),
    compress: defined(opts.compress, {}),
    mangle: defined(opts.mangle, {})
  };

  if (opts.preserveComments === 'all') {
    options.output.comments = true;
  } else if (opts.preserveComments === 'some') {
    // preserve comments with directives or that start with a bang (!)
    options.output.comments = /^!|@preserve|@license|@cc_on/i;
  } else if (typeof opts.preserveComments === 'function') {
    options.output.comments = opts.preserveComments;
  }

  return options;
}

function createError(file, err) {
  if (typeof err === 'string') {
    return new PluginError(pluginName, file.path + ': ' + err, {
      fileName: file.path,
      showStack: false
    });
  }

  var msg = err.message || err.msg || /* istanbul ignore next */ 'unspecified error';

  return new PluginError(pluginName, file.path + ': ' + msg, {
    fileName: file.path,
    lineNumber: err.line,
    stack: err.stack,
    showStack: false
  });
}

module.exports = function(opts, uglify) {
  function minify(file, encoding, callback) {
    var options = setup(opts || {});

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(createError(file, 'Streaming not supported'));
    }

    var mangled = trycatch(function() {
      // 1. parse
      var toplevel = uglify.parse(file.contents + '', {
        filename: file.relative,
        toplevel: null
      });

      // 2. compress
      if (options.compress) {
        toplevel.figure_out_scope();
        var sq = uglify.Compressor(options.compress);
        toplevel = toplevel.transform(sq);
      }

      // 3. mangle
      if (options.mangle) {
        toplevel.figure_out_scope(options.mangle);
        toplevel.compute_char_frequency(options.mangle);
        toplevel.mangle_names(options.mangle);
      }

      // 4. output
      if (file.sourceMap) {
        options.output.source_map = uglify.SourceMap({
          file: file.relative,
          orig: file.sourceMap.mappings.length > 0 ? file.sourceMap : null
        });

        if (file.sourceMap.sources) {
          file.sourceMap.sources.forEach(function(source, index) {
            options.output.source_map.get().setSourceContent(source, file.sourceMap.sourcesContent[index]);
          });
        }
      }
      var stream = uglify.OutputStream(options.output);
      toplevel.print(stream);

      return {
        code: new Buffer(stream + ''),
        map: options.output.source_map + ''
      };
    }, createError.bind(null, file));

    if (mangled instanceof PluginError) {
      return callback(mangled);
    }

    file.contents = mangled.code;

    if (file.sourceMap) {
      file.sourceMap = JSON.parse(mangled.map);
    }

    callback(null, file);
  }

  return through.obj(minify);
};
