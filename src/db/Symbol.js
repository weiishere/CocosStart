/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 17:53:50
 * @LastEditTime: 2020-08-19 16:30:38
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');

const symbolModel = mongoose.model('Symbol', new mongoose.Schema({
    name: String,
    updateDate: String,//{ type: Date, default: Date.now },
    klineData5m: { type: Array, default: [] },
    klineData1m: { type: Array, default: [] },
    klineData1h: { type: Array, default: [] },
    klineData1d: { type: Array, default: [] },
    boll5m: { type: Array, default: [] }
}));


module.exports = {
    create: async function (symbol, error) {
        // new symbolModel(symbol).save(function (err, symbol) {
        //     if (err) error(err); else callback(symbol);
        // });
        try {
            const result = await new symbolModel(symbol).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndUpdate: async function (symbolEntity, error) {
        try {
            var query = { name: symbolEntity.name }
            return await symbolModel.findOneAndUpdate(query, { updateDate: dateFormat(new Date(), "yyyy/MM/dd HH:mm:ss"), ...symbolEntity }, { upsert: true });
        } catch (err) {
            error(err)
        }
    },
    find: async function (query) {
        try {
            return await symbolModel.find(query).exec();
        } catch (err) {
            error(err)
        }
    },
    findAll: async function (error) {
        const result = await symbolModel.find({ 'name': 'ETHUSDT' }).exec(function (err) { if (err) error(err); });
        return await symbolModel.find({}).exec(function (err) { if (err) error(err); });
    },
    delete: async function (symbol, error) {
        // symbolModel.remove({ _id: id }, function (err) {
        //     if (err) error(err); else callback();
        // });
        try {
            const res = await symbolModel.remove({ symbol });
            return res.deletedCount;
        } catch (err) {
            error(err)
        }

    },
    update: async function (symbol, { key, value }, error) {
        try {
            var query = { name: symbol }
            const result = await symbolModel.update(query, { key: value });
            console.log(`匹配数量${result.n}，修改数量${result.nModified}`);
            return result;
        } catch (err) {
            error(err)
        }
    }
}