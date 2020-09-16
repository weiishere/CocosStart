/*
 * @Author: weishere.huang
 * @Date: 2020-09-02 18:19:58
 * @LastEditTime: 2020-09-16 17:57:01
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const dateFormat = require('format-datetime');

module.exports = class LoadUpBuyHelper {
    constructor(tactices) {
        this.tactices = tactices;
        this.mod = 'step';//safe-安全模式，对资金要求很高，即补仓量不恒定，只要涨一定的额度，即可回本
        this.safe = 0.01;//回本涨幅：mod=safe时生效，原理：只要涨幅是设定值，即可回本，以此来决定补仓数量

        this.TimeAmount = 10;//补仓的最高倍数：如果补仓倍数超过原始资金的倍数，会终止
        this.stepGrids = [
            { rate: 10, times: 1 },
            { rate: 15, times: 1 },
            { rate: 20, times: 1 },
            { rate: 25, times: 1 }
        ];
        this.roundId;//当前的买卖回合ID
        this.loadUpList = [
            // {
            //     roundId: 0,
            //     time: 'MM-dd HH:mm:ss',//补仓时间
            //     times: 2,//第几次补仓
            //     amount: 100,//补仓额度
            //     mod: 'step',//补仓模式
            //     rate: 50,
            //     pal: -0.00233//Profit and loss，补仓时的盈亏
            // }
        ]
        //补仓历史记录
    }
    pushLoadUpList({ times, amount, mod, rate }) {
        const obj = {
            roundId: this.roundId,
            time: dateFormat(new Date(), "yyyy/MM/dd HH:mm"),
            times, amount, mod, rate,
            price: this.tactices.presentPrice,
            pal: this.tactices.getProfit()
        }
        this.loadUpList.push(obj);
        return obj;
    }
    stepCheck() {
        //获取亏损与止损值的比例
        const rate = Math.abs((this.tactices.getProfit() / this.tactices.presentDeal.costing) / this.tactices.parameter.stopLossRate) * 100;
        //获取最高补仓记录
        const thisLoadUp = this.loadUpList.filter(item => (item.mod === 'step' && item.roundId === this.roundId));//获取本轮交易的补仓记录
        const maxRateLoadUp = thisLoadUp.length === 0 ? { rate: 0 } : [...thisLoadUp].sort((a, b) => b.rate - a.rate).shift();//获取最大亏损时的补仓记录
        let result;
        this.stepGrids.reduce((pre, cur) => {
            //loadUpList里面没有rate记录，并且大于最大亏损补仓记录，才能补仓
            if (pre.rate < rate && rate < cur.rate && !this.loadUpList.some(item => item.rate === pre.rate && item.roundId === this.roundId) && maxRateLoadUp.rate < rate) {
                const buyAmount = pre.times * this.tactices.parameter.usdtAmount;
                result = this.pushLoadUpList({
                    times: pre.times,
                    amount: buyAmount,
                    mod: 'step',
                    rate: pre.rate
                });
            }
            return cur;
        });

        return result;
    }
    safeCheck() {

    }
    run(roundId) {
        this.roundId = roundId;
        //const tactices = require('./TacticesCommand').getInstance().tacticsList.find(item => item.id === tid);
        if (this.mod === 'step') {
            const result = this.stepCheck();
            if (result) {
                this.tactices.addHistory('info', `【补仓】跌幅到止损线的${result.rate}%，触及step模式补仓，补仓${result.times}倍(预计${result.amount}枚${this.tactices.symbol})！`, true, { color: '#D2746B' });
                this.tactices.deal('buy', result.amount);
            }
        } else if (this.mod === 'safe') {
            const result = this.safeCheck();
            if (result) {

            }
        }
    }
    getInfo() {
        let result = {};
        [
            'mod', 'safe', 'TimeAmount', 'stepGrids', 'roundId', 'loadUpList'
        ].forEach(item => result[item] = this[item]);
        return result;
    }
};