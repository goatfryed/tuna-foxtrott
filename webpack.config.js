
const DefinePlugin = require('webpack').DefinePlugin;
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const environment = process.env.NODE_ENV || 'development';

module.exports = {
    output: {
        path: path.resolve('dist'),
        filename: '[name].js',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    mode: environment,

    entry: {
        app: './src/',
    },

    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },

    module: {
        rules: [
            {
                test: /\.(tsx?|jsx?)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            implementation: require("sass")
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: 'images'
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|ttf|otf|eot)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: 'fonts'
                        }
                    }
                ]
            }
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
        new DefinePlugin({
            __DEVELOPMENT__: Boolean(environment === "development")
        })
    ],

    devServer: {
        port: 8080,
        hot: true,
    },

    devtool: 'source-map',
};