var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var babel = require('rollup-plugin-babel');


module.exports = function (config) {
  var reporters = ['progress'];
  if (config.singleRun) {
    reporters.push('coverage');
  }

  config.set({
    basePath: '',
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    frameworks: ['mocha', 'chai', 'sinon'],
    plugins: [
      require('karma-rollup-preprocessor'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-coverage'),
      require('karma-sinon'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher')
    ],
    preprocessors: {
      'src/**/*.js': ['rollup'],
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
              'useBuiltIns': true
            }],
            'flow'
          ],
          exclude: 'node_modules/**',
          plugins: [
            'transform-object-rest-spread',
            'transform-object-assign',
            'external-helpers',
            ['istanbul', {
              "exclude": ["test/**/*.js"]
            }]
          ]
        }),
        commonjs()
      ],
      output: {
        format: 'iife',
        name: 'IMask',
        exports: 'named',
        sourcemap: 'inline'
      }
    }
  });
};
