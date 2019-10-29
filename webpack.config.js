import path from 'path'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
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