/*
 * @Author: weishere.huang
 * @Date: 2020-09-02 18:19:58
 * @LastEditTime: 2020-10-01 00:32:11
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const dateFormat = require('format-datetime');

module.exports = class LoadUpBuyHelper {
    constructor(tactices) {
        this.tactices = tactices;
        this.mod = 'step';//target-目标模式，对资金要求很高，即补仓量不恒定，只要涨一定的额度，即可回本
        this.target = 0.01;//回本涨幅：mod=target时生效，原理：只要涨幅是设定值，即可回本，以此来决定补仓数量
        this.restrainEnable = false;//约束开启开关，在满足补仓条件下，还需满足正在回调
        this.isStopRise = false;//是否盈利即离场
        this.maxTimeAmount = 10;//补仓的最高倍数：如果补仓倍数超过原始资金的倍数，会终止
        this.dynamicGrids = true;
        //this.setStepGrids();
        this.roundId;//当前的买卖回合ID
        this.lastLoadUpTime = 0;
        this.intervalTime = 5;//补仓间隔（分钟）
        this.tradeDone = true;
        this.lightenMod = false;//减仓模式
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
    setStepGrids() {
        const level = parseInt(this.tactices.averageWave * 1000);
        let arr = [
            { index: 1, rate: 0, times: 0.5 },
            { index: 2, rate: 0, times: 0.5 },
            { index: 3, rate: 0, times: 1 },//第三次补仓，劳资给你多来点儿
            { index: 4, rate: 0, times: 0.5 },
            { index: 5, rate: 0, times: 0.5 }
        ];
        if (this.dynamicGrids) {
            //[1,2,3,4,5].map(i=>parseInt((i * (1+i)*0.7 + 6)))
            const stepDivisor = i => parseInt(i * (level + 1 + i) * 0.5 + 8);
            arr.forEach((item, i) => item.rate = stepDivisor(i + 1));
        } else {
            arr.forEach((item, i) => item.rate = 10 + i * 5);
        }
        this.stepGrids = arr;
        this.tactices.addHistory('info', `Level因子为${level}，补仓网格已调整为[${arr.map(i => i.rate).join('->')}]`, true, { color: "#759AA0" });
    }
    pushLoadUpList({ index, times, amount, mod, rate }) {
        const obj = {
            roundId: this.roundId,
            time: dateFormat(new Date(), "yyyy/MM/dd HH:mm"),
            index, times, amount, mod, rate,
            price: this.tactices.presentPrice,
            pal: this.tactices.getProfit()
        }
        this.loadUpList.push(obj);
        return obj;
    }
    stepCheck() {
        if (this.tactices.presentDeal.historyProfit > 0) return false;//这句代码暂时也没太大意义，传过来的数据肯定是负值，不过还是约束下
        let result;
        //获取最高亏损与止损值的比例
        const rate = Math.abs((this.tactices.getProfit() / this.tactices.presentDeal.inCosting) / this.tactices.parameter.stopLossRate) * 100;
        //获取最高补仓记录
        const thisLoadUp = this.loadUpList.filter(item => (item.mod === 'step' && item.roundId === this.roundId));//获取本轮交易的补仓记录
        const maxLoadUpIndex = thisLoadUp.length === 0 ? 0 : [...thisLoadUp].sort((a, b) => b.index - a.index).shift().index;//获取最大亏损时的补仓记录(根据序号)
        let nextLoadUp;
        for (let i = 0; i < this.stepGrids.length; i++) {
            if ((this.stepGrids[i].index === maxLoadUpIndex || maxLoadUpIndex === 0) && i !== this.stepGrids.length - 1) {
                if (maxLoadUpIndex === 0) {
                    nextLoadUp = this.stepGrids[0]
                } else {
                    nextLoadUp = this.stepGrids[i + 1];
                }
                break;
            }
        }
        if (nextLoadUp && nextLoadUp.rate < rate) {
            //5分钟之内不能重复补仓
            const nowDate = Date.parse(new Date());
            if (nowDate - this.lastLoadUpTime < 60000 * this.intervalTime) {
                this.tactices.addHistory('info', `离上次补仓时间不及${this.intervalTime}分钟，暂不补仓...`, true, { color: "#759AA0" });
            } else {
                return nextLoadUp;
            }
        }
        //#region 
        /*
        const maxRateLoadUp = thisLoadUp.length === 0 ? { rate: 0 } : [...thisLoadUp].sort((a, b) => b.key - a.key).shift();//获取最大亏损时的补仓记录
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
        */
        //#endregion
        return null;
    }
    safeCheck() {

    }
    async run(roundId, rightNow) {
        if (!this.tradeDone) return;
        this.roundId = roundId;
        //const tactices = require('./TacticesLauncher').getInstance().tacticsList.find(item => item.id === tid);
        this.tradeDone = false;
        if (this.mod === 'step') {
            const nextLoadUp = this.stepCheck();
            if (nextLoadUp) {
                if (!rightNow && restrainEnable) {
                    this.tactices.addHistory('info', `【补仓】跌幅到止损线的${result.rate}%，触及step模式补仓，观察10秒后价格`, true, { color: '#D2746B' });
                    const price = this.tactices.presentPrice;
                    await new Promise((resolve) => {
                        setTimeout(async () => {
                            if (this.tactices.presentPrice - price > 0) {
                                await this.run(roundId, true);
                            } else {
                                this.tactices.addHistory('info', `价格仍然下跌，延缓补仓，继续观察...`, true, { color: '#D2746B' });
                                this.tradeDone = true;
                            }
                        }, 10000);
                    })
                } else {
                    this.lastLoadUpTime = Date.parse(new Date());
                    const buyAmount = nextLoadUp.times * this.tactices.parameter.usdtAmount;
                    const result = this.pushLoadUpList({
                        index: nextLoadUp.index,
                        times: nextLoadUp.times,
                        amount: buyAmount,
                        mod: 'step',
                        rate: nextLoadUp.rate
                    });
                    this.tactices.addHistory('info', `【补仓】补仓${result.times}倍(预计${result.amount / result.price}枚${this.tactices.symbol})！`, true, { color: '#D2746B' });
                    await this.tactices.deal('buy', result.amount / result.price);
                    this.tactices.presentDeal.historyProfit = this.tactices.getProfit();//需要重置一下最高亏损，不然可能导致重复补仓
                    this.loadUpList[this.loadUpList.length - 1].price = this.tactices.presentDeal.dealPrice;//更新买入价格
                    this.tradeDone = true;
                }
            } else {
                this.tradeDone = true;
            }
        } else if (this.mod === 'target') {
            const result = this.safeCheck();
            if (result) {

            }
        }
    }
    getInfo() {
        let result = {};
        [
            'mod', 'target', 'maxTimeAmount', 'restrainEnable', 'dynamicGrids', 'isStopRise', 'intervalTime', 'stepGrids', 'roundId', 'loadUpList'
        ].forEach(item => result[item] = this[item]);
        return result;
    }
};