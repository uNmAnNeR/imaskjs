import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import polyfill from 'rollup-plugin-polyfill';
import multiInput from 'rollup-plugin-multi-input';


const commonPlugins = [
  resolve(),
  babel({
    extends: './.babelrc',
    rootMode: 'upward',
  }),
];

export default [
  ...[false, true].map(min => ({
    input: 'src/index.js',
    output: {
      file: `dist/imask${min ? '.min' : ''}.js`,
      format: 'umd',
      name: 'IMask',
      sourcemap: true,
    },
    plugins: [
      eslint({configFile: '../../.eslintrc'}),
      ...commonPlugins,
      commonjs(),
      polyfill(['./polyfills.js']),
      min && terser(),
    ],
  })),
  {
    input: ['src/**/*.js'],
    output: {
      format: 'esm',
      dir: 'esm',
    },
    plugins: [
      multiInput(),
      ...commonPlugins,
    ]
  }
];
