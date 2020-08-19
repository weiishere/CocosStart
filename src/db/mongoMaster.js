/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 16:39:51
 * @LastEditTime: 2020-08-18 17:46:27
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const mongoose = require("mongoose");

const url = 'mongodb://127.0.0.1:27017/quantitative-db';  //这里是mongodb协议 MongoDB的端口号为27017
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

module.exports = {
  mongoose,
  connectDB: (fn, text) => {
    // mongoose.connect(url)  //connect参数2是个对象 为可选参数 当出现useNewUrlParser警告时 再来设置
    //     .then(() => {
    //         console.log("数据库链接成功");
    //     })
    //     .catch(err => {
    //         console.log("数据库链接失败", err.message);
    //     });
    mongoose.connect(url, options).then(() => {
      console.log(text + "数据库连接成功...");
      fn();
    },
      err => { console.log(text + "数据库连接失败:", err); }
    ).catch(err => {
      console.log(text + "数据库连接失败:", err.message);
    });
  }
};