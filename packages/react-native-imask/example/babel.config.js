const path = require('path');


module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.ios.js', '.android.js'],
          alias: {
            'react-native-imask': path.resolve(
              __dirname,
              '../',
            ),
            'react-imask': path.resolve(
              __dirname,
              '../../react-imask',
            ),
            '@babel/runtime': path.resolve(
              __dirname,
              './node_modules/@babel/runtime',
            ),
            'react': path.resolve(
              __dirname,
              './node_modules/react',
            ),
          },
        },
      ],
    ],
  };
};
