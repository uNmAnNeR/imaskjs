const presetOptions = {
  modules: false,
  useBuiltIns: "entry",
};
const exclude = [];
const plugins = [];

if (process.env.BABEL_ENV === 'es') {
  presetOptions.targets = {
    browsers: [
      "Chrome >= 60",
      "Safari >= 10.1",
      "iOS >= 10.3",
      "Firefox >= 54",
      "Edge >= 15",
    ],
  }
} else {
  exclude.push('node_modules/**');
  plugins.push('@babel/plugin-proposal-object-rest-spread', '@babel/plugin-transform-object-assign');
}

if (process.env.NODE_ENV === 'test') {
  presetOptions.targets = { node: 'current' };
  delete presetOptions.modules;
  plugins.push(['istanbul', {
    exclude: ["test/**/*.js"],
    include: ["src/**/*.js"],
  }]);
}


module.exports = {
  presets: [
    ["@babel/preset-env", presetOptions],
    "@babel/preset-flow"
  ],
};
