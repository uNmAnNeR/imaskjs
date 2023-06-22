import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import multi from 'rollup-plugin-multi-input';
import copy from 'rollup-plugin-copy';


const input = ['src/**'];
const extensions = ['.js', '.ts'];

const commonPlugins = [
  nodeResolve({ extensions }),
  commonjs(),
  babel({
    extensions,
    rootMode: 'upward',
    babelHelpers: 'runtime',
    include: input,
  }),
]; 

export default [
  ...[false, true].map(min => ({
    input: 'src/index.ts',
    output: {
      name: 'IMask',
      file: `dist/imask${min ? '.min' : ''}.js`,
      format: 'umd',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...commonPlugins,
      min && terser(),
    ],
  })),
  {
    input,
    output: {
      format: 'esm',
      dir: 'esm',
    },
    external: [/@babel\/runtime/],
    plugins: [
      multi.default(), // https://github.com/alfredosalzillo/rollup-plugin-multi-input/issues/72
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
