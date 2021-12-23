const merge   = require('webpack-merge');
const common  = require('./base.js');
const path    = require('path');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: "development",
    devtool: "cheap-module-eval-source-map",
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: "url-loader",
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: "url-loader",
            },
            {
                test: /\.css$/,
                use: [
                    'css-hot-loader',
                    'vue-style-loader',
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',      
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ]
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer:{
        port:8300,
        contentBase: path.join(__dirname,'../'),
        proxy: {
            '/sicp': {
                target:'https://dsm.xiaozhenkj.com',
                // target:'https://test.xiaozhenkj.cn',
                // target:'http://192.168.2.165:9002',
                changeOrigin: true
            }
        },
        hot:true,
        disableHostCheck:true ,
        //host:"192.168.2.15",
        // host:"192.168.2.207",
        overlay: {      //编译错误浏览器显示警告
            warnings: true,
            errors  : true
        },
        hotOnly: true,
        hot    : true,
        stats: {
            all         : false,
            colors      : true,
            errors      : true, // 添加错误信息
            errorDetails: true, // 添加错误的详细信息（就像解析日志一样）
            performance : true, // 当文件大小超过 `performance.maxAssetSize` 时显示性能提示
            timings     : true, // 添加时间信息
            version     : true, // 添加 webpack 版本信息
            warnings    : true, // 添加警告
        }
    },
    
});
