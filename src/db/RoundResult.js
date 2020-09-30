/*
 * @Author: weishere.huang
 * @Date: 2020-09-27 13:00:46
 * @LastEditTime: 2020-09-29 18:34:37
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');


const roundResultModel = mongoose.model('RoundResult', new mongoose.Schema({
    symbol: String,
    roundId: String,
    tid: String,
    uid: String,
    isDone: { type: Boolean, default: false },
    exchangeQueue: { type: Array, default: [] },
    profit: { type: Number, default: 0 },
    startTime: String,
    endTime: String,
    strategyId: { type: String, default: '' },
    inCosting: { type: Number, default: 0 },
    outCosting: { type: Number, default: 0 },
    loadUpBuy: { type: Array, default: [] },
    commission: { type: Number, default: 0 },
}));


module.exports = {
    find: async function (query) {
        try {
            const result =  await roundResultModel.find(query).exec();
            return result;
        } catch (err) {
            error(err)
        }
    },
    create: async function (roundResult, error) {
        try {
            const _roundResult = Object.assign({
                symbol: '', isDone: false, tid: '', uid: '', roundId: '',
                exchangeQueue: [], profit: 0,
                startTime: Date.parse(new Date()), endTime: '', strategyId: '',
                inCosting: 0, outCosting: 0, commission: 0, loadUpBuy: []
            }, roundResult)
            const result = await new roundResultModel(_roundResult).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndUpdate: async function (jquery, roundResult, error) {
        try {
            return await roundResultModel.findOneAndUpdate(jquery, { ...roundResult });
        } catch (err) {
            error(err)
        }
    },
}