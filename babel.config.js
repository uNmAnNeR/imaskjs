module.exports = function (api) {
  api.cache(true);

  const presetOptions = {
    useBuiltIns: 'entry',
    corejs: '3',
  };
  const exclude = [];
  const plugins = [];

  if (process.env.BABEL_ENV === 'es') {
    presetOptions.targets = { "esmodules": true };
  } else {
    presetOptions.targets = '> 0.25%, not dead';
    exclude.push('node_modules/**');
    plugins.push(
      ['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }]
    );
  }

  if (process.env.NODE_ENV === 'test') {
    presetOptions.targets = { node: 'current' };
    delete presetOptions.modules;
    plugins.push(['istanbul', {
      exclude: ['test/**/*.js'],
      include: ['src/**/*.js'],
    }]);
  }

  return {
    presets: [
      ['@babel/preset-env', presetOptions],
    ],
    plugins,
    exclude,
  };
};
