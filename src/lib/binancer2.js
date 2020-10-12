/*
 * @Author: weishere.huang
 * @Date: 2020-10-12 14:06:10
 * @LastEditTime: 2020-10-12 14:07:51
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { System } = require('../config')

const Binance = require('node-binance-api');
const client = new Binance().options({
    APIKEY: System.apiKey,
    APISECRET: System.apiSecret
});

module.exports = { client }