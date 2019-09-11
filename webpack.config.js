const path = require('path');
const webpack = require("webpack");

module.exports = {
    entry: './js/index.ts',
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
        })
    ]
};