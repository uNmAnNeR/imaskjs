import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import multiInput from 'rollup-plugin-multi-input';
import pkg from './package.json';


const globals = {
  imask: 'IMask'
};


export default [
  {
    input: 'src/index.js',
    external: Object.keys(globals),
    output: {
      name: 'VueIMask',
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      globals,
    },
    plugins: [
      eslint({configFile: '../../.eslintrc'}),
      babel({
        rootMode: 'upward',
      }),
    ],
  },
  {
    input: ['src/**/*.js'],
    output: {
      format: 'esm',
      dir: 'esm',
    },
    plugins: [
      multiInput(),
      babel({
        rootMode: 'upward',
      }),
    ]
  }
]
