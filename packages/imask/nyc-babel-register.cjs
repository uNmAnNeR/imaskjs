require('@babel/register')({
  extends: './.babelrc',
  extensions: ['.js', '.ts'],
  rootMode: 'upward',
});
