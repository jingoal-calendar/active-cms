var path = require("path");
var webpack = require('webpack');
var HtmlWebPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var commonLoaders = [
];
var assetsPath = path.join(__dirname, "public", "assets");
var publicPath = "assets/";

module.exports = [
	{
		// The configuration for the server-side rendering
		name: "server-side rendering",
		entry: "./server/page.js",
		target: "node",
		output: {
			path: assetsPath,
			filename: "../../server/page.generated.js",
			publicPath: publicPath,
			libraryTarget: "commonjs2"
		},
        externals: /^[a-z\-0-9]+$/,
        resolve: {
            // 省略后缀
            extensions: ['.js', '.jsx'],
        },
		module: {
			loaders:
                commonLoaders.concat([
                    {
                        test: /\.jsx?$/,
                        use: ['babel-loader'],
                        exclude: /node_modules/
                    },
                    {
                        test: /\.scss$/,
                        use: ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: [
                                'css-loader',
                                'autoprefixer-loader',
                                'sass-loader',
                            ],
                        })
                    },
                    // less 加载器
                    {
                        test: /\.less$/,
                        loader: ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: [
                                'css-loader',
                                'autoprefixer-loader',
                                'less-loader',
                            ]
                        })
                    },
                    // css 加载器
                    // Reference: https://github.com/webpack/style-loader
                    // Reference: https://github.com/webpack/css-loader
                    // Reference: https://github.com/webpack/autoprefixer-loader
                    // Reference: https://github.com/webpack/extract-text-webpack-plugin
                    {
                        test: /\.css$/,
                        loader: ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: [
                                'css-loader',
                                'autoprefixer-loader'
                            ]
                        })
                    },
                    {
                        // JSON资源文件加载器
                        // Reference: https://github.com/webpack/json-loader
                        test: /\.json$/,
                        loader: 'json-loader'
                    },
                    {
                        // 图片加载器
                        test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[=a-z0-9]+)?$/,
                        loader: 'url-loader?limit=10000&name=images/[hash].[ext]'
                    }
                ])
        },
        plugins: [
            new ExtractTextPlugin({
                filename: '[name].css',
                allChunks: false,
            }),
		]
	}
];