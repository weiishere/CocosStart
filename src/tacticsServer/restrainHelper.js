/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 13:49:13
 * @LastEditTime: 2020-08-21 19:37:29
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { Symbol } = require('../db');
const { client } = require('../lib/binancer');

const helpers = {
    //入场条件
    premiseForBuy: [
        {
            key: 'last5kRise',
            label: '上5分线涨势',
            desc: '上一条5分线是涨势',
            method: async (tactics) => {
                //上一条5分线显示上涨
                if (!tactics.KLineItem5m.recent) {
                    await client.candles({ symbol: tactics.symbol, interval: '5m', limit: 2 }).then(data => {
                        tactics.KLineItem5m.recent = data[0]
                    });
                }
                if (tactics.KLineItem5m.recent.close - tactics.KLineItem5m.recent.open > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        {
            key: 'last20mNoFastRise',
            label: '前20分钟未出现急涨',
            desc: '前20分钟未出现急涨(+5%)',
            method: (tactics) => { return true; }
        },
        {
            key: 'last24mMaxRise',
            label: '24小时涨幅未大于40%',
            desc: '24小时涨幅已经大于40%未高风险币，不予进场',
            method: (tactics) => { return true; }
        },
        {
            key: 'last10mFastLoss',
            label: '深沟抄底(>-10%)',
            desc: '前10分钟出现急跌10%以上，进行抄底',
            method: (tactics) => { return true; }
        },
        {
            key: 'timeLimit',
            label: '入场时间限制',
            desc: '暂时限制17:30~19：30时间，不适宜入场',
            method: (tactics) => { return true; }
        }
    ],
    //强制出场条件
    premiseForSell: [
        {
            key: 'fastRise',
            label: '波动出现高速下跌',
            desc: '无论盈亏，10秒内的取样值都没高于0.01个点,每次采样的变化速率都是跌，且10秒累计下跌量相对当前价格超过-2%（）',
            method: (tactics) => {
                const speed = tactics.getWaveSpeedList(10);
                for (let i = 0, l = speed.length; i < l; i++) {
                    if (speed[i] / tactics.presentPrice > 0.0001) return false;
                }
                return speed.reduce((pre, cur) => pre + cur, 0) / tactics.presentPrice < -0.02 ? true : false;
            }
        },
        {
            key: 'awaysRise',
            label: '亏损情况下，中高速的持续性下跌',
            desc: '亏损情况下，30秒的取样都是下跌，且30秒相对当前价格累计额下跌量超过-1%，要预防插针请关闭',
            method: (tactics) => {
                const speed = tactics.getWaveSpeedList(30);
                for (let i = 0, l = speed.length; i < l; i++) {
                    if (speed[i] > 0) return false;
                }
                return speed.reduce((pre, cur) => pre + cur, 0) / tactics.presentPrice < -0.01 ? true : false;
            }
        }
    ],
    //动态调整参数
    dynamicParam: [
        {
            key: 'setStopLossRateByHitory',
            label: '根据24小时ticker动态调整止损值',
            desc: '24小时ticker动态调整止损值：(当天最高价-当天开盘价) / 当天开盘价',
            method: (tactics) => {
                const allTicker = require('./TacticesCommand').getInstance().allTicker;
                let ticker = [];
                if (allTicker) {
                    ticker = allTicker.find(item => item.symbol === tactics.symbol);
                } else {
                    return;
                }
                if (ticker) {
                    const stopLossRate = (ticker.high - ticker.open) / ticker.open;
                    if (stopLossRate !== tactics.parameter.stopLossRate) {
                        tactics.parameter.stopLossRate = stopLossRate;
                        tactics.addHistory('info', `止损点已经动态调整为：` + stopLossRate, true, { color: '#dee660' });
                    }
                }
            }
        },
        {
            key: 'setRiseStopLossRate',
            label: '根据涨幅调整止盈拐点跌幅',
            desc: '涨幅过大时调整拐点止盈点，及时出货，保障利润，盈利大于10个点，则拐点调为10%，出场更敏感',
            method: (tactics) => {
                if (!tactics.buyState) return;
                let riseRate = tactics.getProfit() / tactics.presentDeal.costing;
                let lastriseStopLossRate = tactics.parameter.riseStopLossRate;
                if (riseRate >= 0.15) {
                    //盈利大于10个点
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.1;
                } else if (riseRate >= 0.1 && riseRate < 0.15) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.25;
                } else if (riseRate >= 0.8 && riseRate < 0.1) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.4;
                } else if (riseRate >= 0.06 && riseRate < 0.8) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.55;
                } else if (riseRate >= 0.04 && riseRate < 0.6) {
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate * 0.7;
                } else if (riseRate < 0.4) {
                    //小于0.01，意思没动
                    tactics.parameter.riseStopLossRate = tactics.parameterBackup.riseStopLossRate;
                }
                if (lastriseStopLossRate !== tactics.parameter.riseStopLossRate) {
                    tactics.addHistory('info', `止盈点已经动态调整为：${tactics.parameter.riseStopLossRate}%`, true, { color: "#dee660" });
                }

            }
        },
        {
            key: 'setLossStopRiseRate',
            label: '大跌幅后一直横盘调整拐点止损值',
            desc: '历史跌幅过大（超过90%止损值）但未出场，之后后调整拐点止损值，即用于大亏损后恢复一定的比例(相对最大亏损)时候就止损',
            method: (tactics) => {
                if (!tactics.buyState) return;
                if (tactics.presentDeal.historyProfit > 0) return;
                let lossRate = tactics.presentDeal.historyProfit / tactics.presentDeal.costing;//lossRate肯定为负才说明是亏
                let lossStopLossRate = tactics.parameterBackup.lossStopLossRate;
                if (lossRate / tactics.parameter.stopLossRate >= -0.9) {
                    //最大亏损大于在8-10个点，回本7个点就止损
                    lossStopLossRate = 60;//回最大亏损的60就割肉
                    tactics.addHistory('info', `拐点止损(回本增幅%)动态调整为：` + lossStopLossRate, true);
                }
                tactics.parameter.lossStopLossRate = lossStopLossRate;
                if (lossStopLossRate === tactics.parameterBackup.lossStopLossRate) {
                    tactics.addHistory('info', `拐点止损(回本增幅%)动态恢复为：` + lossStopLossRate, true);
                }
            }
        },
        {
            key: 'setStopLossRateByHastyLoss',
            label: '5分内短时间内急跌',
            desc: '5分钟内急跌且突破了止损值，这时要扩大止损值(✖️2)',
            method: (tactics) => {

            }
        },
    ],
    //选币方案
    symbolElecter: [
        {
            key: 'LossToRiseInflexion',
            label: '深沟检测',
            desc: '下跌拐点型，30分钟下跌5%以上，然后回调1%',
            method: async () => {
                return [];
            }
        },
        {
            key: 'bollStandard',
            label: 'BOLL布林指标',
            desc: '使用BOLL布林指标线来辅助选币',
            method: async () => {
                const symbolList = await Symbol.findAll();
                symbolList.forEach(item => {
                    const symbolItem = item.klineData5m;
                });
                return []
            }
        },
        {
            key: 'blacklist',
            label: '黑名单',
            desc: '筛选掉黑名单交易对',
            method: async () => {
                //获取所有的币，
                const blackList = ['BUSDUSDT', 'TUSDUSDT', 'USDCUSDT', 'PAXUSDT', 'AUDUSDT', 'EURUSDT', 'GBPUSDT', 'BTCUSDT', 'LTCUSDT', 'ETHUSDT', 'BCHUSDT', 'EOSUSDT'];
                const allSymbols = tacticesCommand.getInstance().allTicker;
                let index = 1000;//推荐级别千位
                let resultList = [];
                for (let i in allSymbols) {
                    if (allSymbols.hasOwnProperty(i) && !blackList.some(item => item === i)) {
                        resultList.push({ symbol: i, score: --index });
                    }
                }
                return resultList;
            }
        }
    ]
}

module.exports = { ...helpers };


/*
中轨线（MB）,上轨线（UP）和下轨线（DN）的计算，其计算方法如下：
日BOLL指标的计算公式
中轨线=N日的移动平均线
上轨线=中轨线+两倍的标准差
下轨线=中轨线－两倍的标准差

日BOLL指标的计算过程
1）计算MA
MA=N日内的收盘价之和÷N

2）计算标准差MD
MD=平方根N日的（C－MA）的两次方之和除以N

3）计算MB,UP,DN线
MB=N日的MA
UP=MB+2×MD
DN=MB－2×MD

各大股票交易软件默认N是20，所以MB等于当日20日均线值
 */