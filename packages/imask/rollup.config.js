import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


const isProd = process.env.NODE_ENV === 'production';
const format = process.env.BABEL_ENV || 'umd';

const isES = format === 'es';
const file = 'dist/imask' +
  (format !== 'umd' ? '.' + format : '') +
  (isProd ? '.min' : '') +
  '.js';

const input = isES ? 'src/imask.js' : 'src/imask.shim.js';


export default {
  input,
  output: {
    file,
    format,
    name: 'IMask',
    sourcemap: true,
  },
  plugins: [
    eslint({configFile: '../../.eslintrc'}),
    resolve(),
    babel(),
    !isES && commonjs(),
    isProd && terser()
  ]
}
