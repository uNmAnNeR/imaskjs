var babel = require('rollup-plugin-babel');


module.exports = function (config) {
  config.set({
    basePath: '',
    files: ['test/**/*.js'],
    frameworks: ['mocha', 'chai', 'sinon'],
    preprocessors: {
      'test/**/*.js': ['rollup', 'coverage']
    },
    reporters: ['progress', 'coverage'],
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
