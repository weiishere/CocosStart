/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:43:33
 * @LastEditTime: 2020-09-30 17:27:46
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const uuid = require('uuid');
const { getRoundResultList } = require('./roundResult')

module.exports = class Tactics {
    constructor(uid, name, parameter) {
        this.name = name;
        this.uid = uid;
        this.parameter = parameter;
        this.strategy = {};//应用的策略(id:123,name:'')
        this.id = this.getNewId('t_');//uuid.v1()
        this.historyStatistics = {};
    }
    getNewId(sign) {
        return (sign || '') + (parseInt(Math.random() * 1000000000) + Date.parse(new Date()) / 1000);
    }
    async doHistoryStatistics() {
        const roundResultList = await getRoundResultList({ uid: this.uid, tid: this.id });
        let totalProfit = 0;//历史总盈亏
        let totalCommission = 0;//历史总手续费
        let roundCount = 0;//交易回合次数
        let winRoundCount = 0;//盈利次数
        let averageProfit = 0;//平均盈亏
        let averageBuyingTime = 0;//平均场内耗时
        let averagePutInto = 0;//平均投入U
        let averageLoadUpCount = 0;//平均补仓次数
        //let switchSymbolCount = 0;//成功切币次数

        let totalBuyingTime = 0;
        let totalPutInto = 0;
        let totalLoadUpCount = 0;
        roundResultList.forEach(roundResult => {
            totalProfit += roundResult.profit;
            totalCommission += roundResult.commission;
            if (roundResult.profit > 0) winRoundCount++;
            totalBuyingTime += (roundResult.endTime - roundResult.startTime);
            totalPutInto += roundResult.inCosting;
            totalLoadUpCount += roundResult.loadUpBuy.length;
        });
        roundCount = roundResultList.length;
        averageProfit = roundCount === 0 ? 0 : totalProfit / roundCount;
        averageBuyingTime = roundCount === 0 ? 0 : totalBuyingTime / roundCount;
        averagePutInto = roundCount === 0 ? 0 : totalPutInto / roundCount;
        averageLoadUpCount = roundCount === 0 ? 0 : totalLoadUpCount / roundCount;

        this.historyStatistics = {
            totalProfit,
            totalCommission,
            roundCount,
            winRoundCount,
            averageProfit,
            averageBuyingTime,
            averagePutInto,
            averageLoadUpCount
        }
    }
}

