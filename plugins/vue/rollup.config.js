import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';


export default {
  input: 'src/index.js',
  name: 'MaskedInput',
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
    'vue-types'
  ],
  globals: {
    vue: 'Vue',
    imask: 'IMask',
    'vue-types': 'VueTypes'
  }
}
