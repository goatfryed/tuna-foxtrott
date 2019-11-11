// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = ({config, mode}) => {

    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx'];

    config.module.rules = config.module.rules.concat([
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
                    loader: "style-loader"
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
    ]);

    return config;
};
