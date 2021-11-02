const { Symbol, RoundResult } = require('../db');
const { apiDateCode, System } = require('../config');
const dateFormat = require('format-datetime');
const { requester } = require('../tool/Requester')
const talib = require('ta-lib');
const MacdTactics = require('../macdServer/macdTactics');

let macdTactics;

module.exports = {
    getKlineAndMacd: async (ctx, next) => {
        const { symbol, interval, startTime } = ctx.query;
        const { klines, macd } = await getKlinesAndMacdData(symbol, interval, startTime);
        ctx.body = {
            code: apiDateCode.success,
            data: { klines, macd }
        };
        next();
    },
    //回测
    backTestMacd: async (ctx, next) => {
        const { symbol, interval, startTime, diffMacd, diffKvalue } = ctx.query;
        const { klines, macd } = await getKlinesAndMacdData(symbol, interval, startTime);
        macdTactics = new MacdTactics(macd, klines,{
            diffMacd,diffKvalue
        });
        macdTactics.backTest();
        ctx.body = {
            code: apiDateCode.success,
            data: {
                klines,
                macd,
                statistics: macdTactics.statistics,
                topIndex: [...macdTactics.redPeak, ...macdTactics.greenPeak].map(item => ({
                    index: item.start + item.topIndex,
                    topValue: item.top
                }))
            }
        };
        next();
    }
}
const getKlinesAndMacdData = async (symbol, interval, startTime) => {
    const { res } = await requester({
        url: '/fapi/v1/klines',
        params: {
            symbol, interval, startTime
        },
        option: {
            baseUrl: 'fapi_base_url',
            failedBack: (error) => { }
        }
    })
    let klines = [];
    let closeList = [];
    for (let i = 0; i < res.data.length; i++) {
        klines.push(res.data[i].slice(0));
        klines[i][0] = dateFormat(new Date(+res.data[i][0]), "dd-HH:mm");
        klines[i][klines[i].length - 1] = +res.data[i][0];
        //klines[i].push(dateFormat(new Date(+res.data[i][0]), "HH:mm"));
        closeList.push(+res.data[i][4]);
    }
    let macd = talib.MACD(closeList.reverse(), 12, 26, 9);
    // macdData = re.histogram.reverse().map(item => ({
    //     value: item, itemStyle: { color: item < 0 ? 'red' : 'green' }
    // }));
    //为了跟币安一致，去除最后一根柱
    macd = macd.histogram.reverse();
    macd.unshift(null);
    macd.pop();
    return { klines, macd }
}