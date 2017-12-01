import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';


export default {
  input: 'src/index.js',
  name: 'maskedInput',
  output: [{
    file: 'dist/vue-imask.js',
    format: 'umd'
  }],
  sourcemap: true,
  plugins: [
    eslint({configFile: '.eslintrc'}),
    babel(),
  ],
  external: [
    'vue',
    'imask',
  ],
  globals: {
    vue: 'Vue',
    imask: 'IMask'
  }
}
