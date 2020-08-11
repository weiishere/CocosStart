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
module.exports = (_this) => ({
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
    getPresentPrice: async () => {
        if (_this.presentDeal.presentPrice) return _this.presentDeal.presentPrice;
        const allPrice = await client.prices();
        return allPrice[_this.symbol];
    },
    getIncreasePriceRate: async (symbol, beginTime, interval) => {

    }
})