/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 16:39:51
 * @LastEditTime: 2020-09-21 13:14:49
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const mongoose = require("mongoose");
const { DB } = require('../config')

const url = `mongodb://${DB.host}/${DB.database}`;  //这里是mongodb协议 MongoDB的端口号为27017
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

module.exports = {
  mongoose,
  connectDB: (fn, text) => {
    mongoose.connect(url, options).then(() => {
      console.log(text + "数据库(" + DB.host + ")连接成功...");
      fn();
    },
      err => { console.log(text + "数据库" + DB.host + "连接失败:", err); }
    ).catch(err => {
      console.log(text + "数据库" + DB.host + "连接失败:", err.message);
    });
  }
};