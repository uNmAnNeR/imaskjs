// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html
var path = require('path');

module.exports = function (config) {
	config.set({
		basePath: '',
		files: ['test/**/*.js'],
		frameworks: ['mocha', 'chai', 'sinon'],
		// plugins: [
		// 	require('karma-webpack'),
		// 	require('karma-phantomjs-launcher'),
		// 	require('karma-coverage'),
		// 	require('karma-sourcemap-loader'),
		// 	require('karma-mocha-reporter'),
		// 	require('karma-mocha'),
		// 	require('karma-chai'),
		// 	require('karma-sinon')
		// ],
		preprocessors: {
			'test/**/*.js': ['webpack', 'sourcemap', 'coverage']
		},
		reporters: ['progress', 'coverage'],
		coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
		colors: true,
		logLevel: config.LOG_INFO,
		browsers: ['Chrome'],
		webpackMiddleware: {
			noInfo: true
		},
		webpack: {
			devtool: 'inline-source-map',
			module: {
				loaders: [{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: 'babel-loader'
				}]
			}
		},
	});
};
