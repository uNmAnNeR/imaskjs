import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';


const globals = {
  react: 'React',
  imask: 'IMask',
  'prop-types': 'PropTypes',
};

export default {
  input: 'src/index.js',
  external: Object.keys(globals),
  output: {
    name: 'ReactIMask',
    file: 'dist/react-imask.js',
    globals,
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    eslint({configFile: '../../.eslintrc'}),
    babel(),
  ],
}
