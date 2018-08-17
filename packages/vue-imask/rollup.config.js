import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';


const globals = {
  imask: 'IMask'
};

export default {
  input: 'src/index.js',
  output: {
    name: 'VueIMask',
    file: 'dist/vue-imask.js',
    format: 'umd',
    sourcemap: true,
    globals,
  },
  plugins: [
    eslint({configFile: '../../.eslintrc'}),
    babel(),
  ],
  external: Object.keys(globals),
}
