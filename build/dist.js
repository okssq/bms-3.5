const path = require('path');
const merge = require('webpack-merge');
const common = require('./base.js');
const AutoDllPlugin = require('autodll-webpack-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
    mode: 'production',
    devtool: "cheap-module-source-map",
    output: {
        filename: 'js/[name].[contenthash].js',
        path: path.resolve(__dirname, '../dist'),
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                }],
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [{
                    loader: "url-loader"
                }]
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
            chunkFilename: 'css/[id].[hash].css',
        }),
        new AutoDllPlugin({
            inject: true, // will inject the DLL bundle to index.html
            debug: true,
            filename: '[name]_[hash].js',
            path: './dll',
            entry: {
                vendor: ['vue', 'vue-router', 'vuex','element-ui','v-charts','echarts']
            }
        }),
        new webpack.optimize.SplitChunksPlugin()
    ],

});
