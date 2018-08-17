import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';


const globals = {
  react: 'React',
  'react-native': 'ReactNative',
  'react-imask': 'ReactIMask',
  'prop-types': 'PropTypes',
  'imask': 'IMask',
};

export default {
  input: 'src/index.js',
  external: Object.keys(globals),
  output: {
    name: 'ReactNativeIMask',
    file: 'dist/react-native-imask.js',
    globals,
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    eslint({configFile: '../../.eslintrc'}),
    babel(),
  ],
}
