/*
 * @Author: weishere.huang
 * @Date: 2020-08-14 13:49:13
 * @LastEditTime: 2020-09-10 17:08:47
 * @LastEditors: weishere.huang
 * @Description: premiseForBuy：不能进，premiseForSell：必须出
 * @~~
 */

const { client } = require('../lib/binancer');
const EventHub = require('../tool/EventHub');
const { Symbol } = require('../db');
const getParam = (groupName, key) => {
    return restrain[groupName].find(item => item.key === key).param;
}
let symbolStorage = {};

//接受子线程的数据：symbolStorage
EventHub.getInstance().addEventListener('symbolStorage', 'ta_symbolStorage', data => {
    symbolStorage = data;
});

//数据库获取symbolStorage
const getSymbolStorageFromDB = async () => {
    (await Symbol.find({})).map(({ name, klineData5m, boll5m, KDJ5m }) => {
        symbolStorage[name] = { klineData5m, boll5m, KDJ5m }
    });
    setTimeout(() => {
        getSymbolStorageFromDB();
    }, 30000);
}
/**获取平均波动 */
const getAverageWave = (symbol) => {
    const symbolObj = symbolStorage[symbol];
    if (!symbolObj) return 0;
    const { klineData5m } = symbolObj;
    let total = 0;
    //klineData.reduce((per, cur) => { }, klineData[0]);
    klineData5m.forEach(item => {
        total += Math.abs((item[1] - item[4]) / item[1]);
    });
    return total / klineData5m.length;
}

process.env.CHILD_PROCESS === '0' && getSymbolStorageFromDB();//如果没有开子进程通信，就自己去数据库拿

const restrain = {
    premiseForBase: [
        {
            key: 'symbolDriveMod',
            label: '切币驱动模式',
            desc: '选币驱动模式，会保持选币一直运行，如果有新币产生，即尽快出场(盈利或亏损在0.5个点内)并切币进入，打开此开关需保证有及其严格的选币方案',
            param: {
                maxLoss: -0.02,
                isNowBuy: true
            },
            method: async (tactics) => {
                const { maxLoss } = getParam('premiseForBase', 'symbolDriveMod');
                //进行币种检测
                const { chooseItem, isNowBuy } = await tactics.findSymbol();
                if (chooseItem && chooseItem !== tactics.symbol) {
                    //只要亏损不大于0.2个点，就切币
                    if ((tactics.buyState && Number(tactics.getProfit() / tactics.presentDeal.costing) > maxLoss) || !tactics.buyState) {
                        tactics.addHistory('info', `【注意】在切币驱动模式下检测到新币且满足切币条件，即将切币至（${chooseItem}）...`, true, { color: "#85A3FF" });
                        if (tactics.buyState) {
                            await tactics.deal('sell');
                            tactics.buyState = false;
                        }
                        await tactics.initialize(chooseItem);//切币
                        //await tactics.powerSwitch();
                        //if (isNowBuy) await tactics.deal('buy');
                        require('./TacticesCommand').getInstance().mapTotacticsList(tactics.uid, tactics.id, true);
                        return false;
                    }
                    tactics.addHistory('info', `在切币驱动模式下检测到新币且满足切币条件，但不满足出场条件(亏损大于${maxLoss})，继续观察...`, true, { color: "#85A3FF" });
                } else {
                    //tactics.addHistory('info', `暂无推荐币，继续${tactics.buyState ? '出场' : '入场'}检测...`, true);
                }
                return true;
            }
        },
    ],
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
            key: 'bollStandardUP',
            label: 'BOLL-UP指标',
            desc: '如果最近一条5分线(无论是阴阳线)已经横穿了UP，不予入场',
            method: async (tactics) => {
                const symbolObj = symbolStorage[tactics.symbol];
                if (!symbolObj) return false;
                const { startTime, UP, MB, DN } = symbolObj.boll5m[symbolObj.boll5m.length - 1];//最后一条boll线
                const klineData = symbolObj.klineData5m.find(item => item[0] === startTime);
                if (+klineData[4] > UP || +klineData[1] > UP) {
                    return false;
                }
                return true;
            }
        },
        {
            key: 'bollStandardDN',
            label: 'BOLL-DN指标',
            desc: '如果最近一条5分阳线触及底线DN，赶紧入场',
            method: async (tactics) => {
                const symbolObj = symbolStorage[tactics.symbol];
                if (!symbolObj) return false;
                const { startTime, UP, MB, DN } = symbolObj.boll5m[symbolObj.boll5m.length - 1];//最后一条boll线
                const klineData = symbolObj.klineData5m.find(item => item[0] === startTime);
                const close = +klineData[4];//收盘价
                const open = +klineData[1];//收盘价
                const low = +klineData[3];//最低价
                if (open < close && ((close >= DN && Math.abs(low - DN) / low < 0.005) || (MB < close && MB > open))) {//必须是阳线且收盘价大于UP，最低价小于DN,或者是穿过中线
                    return true;
                };
                return false;
            }
        },
        {
            key: 'last10mNoFastRise',
            label: '前10分钟内未出现急涨(结合BOLL-UP)',
            desc: '前10分钟内未出现急涨(急涨幅度根据平均值取)，但若未冲破UP线，将不约束',
            param: { time: 4 },
            method: async (tactics) => {
                const { time } = getParam('premiseForBuy', 'last10mNoFastRise');
                const averageWave = getAverageWave(tactics.symbol);
                //const { klineData5m } = symbolStorage[symbol];
                if (!tactics.KLineItem5m.recent) return false;
                const riseRate = (tactics.presentPrice - tactics.KLineItem5m.recent.open) / tactics.KLineItem5m.recent.open;
                if (riseRate > averageWave * time) {
                    const isUp = await restrain[premiseForBuy].find(item => item.key === 'bollStandardUP').method(tactics);
                    //若未冲破UP线，将不约束，继续冲
                    if (isUp) return true;
                    return false;
                }
                return true;
            }
        },
        // {
        //     key: 'last24mMaxRise',
        //     label: '24小时涨幅未大于40%',
        //     desc: '24小时涨幅已经大于40%未高风险币，不予进场',
        //     method: (tactics) => { return true; }
        // },
        // {
        //     key: 'last10mFastLoss',
        //     label: '深沟抄底(>-10%)',
        //     desc: '前10分钟出现急跌10%以上，进行抄底',
        //     method: (tactics) => { return true; }
        // },
        // {
        //     key: 'timeLimit',
        //     label: '入场时间限制',
        //     desc: '暂时限制17:30~19：30时间，不适宜入场',
        //     method: (tactics) => { return true; }
        // }
    ],
    /**强制出场条件    true：满足出场条件-false：不满足 */
    premiseForSell: [
        {
            key: 'fastRise',
            label: '波动出现高速下跌',
            desc: '无论盈亏，10秒内的取样值(相对上一秒价格)涨跌幅都没高于0.001个点,每次采样的变化速率都是跌，且10秒累计下跌量相对10秒前价格跌幅超过1个点，要预防插针请关闭',
            param: { scond: 10, maxRiseRate: 0.001, riseRate: 0.01 },
            method: async (tactics) => {
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
            method: async (tactics) => {
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
            method: async (tactics) => {
                // const allTicker = require('./TacticesCommand').getInstance().allTicker;
                // let ticker = [];
                if (tactics.ticker) {
                    const _stopLossRate = +((tactics.ticker.high - tactics.ticker.open) / tactics.ticker.open).toFixed(2);
                    if (_stopLossRate !== tactics.parameter.stopLossRate) {
                        tactics.parameter.stopLossRate = _stopLossRate;
                        tactics.addHistory('info', `止损点已经动态调整为：` + _stopLossRate, true, { color: '#dee660', subType: 'dp' });
                    }
                }
            }
        },
        {
            key: 'setRiseStopLossRate',
            label: '根据涨幅调整止盈拐点跌幅',
            desc: '涨幅过大时调整拐点止盈点，及时出货，保障利润，盈利大于10个点，则拐点调为原止盈点的10%，出场更敏感',
            param: { step: 0.15 },
            method: async (tactics) => {
                if (!tactics.buyState) return;
                const { step } = getParam('dynamicParam', 'setRiseStopLossRate');//获取步进值
                let riseRate = tactics.getProfit() / tactics.presentDeal.costing;
                let lastriseStopLossRate = tactics.parameterBackup.riseStopLossRate;
                if (riseRate >= 0.25) {
                    //盈利大于10个点
                    lastriseStopLossRate = lastriseStopLossRate * (step * 1);
                } else if (riseRate >= 0.15 && riseRate < 0.25) {
                    lastriseStopLossRate = lastriseStopLossRate * (step * 2);
                } else if (riseRate >= 0.1 && riseRate < 0.15) {
                    lastriseStopLossRate = lastriseStopLossRate * (step * 3);
                } else if (riseRate >= 0.08 && riseRate < 0.1) {
                    lastriseStopLossRate = lastriseStopLossRate * (step * 4);
                } else if (riseRate >= 0.06 && riseRate < 0.08) {
                    lastriseStopLossRate = lastriseStopLossRate * (step * 5);
                } else if (riseRate >= 0.04 && riseRate < 0.06) {
                    lastriseStopLossRate = lastriseStopLossRate * (step * 6);
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
            method: async (tactics) => {
                if (!tactics.buyState) return;
                if (tactics.presentDeal.historyProfit > 0) return;
                const { maxRate, lossRate } = getParam('dynamicParam', 'setLossStopRiseRate');
                let lossStopLossRate = tactics.parameterBackup.lossStopLossRate;
                let _lossRate = tactics.presentDeal.historyProfit / tactics.presentDeal.costing;//lossRate肯定为负才说明是亏
                if (_lossRate / tactics.parameter.stopLossRate >= -maxRate) {
                    //最大亏损大于达到止损值的90%了
                    lossStopLossRate = lossRate;//回最大亏损的60就割肉
                } else {
                    // if (tactics.parameter.lossStopLossRate !== tactics.parameterBackup.lossStopLossRate) {
                    //     tactics.parameter.lossStopLossRate = tactics.parameterBackup.lossStopLossRate;
                    //     tactics.addHistory('info', `拐点止损值恢复原参数`, true, { color: "#dee660", subType: 'dp' });
                    // }
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
            method: async (tactics) => {
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
            label: 'BOLL指标',
            desc: 'BOLL的DN线与阳线交汇且小于收盘价或穿过MB',
            param: {},
            method: async (lastSymbolList) => {
                try {
                    if (!symbolStorage) {
                        console.log('lastSymbolList还未收到数据(子线程未开？)');
                        return lastSymbolList;
                    }
                    const fn = (symbolObj, klineIndex) => {
                        const klineData = symbolObj.klineData5m[klineIndex];
                        const close = +klineData[4];//收盘价
                        const open = +klineData[1];//收盘价
                        const low = +klineData[3];//最低价
                        const { UP, MB, DN } = symbolObj.boll5m[symbolObj.boll5m.length - 1];
                        if (!UP || !DN) {
                            console.log('未取得boll线数据：' + item.symbol);
                            return false;
                        }
                        if (open < close && ((close >= DN && Math.abs(low - DN) / low < 0.005) || (MB < close && MB > open))) {//必须是阳线且收盘价大于UP，最低价小于DN,或者是穿过中线
                            return true;
                        };
                        return false;
                    }
                    return lastSymbolList.filter(item => {
                        const symbolObj = symbolStorage[item.symbol];
                        if (!symbolObj) return false;
                        return (fn(symbolObj, symbolObj.klineData5m.length - 1) || fn(symbolObj, symbolObj.klineData5m.length - 2));
                    });
                } catch (e) {
                    console.log('bollStandard选币发生错误：' + e);
                    return lastSymbolList;
                }
            }
        },
        {
            key: 'KDJStandard',
            label: 'KDJ指标',
            desc: 'J值处于50以下且KDJ线之间的差额总值不超过10，且上一组的J值小于当前J值',
            param: {},
            method: async (lastSymbolList) => {
                try {
                    if (!symbolStorage) {
                        console.log('lastSymbolList还未收到数据(子线程未开？)');
                        return lastSymbolList;
                    }
                    const fn = (symbolObj, KDJindex) => {
                        const KDJData = symbolObj.KDJ5m[KDJindex];
                        const KDJDataLast = symbolObj.KDJ5m[KDJindex - 1];
                        if (KDJData.J < 50 && Math.abs(KDJData.K - KDJData.D) + Math.abs(KDJData.K - KDJData.J) <= 10 && KDJDataLast.K < KDJData.K) {
                            return true;
                        }
                        return false;
                    }
                    return lastSymbolList.filter(item => {
                        const symbolObj = symbolStorage[item.symbol];
                        if (!symbolObj) {
                            console.log(item.symbol)
                            return false;
                        }
                        return (fn(symbolObj, symbolObj.KDJ5m.length - 1) || fn(symbolObj, symbolObj.KDJ5m.length - 2));
                    });
                } catch (e) {
                    console.log('KDJStandard选币发生错误：' + e);
                    return lastSymbolList;
                }
            }
        },
        {
            key: 'blacklist',
            label: '黑名单',
            desc: '筛选掉黑名单交易对',
            param: {
                blackList: {
                    bigSymbol: ['BUSDUSDT', 'TUSDUSDT', 'USDCUSDT', 'PAXUSDT', 'AUDUSDT', 'EURUSDT', 'GBPUSDT', 'BTCUSDT', 'LTCUSDT', 'ETHUSDT', 'BCHUSDT', 'EOSUSDT'],
                    futureSymbol: ['LINKDOWNUSDT', 'LINKUPUSDT', 'BTCDOWNUSDT', 'BTCUPUSDT', 'ADADOWNUSDT', 'ADAUPUSDT', 'BNBUPUSDT', 'BNBDOWNUSDT', 'XTZDOWNUSDT', 'XTZUPUSDT', 'ETHDOWNUSDT', 'ETHUPUSDT']
                },
                forbid: [
                    'bigSymbol', 'futureSymbol'
                ]
            },
            method: async (lastSymbolList, tactics) => {
                const { blackList, forbid } = getParam('symbolElecter', 'blacklist');
                //const allSymbols = require('./TacticesCommand').getInstance().allTicker;
                let list = [];
                forbid.forEach(element => {
                    list = list.concat(blackList[element]);
                });
                let index = 1000;//推荐级别千位
                let resultList = [];
                for (let i in lastSymbolList) {
                    if (lastSymbolList.hasOwnProperty(i) && !list.some(item => item === lastSymbolList[i].symbol)) {
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
            desc: '24小时ticker涨幅大于0且小于40%（越接近40%的一半即20%，评分更高），当前接近24小时最低价(离最高价差值在一定范围内浮动内，越接近评分更高)，且交易量大于300万',
            param: {
                maxVolumeQuote: 3000000,//最低交易量
                //maxRise: 40,//最高涨幅限定
                maxBalance: 0.1//最高涨幅限定值差异度范围
            },
            method: async (lastSymbolList, tactics) => {
                const { maxVolumeQuote, maxBalance } = getParam('symbolElecter', 'history24h');
                const riseSymbols = require('./TacticesCommand').getInstance().allTicker.filter(item => +item.priceChangePercent > 0);
                const maxRise = riseSymbols.reduce((pre, cur) => pre + (+cur.priceChangePercent), 0) / riseSymbols.length;//最高涨幅，取为上涨币种的平均上涨值
                let resultList = [];
                let index = 100000;//推荐级别十万位
                for (let i in lastSymbolList) {
                    let score = 0;
                    const item = lastSymbolList[i];
                    if (!lastSymbolList.hasOwnProperty(i)) continue;
                    if (+item.data.volumeQuote < maxVolumeQuote) continue;
                    //涨幅为所有涨币的平均值
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
            desc: '下跌拐点型，检测n条5分线，检测当前是否在最低点',
            param: { m5count: 20 },
            method: async (lastSymbolList, tactics) => {
                const { m5count } = getParam('symbolElecter', 'LossToRiseInflexion');
                let resultList = [];
                const fn = (open, close, curCount) => {
                    let list = [];
                    for (let i in lastSymbolList) {
                        let score = 0;
                        const item = lastSymbolList[i];
                        const { klineData5m } = symbolStorage[item.symbol];
                        if (!klineData5m) continue;
                        //检测之前N条线
                        const lowOpen = [...klineData5m].splice(klineData5m.length - m5count - curCount, m5count).sort((a, b) => a[1] - b[1]).shift()[1];
                        const lowClose = [...klineData5m].splice(klineData5m.length - m5count - curCount, m5count).sort((a, b) => a[4] - b[4]).shift()[4];
                        //阳线，且收盘价低于之前的最低开盘和收盘价
                        if (open <= close && close <= lowClose && close <= lowOpen) {
                            list.push(item);
                            // console.log(lowOpen, lowOpen);
                            // console.log(lowClose, lowClose);
                            // console.log([...klineData5m].splice(klineData5m.length - m5count - curCount, m5count));
                        }
                    }
                    return list;
                }
                const { present, recent } = tactics.KLineItem5m;
                present && (resultList = resultList.concat(fn(present.open, present.close, 1)));
                recent && (resultList = resultList.concat(fn(recent.open, recent.close, 1)));
                resultList = Array.from(new Set(resultList));
                return resultList;
            }
        },
        // {
        //     key: 'fastRise',
        //     label: '短时间急拉币(5分钟1个点)',
        //     desc: '短时间在急拉的币，在5分钟就达到日涨幅的10%',
        //     param: {
        //         rise: 0.1
        //     },
        //     method: async (lastSymbolList, tactics) => {

        //         return lastSymbolList;
        //     }
        // }
    ]
}

module.exports = { ...restrain };


