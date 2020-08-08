/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 16:40:57
 * @LastEditTime: 2020-08-07 14:08:09
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
//const client = require('binance-api-node').default()
const { client } = require('../lib/binancer');
module.exports = {
    getCostPrice: (buyPrice, sellPrice, serviceCharge) => {
        return {
            buy: buyPrice + buyPrice * serviceCharge,
            sell: sellPrice - sellPrice * serviceCharge
        }
    },
    //获取最佳入场的交易对
    getBestSimbol: () => {
        return 'ETHUSDT';
    },
    /**获取瞬时价格 */
    getPresentPrice: async (symbol) => {
        const allPrice = await client.prices();
        return allPrice[symbol];
    },
    getIncreasePriceRate: async (symbol, beginTime, interval) => {
        
    }
}