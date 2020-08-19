/*
 * @Author: weishere.huang
 * @Date: 2020-08-18 23:49:06
 * @LastEditTime: 2020-08-19 16:22:21
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { requester } = require('../tool/Requester')
const { client } = require('../lib/binancer');
const { Symbol } = require('../db');


const ProgressBar = require('progress')

const attributeCount = function (obj) {
    let count = 0;
    for (let i in obj) { if (obj.hasOwnProperty(i) && /USDT$/.test(i)) count++; }
    return count;
}
module.exports = class SymbolServer {
    constructor() {
        this.symbolStorage = {
            // ETHUSDT: {
            //     klineData5m
            // }
        }
        this.loopInitDB = false;
    }
    static getInstance() {
        if (!this.SymbolServer) {
            this.SymbolServer = new SymbolServer();
        }
        return this.SymbolServer;
    }
    /**初始化symbol数据库 */
    async initializeKline() {
        console.log('Await request and initialize symbol Kline data...\n');
        const prices = await client.prices();
        const now = new Date();
        const lastTime = now.setHours(now.getHours() - 3);
        const bar = new ProgressBar('Initialize KLine data [:bar] :current/:total :percent :etas', {
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
                        klineData5m: res.data
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
        const prices = await client.prices();
        for (let symbolKey in prices) {
            if (symbolKey && prices.hasOwnProperty(symbolKey) && /USDT$/.test(symbolKey)) {
                client.ws.candles(symbolKey, '5m', payload => {
                    const { symbol, startTime, closeTime, open, close, high, low, volume, quoteVolume, trades, buyVolume, quoteBuyVolume } = payload;
                    const rawData = this.symbolStorage[symbol].klineData5m;
                    if (rawData[rawData.length - 1][0] !== startTime) {
                        rawData.shift();
                        rawData.push([startTime, open, high, low, close, volume, closeTime, quoteVolume, trades, buyVolume, quoteBuyVolume]);
                    } else {
                        rawData[rawData.length - 1] = [startTime, open, high, low, close, volume, closeTime, quoteVolume, trades, buyVolume, quoteBuyVolume];
                    }
                })
            }
        }
        console.log('订阅最新k线数据流完成!');
    }
    /**同步至数据库(5分钟一次) */
    async syncDataToDB() {
        console.log('symbolStorage开始同步至数据库!');
        console.time('同步完成，耗时');
        for (let symbolKey in this.symbolStorage) {
            if (this.symbolStorage.hasOwnProperty(symbolKey)) {
                await Symbol.findOneAndUpdate({
                    name: symbolKey,
                    klineData5m: JSON.stringify(this.symbolStorage[symbolKey].klineData5m)
                }, e => { console.log(e); });
            }
        }
        console.timeEnd('同步完成，耗时')
        setTimeout(async () => {
            await this.syncDataToDB();
        }, 5 * 60 * 1000);
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