/*
 * @Author: weishere.huang
 * @Date: 2020-08-18 23:49:06
 * @LastEditTime: 2020-08-31 15:54:38
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
/**
    1499040000000,      // 开盘时间
    "0.01634790",       // 开盘价
    "0.80000000",       // 最高价
    "0.01575800",       // 最低价
    "0.01577100",       // 收盘价(当前K线未结束的即为最新价)
    "148976.11427815",  // 成交量
    1499644799999,      // 收盘时间
    "2434.19055334",    // 成交额
    308,                // 成交笔数
    "1756.87402397",    // 主动买入成交量
    "28.46694368",      // 主动买入成交额
    "17928899.62484339" // 请忽略该参数
 */


const { requester } = require('../tool/Requester')
const { client } = require('../lib/binancer');
const { Symbol } = require('../db');
const dateFormat = require('format-datetime');

const ProgressBar = require('progress');
const { ResolvePlugin } = require('webpack');
const attributeCount = function (obj) {
    let count = 0;
    for (let i in obj) { if (obj.hasOwnProperty(i) && /USDT$/.test(i)) count++; }
    return count;
}
/** 获取布林线
 * 
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
（C指收盘价）

3）计算MB,UP,DN线
MB=（N-1）的MA
UP=MB+2×MD
DN=MB－2×MD

各大股票交易软件默认N是20，所以MB等于当日20日均线值
*/
const bollLine = (klineData5m) => {
    const count = 20;
    const klineData5mFor20 = [...klineData5m].splice(klineData5m.length - count - 1, count);//最后一根K线可能未完结，不纳入计算
    const getMA = (rem) => {
        const klineData5mSplice = rem === 20 ? klineData5mFor20 : [...klineData5m].splice(klineData5m.length - rem - 1, rem);
        return klineData5mSplice.reduce((pre, cur) => pre + (+cur[4]), 0) / rem;
    }
    const MA = getMA(count);
    const MD = Math.sqrt(klineData5mFor20.reduce((pre, cur) => pre + Math.pow((cur[4] - MA), 2), 0) / count);
    const MB = getMA(count - 1);
    const UP = MB + 2 * MD;
    const DN = MB - 2 * MD;
    return { MA, UP, MB, DN };
}
/**KDJ线 
 n日RSV=（Cn－Ln）/（Hn－Ln）×100
公式中，Cn为第n日收盘价；Ln为n日内的最低价；Hn为n日内的最高价。
其次，计算K值与D值：
当日K值=2/3×前一日K值+1/3×当日RSV
当日D值=2/3×前一日D值+1/3×当日K值
若无前一日K 值与D值，则可分别用50来代替。
J值=3*当日K值-2*当日D值
以9日为周期的KD线为例，即2未成熟随机值，计算公式为
9日RSV=（C－L9）÷（H9－L9）×100
公式中，C为第9日的收盘价；L9为9日内的最低价；H9为9日内的最高价。
K值=2/3×第8日K值+1/3×第9日RSV
D值=2/3×第8日D值+1/3×第9日K值
J值=3*第9日K值-2*第9日D值
若无前一日K值与D值，则可以分别用50代替。
*/
const KDJLine = (klineData5m, KdjData, n) => {
    const klineData5mForN = [...klineData5m].splice(klineData5m.length - n - 1, n);//取得除最近一条线之前N条线
    const preKData = klineData5mForN[klineData5mForN.length - 1];//最近的K线数据
    const Ln = +klineData5mForN.sort((a, b) => a[3] - b[3])[0][3];
    const Hn = +klineData5mForN.sort((a, b) => b[2] - a[2])[0][2];
    let lastKDJData =
        klineData5mForN[klineData5mForN.length - 2][0] ?
            KdjData.find(item => item.startTime === klineData5mForN[klineData5mForN.length - 2][0]) : { K: 50, D: 50 };//上一日的KDJ
    lastKDJData = (lastKDJData || { K: 50, D: 50 });
    const RSV = ((+preKData[4] - Ln) / (Hn - Ln)) * 100;
    const K = (2 / 3) * (lastKDJData.K || 50) + (1 / 3) * RSV;
    const D = (2 / 3) * (lastKDJData.D || 50) + (1 / 3) * K;
    const J = 3 * K - 2 * D;
    return { K, D, J }
}
module.exports = class SymbolServer {
    constructor() {
        this.symbolStorage = {}
        this.loopInitDB = false;

    }
    static getInstance() {
        if (!this.SymbolServer) {
            this.SymbolServer = new SymbolServer();
        }
        return this.SymbolServer;
    }
    async initSymbolStorageFromDb() {
        //从数据库读取
        (await Symbol.find({})).map(({ name, klineData5m, boll5m, KDJ5m }) => {
            this.symbolStorage[name] = { klineData5m, boll5m, KDJ5m }
        })
    }
    /**初始化symbol数据库 */
    async initializeKline() {
        console.log('Await request and initialize symbol Kline data...\n');
        const prices = await client.prices();
        const now = new Date();
        const lastTime = now.setHours(now.getHours() - 10);
        const bar = new ProgressBar('Initialize KLine data [:bar] 进度:current/:total :percent 剩余:etas', {
            complete: '=',
            incomplete: ' ',
            width: 50,
            total: attributeCount(prices)
        });
        const fn = async (symbol) => {
            return new Promise(resolve => {
                setTimeout(async () => {
                    try {
                        const result = await requester({
                            url: 'klines',
                            params: { symbol, interval: "5m", startTime: lastTime },
                            option: { failedBack: (error) => console.error(error) }
                        });
                        resolve(result);
                    } catch (e) {
                        resolve({ res: null });
                        console.error(e);
                    }
                }, 150);
            })
        }
        for (let symbolKey in prices) {
            if (symbolKey && prices.hasOwnProperty(symbolKey) && /USDT$/.test(symbolKey)) {
                const { res } = await fn(symbolKey);
                if (res && res.statusText === 'OK') {
                    //console.log(symbolKey, res.data);
                    this.symbolStorage[symbolKey] = {
                        klineData5m: res.data,
                        boll5m: this.symbolStorage[symbolKey] ? [...this.symbolStorage[symbolKey].boll5m] : [{}],
                        KDJ5m: this.symbolStorage[symbolKey] ? [...this.symbolStorage[symbolKey].KDJ5m] : [{}],
                    }
                    bar.tick();
                } else {
                    bar.tick();
                }
            }
        }
        //console.log(this.symbolStorage);
        console.log('Initialize symbol DB done!');

        this.loopInitDB && setTimeout(async () => {
            await this.initializeKline();
        }, 10 * 10 * 1000);
    }
    /**订阅最新K线流 */
    async incrementKlineData() {
        //const prices = await client.prices();
        for (let symbolKey in this.symbolStorage) {
            if (symbolKey && this.symbolStorage.hasOwnProperty(symbolKey) && /USDT$/.test(symbolKey)) {
                client.ws.candles(symbolKey, '5m', payload => {
                    const { symbol, startTime, closeTime, open, close, high, low, volume, quoteVolume, trades, buyVolume, quoteBuyVolume } = payload;
                    const { klineData5m, boll5m, KDJ5m } = this.symbolStorage[symbol];
                    if (klineData5m[klineData5m.length - 1][0] !== startTime) {
                        if (boll5m.length === klineData5m.length) boll5m.shift();
                        if (KDJ5m.length === klineData5m.length) KDJ5m.shift();
                        klineData5m.shift();
                        boll5m.push({});
                        KDJ5m.push({});
                        klineData5m.push([startTime, open, high, low, close, volume, closeTime, quoteVolume, trades, buyVolume, quoteBuyVolume]);
                    } else {
                        klineData5m[klineData5m.length - 1] = [startTime, open, high, low, close, volume, closeTime, quoteVolume, trades, buyVolume, quoteBuyVolume];
                    }
                })
            }
        }
        console.log('订阅最新k线数据流完成!');
    }
    /**同步至数据库(5分钟一次) */
    async syncDataToDB() {
        this.indicatorAndSendLoop();
        console.log('symbolStorage开始同步至数据库，service time：' + dateFormat(new Date(), "MM/dd HH:mm"));
        console.time('同步完成，耗时');
        for (let symbolKey in this.symbolStorage) {
            if (this.symbolStorage.hasOwnProperty(symbolKey)) {
                await Symbol.findOneAndUpdate({
                    name: symbolKey,
                    boll5m: this.symbolStorage[symbolKey].boll5m,
                    KDJ5m: this.symbolStorage[symbolKey].KDJ5m,
                    klineData5m: this.symbolStorage[symbolKey].klineData5m
                }, e => { console.log(e); });
            }
        }
        console.timeEnd('同步完成，耗时')
        setTimeout(async () => {
            await this.syncDataToDB();
        }, 5 * 60 * 1000);
    }
    /**指标计算和循环（BOLL和KDJ） */
    indicatorAndSendLoop() {
        //10秒更新一次boll线并向主进程发送一个数据
        for (let i in this.symbolStorage) {
            if (this.symbolStorage.hasOwnProperty(i)) {
                const { klineData5m, boll5m, KDJ5m } = this.symbolStorage[i];
                if (!klineData5m.length) continue;
                let startTime = klineData5m[klineData5m.length - 1][0];
                if (startTime === boll5m[boll5m.length - 1].startTime) continue; //若最后一条线的时间还没有变，则不计算
                const { UP, MB, DN } = bollLine(klineData5m);
                const { K, D, J } = KDJLine(klineData5m, KDJ5m, 9);//9条线的KDJ
                let formartStartTime = dateFormat(new Date(startTime), "yyyy/MM/dd HH:mm");
                //console.log({ startTime, formartStartTime, UP, MB, DN });
                boll5m[boll5m.length - 1] = { startTime, formartStartTime, UP, MB, DN };
                KDJ5m[KDJ5m.length - 1] = { startTime, formartStartTime, K, D, J };
            }
        }
        process && process.send && process.send({ type: 'symbolStorage', data: this.symbolStorage });
        setTimeout(() => { this.indicatorAndSendLoop() }, 10000);
    }
}

/**
 [
    1499040000000,      // 开盘时间
    "0.01634790",       // 开盘价
    "0.80000000",       // 最高价
    "0.01575800",       // 最低价
    "0.01577100",       // 收盘价(当前K线未结束的即为最新价)
    "148976.11427815",  // 成交量
    1499644799999,      // 收盘时间
    "2434.19055334",    // 成交额
    308,                // 成交笔数
    "1756.87402397",    // 主动买入成交量
    "28.46694368",      // 主动买入成交额
    "17928899.62484339" // 请忽略该参数
  ]
 */