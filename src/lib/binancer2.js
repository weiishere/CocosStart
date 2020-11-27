/*
 * @Author: weishere.huang
 * @Date: 2020-10-12 14:06:10
 * @LastEditTime: 2020-10-31 01:18:57
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { System } = require('../config')

const Binance = require('node-binance-api');
const client = new Binance().options({
    APIKEY: System.user_0722.apiKey,
    APISECRET: System.user_0722.apiSecret
});

module.exports = { client }