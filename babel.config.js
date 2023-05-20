module.exports = function (api) {
  api.cache(true);

  const presetOptions = {
    useBuiltIns: 'entry',
    corejs: '3',
    targets: '> 0.25%, not dead',
  };
  const exclude = ['node_modules/**'];
  const plugins = [['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }]];

  if (process.env.NODE_ENV === 'test') {
    presetOptions.targets = { node: 'current' };
    plugins.push(['istanbul', {
      exclude: ['test/**/*.js', 'test/**/*.ts'],
      include: ['src/**/*.js', 'src/**/*.ts'],
    }]);
  }

  return {
    presets: [
      [ '@babel/env', presetOptions ],
      [ '@babel/typescript', { allowDeclareFields: true } ]
    ],
    plugins,
    exclude,
  };
};
