const webpack = require('webpack');
const path = require('path');


module.exports = {
	entry: {
		'imask': './src/imask.js',
		'imask.min': './src/imask.js'
	},
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [{
			test: /\.js$/,
			include: /src/,
			loader: 'babel-loader'
		}]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			include: /\.min\.js$/,
			sourceMap: true
		})
	]
}
