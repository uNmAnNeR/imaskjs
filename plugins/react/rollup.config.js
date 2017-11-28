import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';


const file = 'dist/react-imask.js';
const input = 'src/index.js';

const babelConf = {
  presets: [
    ['env', {
      'modules': false,
      'loose': true,
      'useBuiltIns': true,
    }],
  ],
  exclude: 'node_modules/**',
  plugins: ['transform-object-rest-spread', 'transform-object-assign', 'external-helpers']
};


export default {
  input,
  name: 'ReactIMask',
  output: [{
    file,
    format: 'umd'
  }],
  sourcemap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    babel(babelConf),
  ],
  external: ['react', 'imask', 'prop-types'],
  globals: {
    react: 'React',
    imask: 'IMask',
    'prop-types': 'PropTypes',
  }
}
