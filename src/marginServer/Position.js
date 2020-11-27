/*
 * @Author: weishere.huang
 * @Date: 2020-10-26 13:46:51
 * @LastEditTime: 2020-10-31 01:28:26
 * @LastEditors: weishere.huang
 * @Description: 
 * @symbol_custom_string_obkoro1: ~~
 */
const Rnflexion = require('./Rnflexion');
const { client } = require('../lib/binancer2');

class Position {
    constructor(positionSide) {
        this.avgPrice = 0;//平均开仓价格
        this.security = 0;//保证金
        this.quantity = 0;//开仓数量
        this.symbol = 'BTCUSDT';
        this.profit = 0;
        this.commission = 0;
        this.tradeList = [];
        this.positionSide = positionSide;
        this.state = 'init';//init-初始化、in-场内、out-场外
    }
    addTrade(info) {
        const trade = new Trade(info);
        trade.profit = 10;
        if (trade.side === 'SELL') {
            this.quantity -= trade.executedQty;
            this.state = 'out';
        } else {
            this.quantity += trade.executedQty;
            this.state = 'in';
        }
        this.commission += trade.commission;
        this.tradeList.push(trade);
    }
    async buy({ priceInfo, parameter, symbol }, quantity) {
        const markPrice = priceInfo.markPrice;
        const buyQuantity = quantity || this.quantity || parameter.baseBuying;//注意购买数量参数的优先级
        //开仓APi
        const buyResult = await client.futuresMarketBuy(symbol, buyQuantity, { positionSide: this.positionSide });
        this.quantity += buyQuantity;
        this.state = 'in';
        //this.addTrade({  })
    }
    async sell({ priceInfo, parameter, symbol }, quantity) {
        const markPrice = priceInfo.markPrice;
        const sellQuantity = quantity || this.quantity;
        //平仓API
        const sellResult = await client.futuresMarketSell(symbol, sellQuantity, { positionSide: this.positionSide });
        this.quantity -= sellQuantity;
        if (this.quantity === 0) this.state = 'out';
    }
    /**更新保证金数据 */
    securityRefresh(btcPrice) {
        if (btcPrice) this.security = Number((btcPrice / this.quantity / 100).toFixed(2));
    }
}


module.exports = class Trade {
    constructor({ executedQty, orderId, time, type, side }) {
        this.executedQty = executedQty;
        this.orderId = orderId;
        this.time = time;
        this.type = type;//'MARKET';
        this.side = side;//'SELL';
        this.profit = 0;
        this.commission = 0;
    }
}

module.exports = class PositionLong extends Position {
    constructor(btcPrice, margin) {
        super('LONG');
        this.orderInfo = {}//订单信息
        this.securityRefresh(btcPrice);
        //这里加入更加智能、复杂、灵活的判断以调整敏感度
        const autoLevelFn = ((level) => {
            return level;
        }).bind(margin);
        this.rnflexion_buy = new Rnflexion('多-拐点入场', 'up', 1, autoLevelFn);
        this.rnflexion_sell = new Rnflexion('多-拐点出场', 'down', 1, autoLevelFn);
    }
    onframe({ priceInfo, parameter }) {
        this.rnflexion_sell.onframe(priceInfo.markPrice);
        this.rnflexion_buy.onframe(priceInfo.markPrice);
    }
}

module.exports = class PositionShort extends Position {
    constructor(btcPrice, margin) {
        super('SHORT');
        this.orderInfo = {}//订单信息
        this.securityRefresh(btcPrice);
        //这里加入更加智能、复杂、灵活的判断以调整敏感度
        const autoLevelFn = ((level) => {
            return level;
        }).bind(margin);
        this.rnflexion_buy = new Rnflexion('空-拐点入场', 'down', 1, autoLevelFn);
        this.rnflexion_sell = new Rnflexion('空-拐点出场', 'up', 1, autoLevelFn);
    }
    onframe({ priceInfo }) {
        this.rnflexion_sell.onframe(priceInfo.markPrice);
        this.rnflexion_buy.onframe(priceInfo.markPrice);
        // if (this.state === 'in') {
        //     this.rnflexion_sell.onframe();
        // } else {
        //     this.rnflexion_buy.onframe();
        // }
    }
}