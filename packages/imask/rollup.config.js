import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import eslint from '@rollup/plugin-eslint';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import polyfill from 'rollup-plugin-polyfill';
import multi from 'rollup-plugin-multi-input';
import copy from 'rollup-plugin-copy';


const commonPlugins = [
  nodeResolve(),
  babel({
    extends: './.babelrc',
    rootMode: 'upward',
    babelHelpers: 'bundled',
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
      multi(),
      ...commonPlugins,
      copy({
        targets: [
          { src: 'index.d.ts', dest: 'esm', rename: 'imask.d.ts' },
        ]
      })
    ]
  }
];
