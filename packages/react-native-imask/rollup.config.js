import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import multi from 'rollup-plugin-multi-input';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';


const globals = {
  react: 'React',
  'react-native': 'ReactNative',
  'react-imask': 'ReactIMask',
  'prop-types': 'PropTypes',
  'imask': 'IMask',
};

export default [
  {
    input: 'src/index.js',
    external: Object.keys(globals),
    output: {
      name: 'ReactNativeIMask',
      file: pkg.main,
      globals,
      format: 'umd',
      sourcemap: true,
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
      replace({
        "import 'imask'": "import 'imask/esm'",
        "import IMaskMixin from 'react-imask'": "import IMaskMixin from 'react-imask/esm/mixin'",
        "import MaskElement from 'imask'": "import MaskElement from 'imask/esm/controls/mask-element'",
        delimiters: ['', ''],
      }),
      multi(),
      babel({
        rootMode: 'upward',
      }),
    ]
  }
];
