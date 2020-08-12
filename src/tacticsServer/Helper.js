/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 16:40:57
 * @LastEditTime: 2020-08-12 16:11:22
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
//const client = require('binance-api-node').default()
const { client } = require('../lib/binancer');

module.exports = class Helper {
    constructor(_this) {
        this.that = _this;
    }
    static getInstance(_this) {
        if (!this.helper) {
            this.helper = new Helper(_this);
        } else {
            this.that = _this;
        }
        return this.helper;
    }
    getCostPrice(buyPrice, sellPrice, serviceCharge) {
        return {
            buy: buyPrice + buyPrice * serviceCharge,
            sell: sellPrice - sellPrice * serviceCharge
        }
    }
    //获取最佳入场的交易对
    getBestSimbol() {
        return 'ETHUSDT';
    }
    /**利润,即若按照当前价格卖掉，获得的回报减去成本价(购买数量*当前价格)*(1-费率)-成本 */
    getProfit(amount) {
        if (this.that.imitateRun) {
            let _amount = amount || this.that.presentDeal.amount;
            return Number(_amount * this.that.getTheoryPrice(_amount).avePrive * (1 - this.that.parameter.serviceCharge) - this.that.presentDeal.costing);
        } else {
            //需要通过深度图获取理论交易均价，再做判断，不能再根据市价
            let _amount = amount || this.that.presentDeal.amount;
            return Number(_amount *
                this.that.getTheoryPrice(_amount) * (1 - (this.that.parameter.serviceCharge * (1 - this.that.parameter.serviceChargeDiscounts)))
                - this.that.presentDeal.costing);
        }
    }
    /**获取瞬时价格 */
    async getPresentPrice() {
        if (this.that.presentDeal.presentPrice) return this.that.presentDeal.presentPrice;
        const allPrice = await client.prices();
        return allPrice[this.that.symbol];
    }
    /**根据盈利，动态设置盈利拐点跌幅(原则，盈利越多，值越小，越容易止盈) */
    setRiseStopLossRate() {
        return this.that.parameter.riseStopLossRate;//先不启用
        //let oldRiseStopLossRate = this.that.parameter.riseStopLossRate;
        let riseRate = this.getProfit() / this.that.presentDeal.costing;
        if (riseRate >= 0.1) {
            //盈利大于10个点
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.1;
        } else if (riseRate >= 0.08 && riseRate < 0.1) {
            //8~10个点
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.25;
        } else if (riseRate >= 0.06 && riseRate < 0.8) {
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.4;
        } else if (riseRate >= 0.04 && riseRate < 0.6) {
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.55;
        } else if (riseRate >= 0.02 && riseRate < 0.4) {
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.7;
        } else if (riseRate >= 0.01 && riseRate < 0.2) {
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.85;
        } else if (riseRate < 0.01) {
            //小于0.01，意思没动
            this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 1;
        }
    }
}

// const tools = (this.that) => ({
//     getCostPrice: (buyPrice, sellPrice, serviceCharge) => {
//         return {
//             buy: buyPrice + buyPrice * serviceCharge,
//             sell: sellPrice - sellPrice * serviceCharge
//         }
//     },
//     //获取最佳入场的交易对
//     getBestSimbol: () => {
//         return 'ETHUSDT';
//     },
//     /**利润,即若按照当前价格卖掉，获得的回报减去成本价(购买数量*当前价格)*(1-费率)-成本 */
//     getProfit: (amount) => {
//         if (this.that.imitateRun) {
//             let _amount = amount || this.that.presentDeal.amount;
//             return Number(_amount * this.that.getTheoryPrice(_amount).avePrive * (1 - this.that.parameter.serviceCharge) - this.that.presentDeal.costing);
//         } else {
//             //需要通过深度图获取理论交易均价，再做判断，不能再根据市价
//             let _amount = amount || this.that.presentDeal.amount;
//             return Number(_amount *
//                 this.that.getTheoryPrice(_amount) * (1 - (this.that.parameter.serviceCharge * (1 - this.that.parameter.serviceChargeDiscounts)))
//                 - this.that.presentDeal.costing);
//         }
//     },
//     /**获取瞬时价格 */
//     getPresentPrice: async () => {
//         if (this.that.presentDeal.presentPrice) return this.that.presentDeal.presentPrice;
//         const allPrice = await client.prices();
//         return allPrice[this.that.symbol];
//     },
//     /**根据盈利，动态设置盈利拐点跌幅(原则，盈利越多，值越小，越容易止盈) */
//     setRiseStopLossRate: () => {
//         //let oldRiseStopLossRate = this.that.parameter.riseStopLossRate;
//         let riseRate = getProfit() / this.that.presentDeal.costing;
//         if (riseRate >= 0.1) {
//             //盈利大于10个点
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.1;
//         } else if (riseRate >= 0.08 && riseRate < 0.1) {
//             //8~10个点
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.25;
//         } else if (riseRate >= 0.06 && riseRate < 0.8) {
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.4;
//         } else if (riseRate >= 0.04 && riseRate < 0.6) {
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.55;
//         } else if (riseRate >= 0.02 && riseRate < 0.4) {
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.7;
//         } else if (riseRate >= 0.01 && riseRate < 0.2) {
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 0.85;
//         } else if (riseRate < 0.01) {
//             //小于0.01，意思没动
//             this.that.parameter.riseStopLossRate = this.that.parameter.riseStopLossRate * 1;
//         }
//     },
//     getIncreasePriceRate: async (symbol, beginTime, interval) => {

//     }
// })

// module.exports = tools;