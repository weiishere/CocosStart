/*
 * @Author: weishere.huang
 * @Date: 2020-09-23 16:08:14
 * @LastEditTime: 2020-09-23 19:43:24
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { mongoose } = require('./mongoMaster');
const dateFormat = require('format-datetime');
const { System } = require('../config');


const strategyModel = mongoose.model('Strategy', new mongoose.Schema({
    name: String,
    uid: String,
    date: { type: Date, default: Date.now },
    options: { type: Object, default: {} },
    version: { type: String, default: System.version }
}));


module.exports = {
    find: async function (query) {
        try {
            return await strategyModel.find(query).exec();
        } catch (err) {
            error(err)
        }
    },
    create: async function (strategy, error) {
        try {
            const result = await new strategyModel(strategy).save();
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndUpdate: async function (query, strategy, error) {
        try {
            const result = await strategyModel.findOneAndUpdate(query, { date: Date.now(), ...strategy })
            return result;
        } catch (err) {
            error(err)
        }
    },
    findOneAndRemove: async function (id, error) {
        try {
            return await strategyModel.findOneAndRemove({ _id: id });
        } catch (err) {
            error(err)
        }
    },
}