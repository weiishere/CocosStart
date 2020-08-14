const webpack=require("webpack");
module.exports={
    entry:{
        // 注意是数组
        jquery:["jquery"],
        loadsh:["loadsh"]
    },
    output:{
        path:__dirname+"/dist/dll",
        filename:"./[name].js",
        // library引用名：和app.js中
        // import jq from "jquery"
        // 和from 后面的名字有关
        library:"[name]"
    },
    plugins:[
        new webpack.DllPlugin({
            path:__dirname+"/dist/dll/[name].json",
            name:"[name]"
        })
    ]
}