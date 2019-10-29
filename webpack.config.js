const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    output: {
        path: path.resolve('dist'),
        filename: '[name].js',
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    mode: process.env.NODE_ENV || 'development',

    entry: {
        app: './src/index.tsx',
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
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
    ],

    devServer: {
        port: 8080,
        hot: true,
    },

    devtool: 'cheap-module-source-map',
}