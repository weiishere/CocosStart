/*
 * @Author: weishere.huang
 * @Date: 2020-09-25 15:49:50
 * @LastEditTime: 2020-09-30 15:09:44
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { client } = require('../lib/binancer');
const dateFormat = require('format-datetime');
const { ExchangeDB } = require('../db');


class Exchange {
    constructor(symbol, tid, roundId) {
        this.id = 0;//交易DB的ID
        this.symbol = symbol;//交易对
        this.tid = tid;
        this.expectDealQuantity = 0;//期望的交易数量
        this.dealQuantity = 0;//交易的币数量
        this.dealAmount = 0;//交易完成之后的实际交易额
        this.marketPrice = 0;//交易时的市场价
        this.dealPrice = 0;//交易完成之后的实际平均价格
        this.dealDate = '';
        this.imitateRun = false;
        this.commission = 0;//手续费
        this.roundId = roundId;
        this.orderId = 0;
        this.dealThenInfo = {}//交易发生后的交易信息
        this.costing = 0;
        this.dealType = '';
        this.signStr = ''
    }

    async saveToDB({ uid }) {
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
            dealType: this.dealType,//this instanceof BuyDeal ? 'buy' : 'sell',
            uid, tid: this.tid,
            roundId: this.roundId,
            expectDealQuantity: this.expectDealQuantity,
            dealQuantity: this.dealQuantity,
            dealAmount: this.dealAmount,
            marketPrice: this.marketPrice,
            dealPrice: this.dealPrice,
            commission: this.commission,
            imitateRun: this.imitateRun,
            dealQuantity: this.dealQuantity,
            dealThenInfo: this.dealThenInfo,
            dealDate: this.dealDate,
            costing: this.costing,
            signStr: this.signStr
        }, (e) => {
            console.log('存储Exchange出错', e);
        }))
        if (result) this.id = result.id;
    }
}

class BuyDeal extends Exchange {
    /**传入是否模拟，当前市场价，期望买入的币数量 */
    constructor(symbol, tid, roundId, imitateRun, marketPrice, expectDealQuantity) {
        super(symbol, tid, roundId);
        this.expectDealQuantity = expectDealQuantity;
        this.imitateRun = imitateRun;
        this.marketPrice = marketPrice;
        this.dealType = 'buy';
    }
    async deal(serviceCharge) {
        this.dealDate = Date.parse(new Date());//dateFormat(new Date(), "yyyy/MM/dd HH:mm");
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
            this.dealAmount = this.dealQuantity * this.marketPrice;
            this.dealPrice = this.marketPrice;
            this.commission += Number(this.dealAmount * serviceCharge);
        }
        this.costing = this.dealAmount + this.commission;
    }
}
class SellDeal extends Exchange {
    constructor(symbol, tid, roundId, imitateRun, marketPrice, expectDealQuantity) {
        super(symbol, tid, roundId);
        this.expectDealQuantity = expectDealQuantity;
        this.imitateRun = imitateRun;
        this.marketPrice = marketPrice;
        this.dealType = 'sell';
    }
    async deal(serviceCharge) {
        this.dealDate = Date.parse(new Date());//dateFormat(new Date(), "yyyy/MM/dd HH:mm");
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
            this.dealAmount = this.dealQuantity * this.marketPrice;
            this.dealPrice = this.marketPrice;
            this.commission += Number(this.dealAmount * serviceCharge);
        }
        this.costing = this.dealAmount - this.commission;
    }
}

module.exports = { BuyDeal, SellDeal }