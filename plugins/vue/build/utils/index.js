const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { join } = require('path')

const {
  red,
  logError
} = require('./log')

const {
  processStyle
} = require('./style')

const uppercamelcase = require('uppercamelcase')

exports.write = require('./write')

const {
  author,
  name,
  version,
  dllPlugin
} = require('../../package.json')

const authorName = author.replace(/\s+<.*/, '')
const minExt = process.env.NODE_ENV === 'production' ? '.min' : ''

exports.author = authorName
exports.version = version
exports.dllName = dllPlugin.name
exports.moduleName = uppercamelcase(name)
exports.name = name
exports.filename = name + minExt
exports.banner = `/*!
 * ${name} v${version}
 * (c) ${new Date().getFullYear()} ${authorName}
 * Released under the MIT License.
 */
`

// log.js
exports.red = red
exports.logError = logError

// It'd be better to add a sass property to the vue-loader options
// but it simply don't work
const sassOptions = {
  includePaths: [
    join(__dirname, '../../node_modules')
  ]
}

// don't extract css in test mode
const nullLoader = process.env.NODE_ENV === 'common' ? 'null-loader!' : ''
exports.vueLoaders =
  process.env.BABEL_ENV === 'test' ? {
    css: 'css-loader',
    scss: `css-loader!sass-loader?${JSON.stringify(sassOptions)}`
  } : {
    css: ExtractTextPlugin.extract(`${nullLoader}css-loader`),
    scss: ExtractTextPlugin.extract(
      `${nullLoader}css-loader!sass-loader?${JSON.stringify(sassOptions)}`
    )
  }

// style.js
exports.processStyle = processStyle
