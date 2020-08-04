/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 16:40:57
 * @LastEditTime: 2020-08-01 15:12:43
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const client = require('binance-api-node').default()

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
    /**获取价格变动 */
    getPresentPrice: async (symbol) => {
        const allPrice = await client.prices();
        return allPrice[symbol];
    },
    getIncreasePriceRate: async (symbol, beginTime, interval) => {
        
    }
}