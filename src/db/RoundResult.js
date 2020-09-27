/*
 * @Author: weishere.huang
 * @Date: 2020-09-27 13:00:46
 * @LastEditTime: 2020-09-27 13:33:48
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');


const roundResultModel = mongoose.model('RoundResult', new mongoose.Schema({
    symbol: String,
    orderId: String,
    tid: String,
    uid: String,
    isDone: { type: Boolean, default: false },
    exchangeQueue: { type: Array, default: [] },
    profit: { type: Number, default: 0 },
    startTime: String,
    endTime: String,
    strategy: { type: Object, default: {} },
    inCosting: { type: Number, default: 0 },
    outCosting: { type: Number, default: 0 },
    loadUpBuy: { type: Object, default: {} }
}));


module.exports = {
    find: async function (query) {
        try {
            return await roundResultModel.find(query).exec();
        } catch (err) {
            error(err)
        }
    },
    create: async function (roundResult, error) {
        try {
            const result = await new roundResultModel(roundResult).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndUpdate: async function (jquery, roundResult, error) {
        try {
            return await roundResultModel.findByIdAndUpdate(jquery, ...roundResult);
        } catch (err) {
            error(err)
        }
    },
}