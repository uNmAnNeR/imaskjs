var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var babel = require('rollup-plugin-babel');

process.env.CHROME_BIN = require('puppeteer').executablePath();

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
      require('karma-chrome-launcher')
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
        babel({
          presets: [
            ['@babel/preset-env', {
              'modules': false,
              'useBuiltIns': 'entry'
            }],
            '@babel/preset-flow'
          ],
          exclude: 'node_modules/**',
          plugins: [
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-transform-object-assign',
            ['istanbul', {
              "exclude": ["test/**/*.js"]
            }]
          ]
        }),
        resolve(),
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
