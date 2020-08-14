/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 10:23:16
 * @LastEditTime: 2020-08-14 12:49:38
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const webpack = require("webpack");
module.exports = {
    entry: {
        vendor: ["react", "react-dom","antd","lodash"]
    },
    output: {
        path: __dirname + "/dist/dll", //放在的目录
        filename: '[name].dll.js', //打包文件的名字
        library: '[name]' //可选 暴露出的全局变量名
        // vendor.dll.js中暴露出的全局变量名。
        // 主要是给DllPlugin中的name使用，
        // 故这里需要和webpack.DllPlugin中的`name: '[name]',`保持一致。
    },
    plugins: [
        new webpack.DllPlugin({
            path: __dirname + "/dist/dll/[name].manifest.json", //生成上文说到清单文件，放在当前build文件下面，这个看你自己想放哪里了。
            name: '[name]',
        }),
        //压缩 只是为了包更小一点 
    ]
};