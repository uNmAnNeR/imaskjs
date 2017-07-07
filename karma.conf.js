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
      type: 'html',
      dir: 'coverage/'
    },
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    rollupPreprocessor: {
      plugins: [
        babel({
          exclude: 'node_modules/**',
        })
      ],
      format: 'iife',
      moduleName: 'IMask',
      sourceMap: 'inline'
    }
  });
};
