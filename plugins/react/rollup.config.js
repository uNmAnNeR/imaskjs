import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


const format = process.env.format || 'umd';
const isES = format === 'es';
const file = 'dist/react-imask' +
  (format !== 'umd' ? '.' + format : '') +
  '.js';

const input = 'src/index.js'; // TODO isES ? 'src/index.js' : 'src/imask.shim.js';

const babelConf = isES ? {
  externalHelpersWhitelist: [
    'extends',
    'slicedToArray'
  ],
  presets: [
    ['env', {
      modules: false,
      useBuiltIns: true,
      targets: {
        browsers: [
          'Chrome >= 60',
          'Safari >= 10.1',
          'iOS >= 10.3',
          'Firefox >= 54',
          'Edge >= 15',
        ],
      },
    }],
    'react'
  ],
  // waiting for https://github.com/rollup/rollup/issues/1613
  plugins: ['transform-object-rest-spread', 'external-helpers']
} : {
  presets: [
    ['env', {
      'modules': false,
      'loose': true,
      'useBuiltIns': true
    }],
    'react'
  ],
  exclude: 'node_modules/**',
  plugins: ['transform-object-rest-spread', 'transform-object-assign', 'external-helpers']
};


export default {
  input,
  name: 'ReactIMask',
  output: [{ file, format }],
  sourcemap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    resolve({
      jsnext: true,
      main: true
    }),
    babel(babelConf),
    !isES && commonjs(),
  ],
  external: ['react', 'imask', 'prop-types'],
  globals: {
    react: 'React',
    imask: 'IMask',
    'prop-types': 'PropTypes',
  }
}
