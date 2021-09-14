import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import multi from 'rollup-plugin-multi-input';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';


const globals = {
  imask: 'IMask',
  vue: 'Vue',
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
    external: [...Object.keys(globals), 'imask/esm', 'imask/esm/imask'],
    output: {
      format: 'esm',
      dir: 'esm',
    },
    plugins: [
      replace({
        "from 'imask'": "from 'imask/esm/imask'",
        "import 'imask'": "import 'imask/esm'",
        delimiters: ['', ''],
      }),
      multi(),
      babel({
        rootMode: 'upward',
      }),
    ]
  }
]
