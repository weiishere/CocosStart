/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 16:36:15
 * @LastEditTime: 2020-07-27 23:35:22
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
var APP_PATH = path.resolve(path.resolve(__dirname), '');
const alias = require('./alias')

module.exports = {
    mode: 'development', // 设置 webpack 为开发模式（开发模式下打包出来的文件更大，方便开发调试）
    entry: {
        //app: ['./src/client/index.js','webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true'],
        app: './src/client/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // 指定在浏览器中引用时输出目录的公共URL，例如打包出来 app.bundle.js，那么访问地址就是: localhost:3000/__bundle__/app.bundle.js。否则就会报 404 not found
        publicPath: '/__bundle__/'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json'], //表示这几种文件的后缀名可以省略，按照从前到后的方式来进行补全
        modules: [APP_PATH, 'node_modules'],
        alias: { ...alias }
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            loader: 'babel-loader',
            exclude: /(node_modules|bower_components)/,
            query: {
                plugins: [["import", { libraryName: "antd", style: true }]]
            }
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.less$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "less-loader", // compiles Less to CSS
                options: { javascriptEnabled: true }
            }]
        }
            // {
            //     test: /\.(css)$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: "style-loader",
            //         use: [{
            //             loader: 'css-loader'
            //         }, {
            //             loader: 'postcss-loader',
            //             options: {
            //                 plugins: () => [autoprefixer({
            //                     browsers: ['last 5 versions']
            //                 })]
            //             }
            //         }, {
            //             loader: 'less-loader'

            //         }]
            //     })
            // }, {
            //     test: /\.less$/,
            //     use: [{
            //         loader: "style-loader"
            //     }, {
            //         loader: "css-loader"
            //     }, {
            //         loader: "less-loader",
            //         options: { javascriptEnabled: true }
            //     }]
            // }, {
            //     test: /\.(ico|png|gif|jpg|jpeg)$/,
            //     loader: 'url-loader'
            // }
        ],
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};