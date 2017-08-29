import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import eslint from 'rollup-plugin-eslint';
import {minify} from 'uglify-es';


const isProd = process.env.NODE_ENV === 'production';
function destName (format) {
  return 'dist/imask' +
    (isProd ? '.min' : '') +
    (format ? '.' + format : '') +
    '.js';
}

export default {
  // tell rollup our main entry point
  entry: 'src/index.js',
  targets: [
    { dest: destName(), format: 'umd' },
    { dest: destName('es'), format: 'es' }
  ],
  moduleName: 'IMask',
  sourceMap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    babel({
      exclude: 'node_modules/**',
    }),
    isProd &&
      uglify({}, minify)
  ]
}
