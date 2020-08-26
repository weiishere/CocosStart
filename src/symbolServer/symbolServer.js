/*
 * @Author: weishere.huang
 * @Date: 2020-08-18 23:49:06
 * @LastEditTime: 2020-08-26 18:20:52
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { requester } = require('../tool/Requester')
const { client } = require('../lib/binancer');
const { Symbol } = require('../db');
const dateFormat = require('format-datetime');

const ProgressBar = require('progress')
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
module.exports = class SymbolServer {
    constructor() {
        this.symbolStorage = {}
        this.loopInitDB = false;
        this.initSymbolStorageFromDb();
    }
    static getInstance() {
        if (!this.SymbolServer) {
            this.SymbolServer = new SymbolServer();
        }
        return this.SymbolServer;
    }
    async initSymbolStorageFromDb() {
        //从数据库读取
        (await Symbol.find({})).map(({ name, klineData5m, boll5m }) => {
            this.symbolStorage[name] = { klineData5m, boll5m }
        })
    }
    /**初始化symbol数据库 */
    async initializeKline() {
        console.log('Await request and initialize symbol Kline data...\n');
        const prices = await client.prices();
        const now = new Date();
        const lastTime = now.setHours(now.getHours() - 3);
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
                        console.error(e);
                    }
                }, 150);
            })
        }
        for (let symbolKey in prices) {
            if (symbolKey && prices.hasOwnProperty(symbolKey) && /USDT$/.test(symbolKey)) {
                const { res } = await fn(symbolKey);
                if (res.statusText === 'OK') {
                    //console.log(symbolKey, res.data);
                    this.symbolStorage[symbolKey] = {
                        klineData5m: res.data,
                        boll5m: this.symbolStorage[symbolKey].boll5m ? [...this.symbolStorage[symbolKey].boll5m] : [{}]
                    }
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
                    const { klineData5m, boll5m } = this.symbolStorage[symbol];
                    if (klineData5m[klineData5m.length - 1][0] !== startTime) {
                        if (boll5m.length === klineData5m.length) boll5m.shift();
                        klineData5m.shift();
                        boll5m.push({});
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
        this.bollAndSendLoop();
        console.log('symbolStorage开始同步至数据库!');
        console.time('同步完成，耗时');
        for (let symbolKey in this.symbolStorage) {
            if (this.symbolStorage.hasOwnProperty(symbolKey)) {
                await Symbol.findOneAndUpdate({
                    name: symbolKey,
                    boll5m: this.symbolStorage[symbolKey].boll5m,
                    klineData5m: this.symbolStorage[symbolKey].klineData5m
                }, e => { console.log(e); });
            }
        }
        console.timeEnd('同步完成，耗时')
        setTimeout(async () => {
            await this.syncDataToDB();
        }, 5 * 60 * 1000);
    }
    bollAndSendLoop() {
        //10秒更新一次boll线并向主进程发送一个数据
        for (let i in this.symbolStorage) {
            if (this.symbolStorage.hasOwnProperty(i)) {
                const { klineData5m, boll5m } = this.symbolStorage[i];
                if (!klineData5m.length) continue;
                let startTime = klineData5m[klineData5m.length - 1][0];
                if (startTime === boll5m[boll5m.length - 1].startTime) continue; //若最后一条线的时间还没有变，则不计算
                const { UP, MB, DN } = bollLine(klineData5m);
                let formartStartTime = dateFormat(new Date(startTime), "yyyy/MM/dd HH:mm");
                //console.log({ startTime, formartStartTime, UP, MB, DN });
                boll5m[boll5m.length - 1] = { startTime, formartStartTime, UP, MB, DN };
            }
        }
        process.send({ type: 'symbolStorage', data: this.symbolStorage });
        setTimeout(() => { this.bollAndSendLoop() }, 10000);
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