var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var babel = require('rollup-plugin-babel');


module.exports = function (config) {
  var preprocessors = ['rollup'];
  var reporters = ['progress'];
  if (config.singleRun) {
    preprocessors.push('coverage');
    reporters.push('coverage');
  }

  config.set({
    basePath: '',
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {
      'src/**/*.js': preprocessors,
      'test/**/*.js': ['rollup']
    },
    reporters: reporters,
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
      subdir: '.'
    },
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    rollupPreprocessor: {
      plugins: [
        resolve({
          jsnext: true,
          main: true
        }),
        babel({
          presets: [
            ['env', {
              'modules': false,
              'loose': true,
              'useBuiltIns': true
            }]
          ],
          exclude: 'node_modules/**',
          plugins: ['transform-object-rest-spread', 'transform-object-assign', 'external-helpers']
        }),
        commonjs()
      ],
      format: 'iife',
      name: 'IMask',
      sourcemap: 'inline'
    }
  });
};
