import withSolid from "rollup-preset-solid";
import replace from '@rollup/plugin-replace';
import eslint from '@rollup/plugin-eslint';

export default withSolid([{
  input: './src/index.tsx',
  targets: ['esm'],
  plugins: [
    eslint(),
    replace({
      "from 'imask'": "from 'imask/esm/imask'",
      "import 'imask'": "import 'imask/esm'",
      delimiters: ['', ''],
    }),
  ]
}])