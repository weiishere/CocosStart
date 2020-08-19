/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 13:49:13
 * @LastEditTime: 2020-08-19 18:56:51
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { Symbol } = require('../db');
const { default: Item } = require('antd/lib/list/Item');

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
            method: async () => {
                return [];
            }
        },
        {
            key: 'bollStandard',
            desc: 'BOLL布林指标',
            method: async () => {
                const symbolList = await Symbol.findAll();
                symbolList.forEach(item => {
                    const symbolItem = item.klineData5m;
                });
                return []
            }
        }
    ]
}

module.exports = { ...helpers };


/*
中轨线（MB）、上轨线（UP）和下轨线（DN）的计算，其计算方法如下：
日BOLL指标的计算公式
中轨线=N日的移动平均线
上轨线=中轨线+两倍的标准差
下轨线=中轨线－两倍的标准差

日BOLL指标的计算过程
1）计算MA
MA=N日内的收盘价之和÷N

2）计算标准差MD
MD=平方根N日的（C－MA）的两次方之和除以N

3）计算MB、UP、DN线
MB=N日的MA
UP=MB+2×MD
DN=MB－2×MD

各大股票交易软件默认N是20，所以MB等于当日20日均线值
 */