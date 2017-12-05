import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';

const globals = {
  react: 'React',
  imask: 'IMask',
  'prop-types': 'PropTypes',
};

export default {
  input: 'src/index.js',
  name: 'ReactIMask',
  output: {
    file: 'dist/react-imask.js',
    format: 'umd'
  },
  sourcemap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    babel(),
  ],
  external: Object.keys(globals),
  globals
}
