/*
 * @Author: weishere.huang
 * @Date: 2020-09-25 15:49:50
 * @LastEditTime: 2020-09-26 16:33:11
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { client } = require('../lib/binancer');
const dateFormat = require('format-datetime');
const { ExchangeDB } = require('../db');


class Exchange {
    constructor(symbol, roundId) {
        this.id = 0;//交易DB的ID
        this.symbol = symbol;//交易对
        //this.usdtQuantity = 0;//涉及的usdt数量
        this.expectDealQuantity = 0;//期望的交易数量
        this.dealQuantity = 0;//交易的币数量
        this.dealAmount = 0;//交易完成之后的实际交易额
        this.marketPrice = 0;//交易时的市场价
        this.dealPrice = 0;//交易完成之后的实际平均价格
        this.dealDate = new Date();
        this.imitateRun = false;
        this.commission = 0;//手续费
        this.orderId = roundId;
        this.dealThenInfo = {}//交易发生后的交易信息
    }

    async saveToDB({ uid, tid }) {
        // symbol: String,
        // orderId: String,
        // dealType: String,
        // roundId: String,
        // uid: String,
        // tid: String,
        // expectDealQuantity: { type: Number, default: 0 },
        // dealQuantity: { type: Number, default: 0 },
        // dealAmount: { type: Number, default: 0 },
        // marketPrice: { type: Number, default: 0 },
        // dealPrice: { type: Number, default: 0 },
        // commission: { type: Number, default: 0 },
        // imitateRun: { type: Boolean, default: true },
        // dealQuantity: { type: Number, default: 0 },
        // dealDate: { type: Date, default: Date.now }
        const result = (await ExchangeDB.create({
            symbol: this.symbol,
            dealType: this instanceof BuyDeal ? 'buy' : 'sell',
            uid, tid,
            expectDealQuantity: this.expectDealQuantity,
            dealQuantity: this.dealQuantity,
            dealAmount: this.dealAmount,
            marketPrice: this.marketPrice,
            dealPrice: this.dealPrice,
            commission: this.commission,
            imitateRun: this.imitateRun,
            dealQuantity: this.dealQuantity,
            dealThenInfo: this.dealThenInfo
        }, (e) => {
            console.log('存储Exchange出错', e);
        }))
        this.id = result.id;
    }
}

class BuyDeal extends Exchange {
    /**传入是否模拟，当前市场价，期望买入的币数量 */
    constructor(symbol, roundId, imitateRun, marketPrice, expectDealQuantity) {
        super(symbol, roundId);
        this.expectDealQuantity = expectDealQuantity;
        this.imitateRun = imitateRun;
        this.marketPrice = marketPrice;
    }
    async deal() {
        this.dealDate = dateFormat(new Date(), "yyyy/MM/dd HH:mm");
        if (!this.imitateRun) {
            const { status, type, transactTime, executedQty, orderId, origQty, fills, symbol } = await client.order({
                symbol: this.symbol,
                type: 'MARKET',
                side: 'BUY',
                quantity: this.expectDealQuantity
            });
            this.orderId = orderId;
            fills.forEach(item => {
                //通过BNB交手续费，那么这里导致数量不会扣减，就是实际到账数量
                this.dealQuantity += Number(item.qty);
                this.dealAmount += Number(item.qty) * Number(item.price);
                this.commission += Number(item.commission);
            });
            this.dealPrice = this.dealAmount / this.dealQuantity;
        } else {
            this.dealQuantity = this.expectDealQuantity;
            this.dealAmount = this.expectDealQuantity * this.marketPrice;
            this.dealPrice = this.marketPrice;
        }
    }
}
class SellDeal extends Exchange {
    constructor(symbol, roundId, imitateRun, marketPrice, expectDealQuantity) {
        super(symbol, roundId);
        this.expectDealQuantity = expectDealQuantity;
        this.imitateRun = imitateRun;
        this.marketPrice = marketPrice;
    }
    async deal() {
        this.dealDate = dateFormat(new Date(), "yyyy/MM/dd HH:mm");
        if (!this.imitateRun) {
            const { status, type, transactTime, executedQty, orderId, origQty, fills, symbol } = await client.order({
                symbol: this.symbol,
                type: 'MARKET',
                side: 'SELL',
                quantity: this.expectDealQuantity
            });
            this.orderId = orderId;
            fills.forEach(item => {
                //通过BNB交手续费，那么这里导致数量不会扣减，就是实际到账数量
                this.dealQuantity += Number(item.qty);
                this.dealAmount += Number(item.qty) * Number(item.price);
                this.commission += Number(item.commission);
            });
            this.dealPrice = this.dealAmount / this.dealQuantity;
        } else {
            this.dealQuantity = this.expectDealQuantity;
            this.dealAmount = this.expectDealQuantity * this.marketPrice;
            this.dealPrice = this.marketPrice;
        }
    }
}

module.exports = { Exchange, BuyDeal, SellDeal }