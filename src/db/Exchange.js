/*
 * @Author: weishere.huang
 * @Date: 2020-09-23 16:08:14
 * @LastEditTime: 2020-09-29 16:34:44
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');


const exchangeModel = mongoose.model('Exchange', new mongoose.Schema({
    symbol: String,
    orderId: String,
    dealType: String,
    roundId: String,
    uid: String,
    tid: String,
    expectDealQuantity: { type: Number, default: 0 },
    dealQuantity: { type: Number, default: 0 },
    dealAmount: { type: Number, default: 0 },
    marketPrice: { type: Number, default: 0 },
    dealPrice: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    imitateRun: { type: Boolean, default: true },
    dealQuantity: { type: Number, default: 0 },
    costing: { type: Number, default: 0 },
    dealDate: String,
    dealThenInfo: { type: Object, default: {} },
    signStr: String
}));


module.exports = {
    find: async function (query, limitTime) {
        try {
            if (limitTime) {
                const t = Date.parse(new Date()) - limitTime;
                return await exchangeModel.find(query).gte('dealDate', t).exec();
            }
            return await exchangeModel.find(query).exec();
        } catch (err) {
            error(err)
        }
    },
    create: async function (exchange, error) {
        try {
            const result = await new exchangeModel(exchange).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndRemove: async function (id, error) {
        try {
            return await exchangeModel.findOneAndRemove({ _id: id });
        } catch (err) {
            error(err)
        }
    },
}