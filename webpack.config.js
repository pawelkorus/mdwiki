const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = {
    entry: './js/index.ts',
    mode: 'development',
    devServer: {
      contentBase: './dist'
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(css)/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                  }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                  }]
            },
            {
                test: /\.(scss)$/,
                use: [{
                  loader: 'style-loader', // inject CSS to page
                }, {
                  loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                  loader: 'postcss-loader', // Run post css actions
                  options: {
                    plugins: function () { // post css plugins, can be exported to postcss.config.js
                      return [
                        require('precss'),
                        require('autoprefixer')
                      ];
                    }
                  }
                }, {
                  loader: 'sass-loader' // compiles Sass to CSS
                }]
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader'
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery'
        }),
        new HtmlWebpackPlugin({
          inlineSource: '.(js|css)$', // embed all javascript and css inline
          template: 'js/index.hbs'
        }),
        new HtmlWebpackInlineSourcePlugin()
    ]
};