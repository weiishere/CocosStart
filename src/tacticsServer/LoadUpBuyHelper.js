/*
 * @Author: weishere.huang
 * @Date: 2020-09-02 18:19:58
 * @LastEditTime: 2020-10-06 19:38:36
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const dateFormat = require('format-datetime');
const restrainGroup = require('./restrainGroup');

module.exports = class LoadUpBuyHelper {
    constructor(tactices) {
        this.tactices = tactices;
        this.mod = 'step';//target-目标模式，对资金要求很高，即补仓量不恒定，只要涨一定的额度，即可回本
        this.target = 0.01;//回本涨幅：mod=target时生效，原理：只要涨幅是设定值，即可回本，以此来决定补仓数量
        this.restrainEnable = true;//约束开启开关，在满足补仓条件下，还需满足正在回调
        this.isStopRise = false;//是否盈利即离场
        this.maxTimeAmount = 10;//补仓的最高倍数：如果补仓倍数超过原始资金的倍数，会终止
        this.dynamicGrids = 'dynamic';//默认动态补仓
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
        this.stepGrids = [
            { index: 1, rate: 0, times: 1 },
            { index: 2, rate: 0, times: 0.5 },
            { index: 3, rate: 0, times: 1 },//第三次补仓，劳资给你多来点儿
            { index: 4, rate: 0, times: 0.5 },
            { index: 5, rate: 0, times: 1 }
        ];
        if (this.dynamicGrids === 'wave') {
            const stepDivisor = i => parseInt(10 + (level + i) * i * 1.1);
            this.stepGrids.forEach((item, i) => item.rate = stepDivisor(i + 1));
            this.tactices.addHistory('info', `波动网格，波动因子为${level}，补仓网格已调整为[${this.stepGrids.map(i => i.rate).join('->')}]`, true, { color: "#759AA0" });
        } else if (this.dynamicGrids === 'default') {
            this.stepGrids.forEach((item, i) => item.rate = 10 + i * 5);
            this.tactices.addHistory('info', `静态网格，补仓网格为[${this.stepGrids.map(i => i.rate).join('->')}]`, true, { color: "#759AA0" });
        } else if (this.dynamicGrids === 'dynamic') {
            //符合金叉或者boll线，才补仓，这里重置this.stepGrids的rate都为0，检查的时候会逐级检查，若为0就赋值并传送
            this.stepGrids = [
                { index: 1, rate: 0, times: 1 },
                { index: 2, rate: 0, times: 1 },
                { index: 3, rate: 0, times: 2 },//第三次补仓，劳资给你多来点儿
                { index: 4, rate: 0, times: 1 },
                { index: 5, rate: 0, times: 1 }
            ];
            this.tactices.addHistory('info', `动态网格，遵循BOLL或KDJ寻找底部择机补仓`, true, { color: "#759AA0" });
        }
    }
    pushLoadUpList({ index, times, amount, mod, rate, type }) {
        const obj = {
            type,
            roundId: this.roundId,
            time: dateFormat(new Date(), "yyyy/MM/dd HH:mm"),
            index, times, amount, mod, rate,
            price: this.tactices.presentPrice,
            pal: this.tactices.getProfit()
        }
        this.loadUpList.push(obj);
        return obj;
    }
    //加仓检查
    stepCheckForLoadUp() {
        if (this.tactices.presentDeal.historyProfit > 0) return false;//这句代码暂时也没太大意义，传过来的数据肯定是负值，不过还是约束下
        //获取最高亏损与止损值的比例
        const rate = Math.abs((this.tactices.getProfit() / this.tactices.presentDeal.inCosting) / this.tactices.parameter.stopLossRate) * 100;
        let nextLoadUp;
        if (this.dynamicGrids === 'dynamic' && rate > 10) {
            if (!this.stepGrids.some(item => item.rate === 0)) return null;
            //获取入场约束中的BOLL和KDJ约束（满足其一即可）
            const arr = restrainGroup.premiseForBuy.filter(item => item.key === 'bollStandardDN' || item.key === 'KDJStandard');
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].method(this.tactices)) {
                    for (let j = 0; j < this.stepGrids.length; j++) {
                        if (this.stepGrids[j].rate === 0) {
                            this.stepGrids[j].rate = rate.toFixed(3);
                            nextLoadUp = this.stepGrids[j];
                            return nextLoadUp;
                        }
                    }
                }
            }
        } else {
            //获取最高补仓记录
            const thisLoadUp = this.loadUpList.filter(item => (item.mod === 'step' && item.roundId === this.roundId));//获取本轮交易的补仓记录
            const maxLoadUpIndex = thisLoadUp.length === 0 ? 0 : [...thisLoadUp].sort((a, b) => b.index - a.index).shift().index;//获取最大亏损时的补仓记录(根据序号)
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
            if (nextLoadUp && nextLoadUp.rate < rate) return nextLoadUp;
        }
        return null;
    }
    //减仓检查
    async stepCheckForLightenUp() {
        if (this.tactices.presentDeal.historyProfit > 0) return false;//这句代码暂时也没太大意义，传过来的数据肯定是负值，不过还是约束下
        //获取最高亏损与止损值的比例
        //const rate = Math.abs((this.tactices.getProfit() / this.tactices.presentDeal.inCosting) / this.tactices.parameter.stopLossRate) * 100;
        if (!this.tradeDone) return;
        this.tradeDone = false;
        //(i.type === '+' || !i.type)是为了兼容之前的加仓没有+符号
        if (this.loadUpList.some(i => (i.price < this.tactices.presentPrice && (i.type === '+' || !i.type)))
            && this.loadUpList.filter(i => i.type === '-').length < this.stepGrids.length) {
            this.tactices.addHistory('info', `【减仓检测】符合减仓条件，开始检测补仓记录寻求试图减仓`, true, { color: '#D2746B', tempMsg: true, subType: 'lub' });
        } else {
            //this.tactices.addHistory('info', `【减仓检测】当前价格不符合减仓初始条件...`, true, { color: '#D2746B', tempMsg: true, subType: 'lub2' });
            this.tradeDone = true;
            return;
        }
        for (let i = 0; i < this.loadUpList.length; i++) {
            const item = this.loadUpList[i];
            if (+item.price < this.tactices.presentPrice && !this.loadUpList.some(i => (i.index === item.index && i.type === '-'))) {
                this.tactices.addHistory('info', `【减仓检测】市场价回到最近补仓点，此补仓价格为：${item.price}，观察5秒后价格判断是否减仓`, true, { color: '#D2746B' });
                const price = this.tactices.presentPrice;
                await new Promise((resolve) => {
                    setTimeout(async () => {
                        this.tradeDone = true;
                        if (this.tactices.presentPrice - price > 0) {
                            this.tactices.addHistory('info', `价格处于上升趋势，暂缓减仓...`, true, { color: '#D2746B' });
                        } else {
                            if (+item.price < this.tactices.presentPrice) {
                                //价格仍然大于减仓价格点
                                this.tactices.addHistory('info', `价格回落，开始执行减仓，减仓${item.times}倍(预计${item.amount / this.tactices.presentPrice}枚${this.tactices.symbol})！`, true, { color: '#D2746B' });
                                await this.tactices.deal('sell', item.amount / this.tactices.presentPrice);
                                const result = this.pushLoadUpList({
                                    type: '-',
                                    index: item.index,
                                    times: item.times,
                                    amount: item.amount,
                                    mod: 'step'
                                });
                            }
                        }
                        resolve(true);
                    }, 5000);
                })
                break;
            }
        }
        this.tradeDone = true;
    }
    safeCheck() {

    }
    async run(roundId, rightNow) {
        //5分钟之内不能重复补仓
        if (this.lightenMod) {
            //减仓模式
            await this.stepCheckForLightenUp();
            return;
        }
        const nowDate = Date.parse(new Date());
        if (nowDate - this.lastLoadUpTime < 60000 * this.intervalTime) {
            this.tactices.addHistory('info', `离上次补仓时间不及${this.intervalTime}分钟，暂不补仓...`, true, { color: "#759AA0", tempMsg: true, subType: 'lub' });
            return;
        }
        if (!this.tradeDone) return;
        this.roundId = roundId;
        //const tactices = require('./TacticesLauncher').getInstance().tacticsList.find(item => item.id === tid);
        this.tradeDone = false;
        if (this.mod === 'step') {
            const nextLoadUp = this.stepCheckForLoadUp();
            if (nextLoadUp) {
                if (!rightNow && this.restrainEnable) {
                    this.tactices.addHistory('info', `【补仓检测】跌幅到止损线的${nextLoadUp.rate}%，触及step模式补仓，观察5秒后价格`, true, { color: '#D2746B' });
                    const price = this.tactices.presentPrice;
                    await new Promise((resolve) => {
                        setTimeout(async () => {
                            this.tradeDone = true;
                            if (this.tactices.presentPrice - price > 0) {
                                await this.run(roundId, true);
                            } else {
                                this.tactices.addHistory('info', `价格仍然下跌，延缓补仓，继续观察...`, true, { color: '#D2746B' });
                            }
                            resolve(true);
                        }, 5000);
                    })
                } else {
                    this.lastLoadUpTime = nowDate;
                    const buyAmount = nextLoadUp.times * this.tactices.parameter.usdtAmount;
                    const result = this.pushLoadUpList({
                        type: '+',
                        index: nextLoadUp.index,
                        times: nextLoadUp.times,
                        amount: buyAmount,
                        mod: 'step',
                        rate: nextLoadUp.rate
                    });
                    this.tactices.addHistory('info', `补仓${result.times}倍(预计${result.amount / result.price}枚${this.tactices.symbol})！`, true, { color: '#D2746B' });
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
            'mod', 'target', 'maxTimeAmount', 'restrainEnable', 'dynamicGrids', 'lightenMod', 'isStopRise', 'intervalTime', 'stepGrids', 'roundId', 'loadUpList'
        ].forEach(item => result[item] = this[item]);
        return result;
    }
};