const mkdirp = require('mkdirp')
const rollup = require('rollup').rollup
const vue = require('rollup-plugin-vue')
const jsx = require('rollup-plugin-jsx')
const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const uglify = require('uglify-js')
const CleanCSS = require('clean-css')

// Make sure dist dir exists
mkdirp('dist')

const {
  logError,
  write,
  banner,
  name,
  moduleName,
  version,
  processStyle
} = require('./utils')

function rollupBundle ({ env }) {
  return rollup({
    entry: 'src/index.js',
    plugins: [
      node({
        extensions: ['.js', '.jsx', '.vue']
      }),
      cjs(),
      vue({
        compileTemplate: true,
        css (styles, stylesNodes) {
          // Only generate the styles once
          if (env['process.env.NODE_ENV'] === '"production"') {
            Promise.all(
              stylesNodes.map(processStyle)
            ).then(css => {
              const result = css.map(c => c.css).join('')
              // write the css for every component
              // TODO add it back if we extract all components to individual js
              // files too
              // css.forEach(writeCss)
              write(`dist/${name}.css`, result)
              write(`dist/${name}.min.css`, new CleanCSS().minify(result).styles)
            }).catch(logError)
          }
        }
      }),
      jsx({ factory: 'h' }),
      replace(Object.assign({
        __VERSION__: version
      }, env)),
      buble({
        objectAssign: 'Object.assign'
      })
    ]
  })
}

const bundleOptions = {
  banner,
  exports: 'named',
  format: 'umd',
  moduleName
}

function createBundle ({ name, env, format }) {
  return rollupBundle({
    env
  }).then(function (bundle) {
    const options = Object.assign({}, bundleOptions)
    if (format) options.format = format
    const code = bundle.generate(options).code
    if (/min$/.test(name)) {
      const minified = uglify.minify(code, {
        output: {
          preamble: banner,
          ascii_only: true // eslint-disable-line camelcase
        }
      }).code
      return write(`dist/${name}.js`, minified)
    } else {
      return write(`dist/${name}.js`, code)
    }
  }).catch(logError)
}

// Browser bundle (can be used with script)
createBundle({
  name: `${name}`,
  env: {
    'process.env.NODE_ENV': '"development"'
  }
})

// Commonjs bundle (preserves process.env.NODE_ENV) so
// the user can replace it in dev and prod mode
createBundle({
  name: `${name}.common`,
  env: {},
  format: 'cjs'
})

// uses export and import syntax. Should be used with modern bundlers
// like rollup and webpack 2
createBundle({
  name: `${name}.esm`,
  env: {},
  format: 'es'
})

// Minified version for browser
createBundle({
  name: `${name}.min`,
  env: {
    'process.env.NODE_ENV': '"production"'
  }
})
