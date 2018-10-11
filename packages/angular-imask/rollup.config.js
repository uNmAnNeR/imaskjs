import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';


const globals = {
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/forms': 'ng.forms',
  '@angular/platform-browser': 'ng.platformBrowser',
  'imask': 'IMask',
};

export default {
  input: 'dist/index.js',
  external: Object.keys(globals),
  plugins: [resolve(), sourcemaps()],
  output: {
    file: 'dist/angular-imask.umd.js',
    format: 'umd',
    name: 'ng.imask',
    globals,
    sourcemap: true,
    exports: 'named',
  }
}
