/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 17:40:11
 * @LastEditTime: 2020-08-19 19:00:21
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */



const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');

const taskModel = mongoose.model('Task', new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tid: String,
    uid: String,
    name: String,
    updateDate: { type: Date, default: Date.now },
    taskJson: String
}));


module.exports = {
    find: async function (query) {
        try {
            return await taskModel.find(query).exec();
        } catch (err) {
            error(err)
        }
    },
    create: async function (task, error) {
        try {
            const result = await new taskModel(task).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndUpdate: async function (task, error) {
        try {
            var query = { tid: task.tid }
            const result = await taskModel.findOneAndUpdate(query, { updateDate: dateFormat(new Date(), "yyyy/MM/dd HH:mm:ss"),...task }, { upsert: true })
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndRemove: async function (tid, error) {
        try {
            return await taskModel.findOneAndRemove({ tid });
        } catch (err) {
            error(err)
        }
    },
}