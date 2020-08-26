/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 13:49:13
 * @LastEditTime: 2020-08-26 17:16:25
 * @LastEditors: weishere.huang
 * @Description: premiseForBuy：不能进，premiseForSell：必须出
 * @~~
 */

const { client } = require('../lib/binancer');
const EventHub = require('../tool/EventHub');
const getParam = (groupName, key) => {
    return restrain[groupName].find(item => item.key === key).param;
}
let symbolStorage = null;

//接受子线程的数据：symbolStorage
EventHub.getInstance().addEventListener('symbolStorage', data => {
    symbolStorage = data;
});

const restrain = {
    /**入场前提条件    true：满足入场前提条件-false：不满足前提条件 */
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
    /**强制出场条件    true：满足出场条件-false：不满足 */
    premiseForSell: [
        {
            key: 'fastRise',
            label: '波动出现高速下跌',
            desc: '无论盈亏，10秒内的取样值(相对上一秒价格)涨跌幅都没高于0.001个点,每次采样的变化速率都是跌，且10秒累计下跌量相对10秒前价格跌幅超过1个点，要预防插针请关闭',
            param: { scond: 10, maxRiseRate: 0.001, riseRate: 0.01 },
            method: (tactics) => {
                const { scond, maxRiseRate, riseRate } = getParam('premiseForSell', 'fastRise');
                const speed = tactics.getWaveSpeedList(scond);
                for (let i = 0, l = speed.length; i < l; i++) {
                    if (speed[i] / tactics.presentSpeedArr[tactics.presentSpeedArr - i - 1] > maxRiseRate) return false;
                }
                return speed.reduce((pre, cur) => pre + cur, 0) / tactics.presentSpeedArr[tactics.presentSpeedArr.length - scond] < -riseRate ? true : false;
            }
        },
        {
            key: 'awaysRise',
            label: '亏损情况下，中高速的持续性下跌',
            desc: '亏损情况下，30秒的取样都是下跌，且30秒相对当前价格累计额下跌量超过-1%，要预防插针请关闭',
            param: { scond: 30, riseRate: 0.01 },
            method: (tactics) => {
                if (tactics.presentDeal.historyProfit > 0) return false;
                const { scond, riseRate } = getParam('premiseForSell', 'awaysRise');
                const speed = tactics.getWaveSpeedList(scond);
                for (let i = 0, l = speed.length; i < l; i++) {
                    if (speed[i] > 0) return false;
                }
                return speed.reduce((pre, cur) => pre + cur, 0) / tactics.presentPrice < -riseRate ? true : false;
            }
        }
    ],
    /**动态调整参数   入场之后每次循环都会执行 */
    dynamicParam: [
        {
            key: 'setStopLossRateByHitory',
            label: '根据24小时ticker动态调整止损值',
            desc: '24小时ticker动态调整止损值：(当天最高价-当天开盘价) / 当天开盘价',
            param: {},
            method: (tactics) => {
                // const allTicker = require('./TacticesCommand').getInstance().allTicker;
                // let ticker = [];
                if (tactics.ticker) {
                    const _stopLossRate = (tactics.ticker.high - tactics.ticker.open) / tactics.ticker.open;
                    if (_stopLossRate !== tactics.parameter.stopLossRate) {
                        tactics.parameter.stopLossRate = _stopLossRate;
                        tactics.addHistory('info', `止损点已经动态调整为：` + stopLossRate, true, { color: '#dee660', subType: 'dp' });
                    }
                }
            }
        },
        {
            key: 'setRiseStopLossRate',
            label: '根据涨幅调整止盈拐点跌幅',
            desc: '涨幅过大时调整拐点止盈点，及时出货，保障利润，盈利大于10个点，则拐点调为原止盈点的10%，出场更敏感',
            param: { step: 0.15 },
            method: (tactics) => {
                if (!tactics.buyState) return;
                const { step } = getParam('dynamicParam', 'setRiseStopLossRate');//获取步进值
                let riseRate = tactics.getProfit() / tactics.presentDeal.costing;
                let lastriseStopLossRate = tactics.parameterBackup.riseStopLossRate;
                if (riseRate >= 0.15) {
                    //盈利大于10个点
                    lastriseStopLossRate = lastriseStopLossRate * (0.1 + step * 0);
                } else if (riseRate >= 0.1 && riseRate < 0.15) {
                    lastriseStopLossRate = lastriseStopLossRate * (0.1 + step * 1);
                } else if (riseRate >= 0.08 && riseRate < 0.1) {
                    lastriseStopLossRate = lastriseStopLossRate * (0.1 + step * 2);
                } else if (riseRate >= 0.06 && riseRate < 0.08) {
                    lastriseStopLossRate = lastriseStopLossRate * (0.1 + step * 3);
                } else if (riseRate >= 0.04 && riseRate < 0.06) {
                    lastriseStopLossRate = lastriseStopLossRate * (0.1 + step * 4);
                } else if (riseRate < 0.04) {
                    //小于0.04，意思没动
                    lastriseStopLossRate = lastriseStopLossRate;
                }
                if (lastriseStopLossRate !== tactics.parameter.riseStopLossRate) {
                    tactics.parameter.riseStopLossRate = lastriseStopLossRate;
                    tactics.addHistory('info', `止盈点已经动态调整为：${tactics.parameter.riseStopLossRate}%`, true, { color: "#dee660", subType: 'dp' });
                }

            }
        },
        {
            key: 'setLossStopRiseRate',
            label: '大跌幅后一直横盘调整拐点止损值(割肉)',
            desc: '历史跌幅过大（超过90%止损值）但未出场，之后后调整拐点止损值，即用于大亏损后恢复一定的比例(相对最大亏损)时候就止损',
            param: {
                maxRate: 0.9,//历史最大跌幅
                lossRate: 60 //拐点止损涨幅
            },
            method: (tactics) => {
                if (!tactics.buyState) return;
                if (tactics.presentDeal.historyProfit > 0) return;
                const { maxRate, lossRate } = getParam('dynamicParam', 'setLossStopRiseRate');
                let lossStopLossRate = tactics.parameterBackup.lossStopLossRate;
                let _lossRate = tactics.presentDeal.historyProfit / tactics.presentDeal.costing;//lossRate肯定为负才说明是亏
                if (_lossRate / tactics.parameter.stopLossRate >= -maxRate) {
                    //最大亏损大于达到止损值的90%了
                    lossStopLossRate = lossRate;//回最大亏损的60就割肉
                } else {
                    if (tactics.parameter.lossStopLossRate !== tactics.parameterBackup.lossStopLossRate) {
                        tactics.parameter.lossStopLossRate = tactics.parameterBackup.lossStopLossRate;
                        tactics.addHistory('info', `拐点止损值恢复原参数`, true, { color: "#dee660", subType: 'dp' });
                    }
                }
                if (lossStopLossRate !== tactics.parameterBackup.lossStopLossRate && tactics.parameter.lossStopLossRate !== tactics.parameterBackup.lossStopLossRate) {
                    tactics.parameter.lossStopLossRate = lossStopLossRate;
                    tactics.addHistory('info', `拐点止损(回本增幅%)动态调整为：` + lossStopLossRate, true, { color: "#dee660", subType: 'dp' });
                }
            }
        },
        {
            key: 'setStopLossRateByHastyLoss',
            label: '短时间内急跌放大止损(预发插针)',
            desc: '5分钟内急跌(6个点以上)且突破了止损值，这时要扩大止损值防止下车',
            param: {
                maxLoss: 0.06,
                addExpand: 1.05
            },
            method: (tactics) => {
                const { maxLoss } = getParam('dynamicParam', 'setStopLossRateByHastyLoss');
                let stopLossRate = tactics.parameterBackup.stopLossRate;
                //上一个5分线的开盘价跟当前价格比对
                const presentPrice = tactics.getPresentPrice();
                if ((tactics.KLineItem5m.recent.open - presentPrice) / tactics.KLineItem5m.recent.open > maxLoss) {
                    const _stopLossRate = Math.abs(Number(tactics.getProfit() / tactics.presentDeal.costing));
                    if (_stopLossRate >= stopLossRate) {
                        stopLossRate = _stopLossRate + 0.0001;
                    }
                } else {
                    if (tactics.parameter.stopLossRate !== tactics.parameterBackup.stopLossRate) {
                        tactics.parameter.stopLossRate = tactics.parameterBackup.stopLossRate;
                        tactics.addHistory('info', `止损值恢复原参数`, true, { color: "#dee660", subType: 'dp' });
                    }
                }
                if (stopLossRate !== tactics.parameter.stopLossRate && tactics.parameter.stopLossRate !== tactics.parameterBackup.stopLossRate) {
                    tactics.parameter.stopLossRate = stopLossRate;
                    tactics.addHistory('info', `发生短时间急跌，止损止动态调整为：${stopLossRate}，阻止被甩掉下车...`, true, { color: "#dee660", subType: 'dp' });
                }
            }
        },
    ],
    //选币方案
    symbolElecter: [
        {
            key: 'bollStandard',
            label: 'BOLL布林指标',
            desc: '使用BOLL布林指标线来辅助选币',
            param: {},
            method: async (lastSymbolList) => {
                try {
                    if (!symbolStorage) {
                        console.log('lastSymbolList还未收到数据(子线程未开？)');
                        return lastSymbolList;
                    }
                    return lastSymbolList.filter(item => {
                        const symbolObj = symbolStorage[item.symbol];
                        const { UP, DN } = symbolObj.boll5m[symbolObj.boll5m.length - 1];
                        if (!UP || !DN) {
                            console.log('未取得boll线数据：' + item.symbol);
                    return lastSymbolList;
                        }
                        const klineData = symbolObj.klineData5m[symbolObj.klineData5m.length - 2];//到处第二条线
                        const close = +klineData[4];//收盘价
                        const open = +klineData[1];//收盘价
                        const low = +klineData[3];//最低价
                        return (open < close && (close >= UP || low <= DN));//必须是阳线且收盘价大于UP，最低价小于DN
                    });
                } catch (e) {
                    console.log('bollStandard选币发生错误：' + e);
                    return lastSymbolList;
                }
            }
        },
        {
            key: 'blacklist',
            label: '黑名单',
            desc: '筛选掉黑名单交易对',
            param: {
                blackList: ['BUSDUSDT', 'TUSDUSDT', 'USDCUSDT', 'PAXUSDT', 'AUDUSDT', 'EURUSDT', 'GBPUSDT', 'BTCUSDT', 'LTCUSDT', 'ETHUSDT', 'BCHUSDT', 'EOSUSDT']
            },
            method: async (lastSymbolList, tactics) => {
                const { blackList } = getParam('symbolElecter', 'blacklist');
                //const allSymbols = require('./TacticesCommand').getInstance().allTicker;
                let index = 1000;//推荐级别千位
                let resultList = [];
                for (let i in lastSymbolList) {
                    if (lastSymbolList.hasOwnProperty(i) && !blackList.some(item => item === lastSymbolList[i].symbol)) {
                        const { priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose } = lastSymbolList[i].data;
                        resultList.push({
                            symbol: lastSymbolList[i].symbol, score: --index + lastSymbolList[i].score,
                            data: {
                                priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose
                            }
                        });
                    }
                }
                return resultList;
            }
        },
        {
            key: 'history24h',
            label: '24小时状态分析',
            desc: '24小时ticker涨幅大于0且小于40%（越接近40%的一半即20%，评分更高），当前接近24小时最低价(离最高价差值在一定范围内浮动内，越接近评分更高)，且交易量大于500万',
            param: {
                maxVolumeQuote: 5000000,//最高交易量
                maxRise: 40,//最高涨幅限定
                maxBalance: 0.1//最高涨幅限定值差异度范围
            },
            method: async (lastSymbolList, tactics) => {
                const { maxVolumeQuote, maxRise, maxBalance } = getParam('symbolElecter', 'history24h');
                //const allSymbols = require('./TacticesCommand').getInstance().allTicker;
                let resultList = [];
                let index = 100000;//推荐级别十万位
                for (let i in lastSymbolList) {
                    let score = 0;
                    const item = lastSymbolList[i];
                    if (!lastSymbolList.hasOwnProperty(i)) continue;
                    if (+item.data.volumeQuote < maxVolumeQuote) continue;//交易量大于5000000
                    //涨幅0~40%内
                    if (+item.data.priceChangePercent < 0 || +item.data.priceChangePercent > maxRise) {
                        continue;
                    } else {
                        //越接近20分越高
                        const s1 = Math.abs((maxRise / 2) - item.data.priceChangePercent);
                        score += (((maxRise / 2) - s1) / (maxRise / 2)) * 100;//100是最高分
                    }
                    //最高价价差范围内
                    const r2 = Math.abs((item.data.curDayClose - item.data.high) / item.data.curDayClose);
                    if (r2 > maxBalance) {
                        continue;
                    } else {
                        //越接近分越高
                        score += ((maxBalance - r2) / maxBalance) * 200;
                    }
                    const { priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose } = item.data;
                    resultList.push({
                        symbol: item.symbol, score: index + score + item.score, data: {
                            priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose
                        }
                    });
                }
                resultList = resultList.sort((a, b) => b.score - a.score);
                return resultList;
            }
        },
        {
            key: 'LossToRiseInflexion',
            label: '深沟检测',
            desc: '下跌拐点型，30分钟下跌5%以上，然后回调1%',
            param: {},
            method: async (lastSymbolList, tactics) => {

                return lastSymbolList;
            }
        },
        {
            key: 'fastRise',
            label: '短时间急拉币(5分钟1个点)',
            desc: '短时间在急拉的币，在5分钟就达到日涨幅的10%',
            param: {
                rise: 0.1
            },
            method: async (lastSymbolList, tactics) => {

                return lastSymbolList;
            }
        }
    ]
}

module.exports = { ...restrain };


