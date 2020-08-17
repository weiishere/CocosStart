/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 17:53:50
 * @LastEditTime: 2020-08-17 19:45:47
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { mongoose } = require('./mongoMaster');


const symbolModel = mongoose.model('Symbol', new mongoose.Schema({
    name: String,
    updateDate: { type: Date, default: Date.now },
    klineData5m: { type: Array, default: [] },
    klineData1m: { type: Array, default: [] },
    klineData1h: { type: Array, default: [] },
    klineData1d: { type: Array, default: [] }
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
    find: async function (symbolStr, keys, error) {
        const result = await symbolModel.find({ 'name': symbolStr }, keys.join(' ')).exec(function (err) { if (err) error(err); });
        return result;
        // const query = symbolModel.find({ 'name': symbolStr }, keys.join(' '));
        // query.exec(function (err, data) {
        //     if (err) return error(err);
        //     callback(data);
        // });
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