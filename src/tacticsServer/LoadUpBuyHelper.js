/*
 * @Author: weishere.huang
 * @Date: 2020-09-02 18:19:58
 * @LastEditTime: 2020-09-09 17:16:47
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
        this.step = [
            { rate: 10, times: 1 },
            { rate: 20, times: 1 },
            { rate: 25, times: 1 },
            { rate: 30, times: 1 }
        ];
        this.roundId = Date.parse(new Date());//当前的买卖回合ID
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
        //获取已经加仓的数量，从最高开始检测，一旦符合条件，即加仓且中止判断，忽略之后的条件
        const thisLoadUp = this.loadUpList.filter(item => (item.mod === 'step' && item.roundId === this.roundId));
        const maxRateLoadUp = thisLoadUp.length === 0 ? { rate: 0 } : [...thisLoadUp].sort((a, b) => b.rate - a.rate).shift();
        for (let i = this.step.length - 1; i >= 0; i--) {
            const step = this.step[i];
            if (thisLoadUp.length < this.step.length && step.rate <= rate && maxRateLoadUp.rate !== step.rate) {
                const buyAmount = step.times * this.tactices.parameter.usdtAmount;
                this.tactices.addHistory('info', `【补仓】跌幅到止损线的${step.rate}%，触及step模式补仓，补仓${step.times}倍！`, true, { color: '#D2746B' });
                this.loadUpBuy(buyAmount);
                const obj = this.pushLoadUpList({
                    times: step.times,
                    amount: buyAmount,
                    mod: 'step',
                    rate: step.rate
                });
                return obj;
            }
        }
        return false;
    }
    safeCheck() {

    }
    /**加仓 */
    loadUpBuy(amount) {
        this.tactices.deal('buy', amount);
    }
    nextRound() {
        this.roundId = Date.parse(new Date());
    }
    run() {
        //const tactices = require('./TacticesCommand').getInstance().tacticsList.find(item => item.id === tid);
        if (this.mod === 'step') {
            const result = this.stepCheck();
            if (result) {

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
            'mod', 'safe', 'TimeAmount', 'step', 'roundId', 'loadUpList'
        ].forEach(item => result[item] = this[item]);
        return result;
    }
};