/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 17:40:11
 * @LastEditTime: 2020-08-17 17:42:07
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */



const { mongoose } = require('./mongoMaster');


const taskModel = mongoose.model('Task', new mongoose.Schema({
    taskId: String,
    uid: String,
    name: String,
    date: { type: Date, default: Date.now },
    taskJson: String
}));


module.exports = {
    create: function (task, callback, error) {
        new taskModel(task).save(function (err, task) {
            if (err) error(err); else callback(task);
        });
    }
}