import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';


export default {
  input: 'src/index.js',
  name: 'ReactIMask',
  output: [{
    file: 'dist/react-imask.js',
    format: 'umd'
  }],
  sourcemap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    babel(),
  ],
  external: [
    'react',
    'prop-types',
    'imask',
  ],
  globals: {
    react: 'React',
    imask: 'IMask',
    'prop-types': 'PropTypes',
  }
}
