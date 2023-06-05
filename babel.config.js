module.exports = function (api) {
  api.cache(true);

  const presetOptions = {
    useBuiltIns: false,
    loose: true,
  };
  const exclude = ['**/node_modules/**'];
  const plugins = [
    "@babel/transform-runtime",
    ["polyfill-corejs3", {
      "method": "usage-pure"
    }]
  ];

  if (process.env.NODE_ENV === 'test') {
    presetOptions.targets = { node: 'current' };
    plugins.push(['istanbul', { exclude: ['test'], include: ['src'] }]);
  }

  return {
    targets: '> 0.25%, not dead',
    presets: [
      [ '@babel/env', presetOptions ],
      [ '@babel/typescript', { allowDeclareFields: true } ]
    ],
    plugins,
    exclude,
  };
};
