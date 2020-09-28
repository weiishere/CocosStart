/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:43:33
 * @LastEditTime: 2020-09-28 17:57:40
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const uuid = require('uuid');

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
    doHistoryStatistics() {
        const totalProfit = 0;//历史总盈亏
        const totalCommission = 0;//历史总手续费
        const roundCount = 0;//交易回合次数
        const winRoundCount = 0;//盈利次数
        const averageProfit = 0;//平均盈亏
        const averageBuyInTime = 0;//平均入场耗时
        const averageSellOutTime = 0;//平均出场耗时
        const averagePutInto = 0;//平均投入U
        const averageLoadUpCount = 0;//平均补仓次数
        const switchSymbolCount = 0;//成功切币次数
        return {
            totalProfit, totalCommission, roundCount, winRoundCount, averageProfit, averageBuyInTime, averageSellOutTime, switchSymbolCount, averagePutInto, averageLoadUpCount
        }
    }
}

