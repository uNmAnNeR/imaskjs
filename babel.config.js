module.exports = function (api) {
  api.cache(true);

  return {
    targets: '> 0.25%, not dead, not android < 100',
    presets: [
      [ '@babel/env', {
        useBuiltIns: false,
        loose: true,
      } ],
      [ '@babel/typescript', { allowDeclareFields: true } ],
    ],
    plugins: [
      "@babel/transform-runtime",
      ["polyfill-corejs3", {
        "method": "usage-pure",
      }],
    ],
    exclude: ['**/node_modules/**'],
  };
};
