import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import multi from 'rollup-plugin-multi-input';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };


const globals = {
  imask: 'IMask'
};
const input = ['src/**'];
const extensions = ['.js', '.ts'];
const babelConfig = {
  extensions,
  rootMode: 'upward',
  babelHelpers: 'runtime',
  include: input,
};

export default [
  {
    input: 'src/index.js',
    external: Object.keys(globals),
    output: {
      name: 'SvelteIMask',
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      globals,
    },
    plugins: [
      eslint({overrideConfigFile: '../../.eslintrc'}),
      babel(babelConfig),
    ],
  },
  {
    input,
    external: [...Object.keys(globals), 'imask/esm', 'imask/esm/imask'],
    output: {
      format: 'esm',
      dir: 'esm',
    },
    plugins: [
      replace({
        "import IMask from 'imask'": "import IMask from 'imask/esm/imask'",
        "import 'imask'": "import 'imask/esm'",
        delimiters: ['', ''],
      }),
      multi.default(),
      babel(babelConfig),
    ]
  }
]
