const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');



function resolve(dir) { // 转换为绝对路径
    return path.join(__dirname, dir);
}
module.exports = {
    entry: './src/index.js',
    output: {
        path: resolve("../"),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('../src'),
            "img": resolve('../src/assets/img'),
            "page": resolve('../src/page'),
            "assets": resolve('../src/assets'),
            "service": resolve('../src/server'),
            "components": resolve('../src/components'),
        },
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: ['babel-loader'],
            },
        ],
    },
    plugins: [
        // 请确保引入这个插件来施展魔法
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
        }),
        
    ],

};
