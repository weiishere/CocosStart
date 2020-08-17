/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 13:49:13
 * @LastEditTime: 2020-08-14 19:27:49
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const helpers = {
    //入场条件
    premiseForBuy: [
        {
            key: 'last5kRise',
            desc: '上一条5分线是涨势',
            method: (tactics) => { return false; }
        },
        {
            key: 'last20mNoFastRise',
            desc: '前20分钟未出现急涨(+5%)',
            method: (tactics) => { return true; }
        },
        {
            key: 'last20mFastLoss',
            desc: '前20分钟出现急跌，选择埋伏(-5%)',
            method: (tactics) => { return true; }
        }
    ],
    //出场条件
    premiseForSell: [
        {
            key: '5kNoFastLoss',
            desc: '前5分钟内未出现急跌(-9%)',
            method: (tactics) => { return true; }
        }
    ],
    //动态调整参数
    dynamicParam: [
        {
            key: 'setRiseStopLossRate',
            desc: '根据涨幅调整止盈拐点跌幅',
            method: (tactics) => {
                let riseRate = tactics.getProfit() / tactics.presentDeal.costing;
                if (riseRate >= 0.1) {
                    //盈利大于10个点
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.1;
                } else if (riseRate >= 0.08 && riseRate < 0.1) {//8~10个点
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.25;
                } else if (riseRate >= 0.06 && riseRate < 0.8) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.4;
                } else if (riseRate >= 0.04 && riseRate < 0.6) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.55;
                } else if (riseRate >= 0.02 && riseRate < 0.4) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.7;
                } else if (riseRate >= 0.01 && riseRate < 0.2) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.85;
                } else if (riseRate < 0.01) {//小于0.01，意思没动
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate;
                }
            }
        },
        {
            key: 'setLossStopRiseRate',
            desc: '跌幅过大时调整拐点止损值',
            method: (tactics) => {
                let lossRate = tactics.getProfit() / tactics.presentDeal.costing;
                if (lossRate <= -0.1 && lossRate >= -0.08) {
                    //最大亏损大于在8-10个点，回本7个点就止盈
                    tactics.parameter.lossStopRiseRate = 0.07;
                } else if (lossRate <= -0.08 && lossRate >= -0.06) {
                    //最大亏损大于在6-8个点，回本5个点就止盈
                    tactics.parameter.lossStopRiseRate = 0.05;
                } else {
                    tactics.parameter.lossStopRiseRate = tactics.parameterBackup.lossStopRiseRate;
                }
            }
        }
    ],
    //选币方案
    symbolElecter: [
        {
            key: 'LossToRiseInflexion',
            desc: '下跌拐点型，30分钟下跌5%以上，然后回调1%',
            method: () => {
                
            }
        }
    ]
}

module.exports = { ...helpers };