const merge = require('webpack-merge')
const baseConfig = require('../build/webpack.config.dev.js')

const webpackConfig = merge(baseConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  devtool: '#inline-source-map'
})

webpackConfig.plugins = []

const vueRule = webpackConfig.module.rules.find(rule => rule.loader === 'vue-loader')
vueRule.options = vueRule.options || {}
vueRule.options.loaders = vueRule.options.loaders || {}
vueRule.options.loaders.js = 'babel-loader'

// no need for app entry during tests
delete webpackConfig.entry

module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ['Chrome'],
    frameworks: ['mocha', 'chai-dom', 'sinon-chai'],
    reporters: ['spec', 'coverage'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
