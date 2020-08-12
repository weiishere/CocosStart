const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = 'mongodb://test:123456@127.0.0.1:27017/test'; // 数据库为 test
const insertData = function (db, callback) {
  //连接到表 site
  const collection = db.collection('site');
  //插入数据
  const data = [{ "name": "网站1", "url": "www.test1.com" }, { "name": "网站2", "url": "www.test2.com" }];
  collection.insert(data, function (err, result) {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    callback(result);
  });
}
const selectData = function (db, callback) {
  //连接到表
  const collection = db.collection('site');
  //查询数据
  const whereStr = { "name": '网站1' };
  collection.find(whereStr).toArray(function (err, result) {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    callback(result);
  });
}
const updateData = function (db, callback) {
  //连接到表
  const collection = db.collection('site');
  //更新数据
  const whereStr = { "name": '网站1' };
  const updateStr = { $set: { "url": "https://www.test1.com" } };
  collection.update(whereStr, updateStr, function (err, result) {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    callback(result);
  });
}
const delData = function (db, callback) {
  //连接到表
  const collection = db.collection('site');
  //删除数据
  const whereStr = { "name": '网站1' };
  collection.remove(whereStr, function (err, result) {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    callback(result);
  });
}
MongoClient.connect(DB_CONN_STR, function (err, db) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("连接成功！");
  //1、插入
  insertData(db, function (result) {
    console.log(result);
    db.close();
  });
  //2、查询数据
  selectData(db, function (result) {
    console.log(result);
    db.close();
  });
  //3、更新数据
  updateData(db, function (result) {
    console.log(result);
    db.close();
  });
  //4、删除数据
  delData(db, function (result) {
    console.log(result);
    db.close();
  });
});