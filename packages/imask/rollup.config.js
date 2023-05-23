import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import eslint from '@rollup/plugin-eslint';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import polyfill from 'rollup-plugin-polyfill';
import multi from 'rollup-plugin-multi-input';
import copy from 'rollup-plugin-copy';

const extensions = ['.js', '.ts'];

const commonPlugins = [
  nodeResolve({ extensions }),
  babel({
    extends: './.babelrc',
    extensions,
    rootMode: 'upward',
    babelHelpers: 'bundled',
  }),
];

export default [
  ...[false, true].map(min => ({
    input: 'src/index.ts',
    output: {
      file: `dist/imask${min ? '.min' : ''}.js`,
      format: 'umd',
      name: 'IMask',
      sourcemap: true,
    },
    plugins: [
      eslint({configFile: '../../.eslintrc.ts.js'}),
      ...commonPlugins,
      commonjs(),
      polyfill(['./polyfills.ts']),
      min && terser(),
    ],
  })),
  {
    input: ['src/**/*.ts'],
    output: {
      format: 'esm',
      dir: 'esm',
    },
    plugins: [
      multi(),
      ...commonPlugins,
      copy({
        targets: [
          { src: 'esm/**/*.d.ts', dest: 'dist' },
          { src: 'esm/index.d.ts', dest: 'dist', rename: 'imask.d.ts' },
        ],
        flatten: false,
      })
    ]
  }
];
