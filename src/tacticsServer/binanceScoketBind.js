/*
 * @Author: weishere.huang
 * @Date: 2020-08-06 13:56:49
 * @LastEditTime: 2020-09-07 17:02:52
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { client } = require('../lib/binancer');
const { WsConfig, WsRoute } = require('../config')
const { userList } = require('../controllers/user')




const targetTacticsList = (tacticsList, symbol) => tacticsList.filter(item => item.symbol === symbol);


// const scoketCandles = function (symbol, tid) {
//     client.ws.candles(symbol, '5m', payload => {
//         targetTacticsList(this.tacticsList, payload.symbol).forEach(item => {
//             if (payload.isFinal) {
//                 item.KLineItem5m.recent = payload;
//             } else {
//                 item.KLineItem5m.present = payload;
//             }
//         });
//     });
//     // client.ws.ticker(symbol, ticker => {
//     //     targetTacticsList.forEach(item => item.presentPrice = Number(ticker.prevDayClose));
//     // })
//     client.ws.candles(symbol, '1m', payload => {
//         //this.scoket.emit(WsRoute.KLINE_DATA, payload);
//         // targetTacticsList(this.tacticsList, payload.symbol).forEach(item => {
//         //     item.KLineItem1m = payload;
//         // });
//     })
//     client.ws.partialDepth({ symbol, level: 10 }, depth => {
//         targetTacticsList(this.tacticsList, symbol.symbol).forEach(item => item.depth = depth);
//     })
//     client.ws.trades(symbol, trade => {
//         targetTacticsList(this.tacticsList, trade.symbol).forEach(item => {
//             item.presentPrice = Number(trade.price);
//             item.pushTrade(trade);
//         });
//     });
// }

let doneFn = [];

const scoketCandles = () => {
    const TacticesLauncher = require('./TacticesLauncher');
    const symbols = Array.from(new Set(TacticesLauncher.getInstance().tacticsList.map(item => item.symbol)));//获取不重复的所有symbol数据
    doneFn.forEach(fn => fn());//先关闭之前的推送
    doneFn = [];//清空
    const candles5m = client.ws.candles(symbols, '5m', payload => {
        TacticesLauncher.getInstance().tacticsList.filter(item => item.symbol === payload.symbol).forEach(item => {
            item.KLineItem5m.present = payload;
            if (payload.isFinal) {
                item.KLineItem5m.recent = payload;
                TacticesLauncher.getInstance().mapTotacticsList(item.uid, item.id);
                item.averageWave = item.tacticesHelper.getAverageWave();
            }
        });
    });
    doneFn.push(candles5m);
    const candles1m = client.ws.candles(symbols, '1m', payload => {
        //this.scoket.emit(WsRoute.KLINE_DATA, payload);
        TacticesLauncher.getInstance().tacticsList.filter(item => item.symbol === payload.symbol).forEach(item => {
            item.KLineItem1m = payload;
            if (payload.isFinal) {
                TacticesLauncher.getInstance().mapTotacticsList(item.uid, item.id);
                // if (item.avSpeed.length == 51) item.avSpeed.shift();
                // const speed = item.tacticesHelper.getWaveSpeedList(21);
                // item.avSpeed.push(speed.reduce((pre, cur) => Math.abs(pre) + Math.abs(cur), 0) / speed.length);
                
            }
        });
    })
    doneFn.push(candles1m);
    symbols.forEach(symbol => {
        const partialDepth = client.ws.partialDepth({ symbol, level: 10 }, depth => {
            TacticesLauncher.getInstance().tacticsList.filter(item => item.symbol === depth.symbol).forEach(item => item.depth = depth);
        })
        doneFn.push(partialDepth);
    })

    const trades = client.ws.trades(symbols, trade => {
        TacticesLauncher.getInstance().tacticsList.filter(item => item.symbol === trade.symbol).forEach(item => {
            //item.pushTrade(trade);
            item.presentPrice = Number(trade.price);
            item.presentTrade = trade;
        });
    });
    doneFn.push(trades);
    const ticker = client.ws.ticker(symbols, ticker => {
        TacticesLauncher.getInstance().tacticsList.filter(item => item.symbol === ticker.symbol).forEach(item => { item.ticker = ticker; });
    })
    doneFn.push(ticker);
}

module.exports = {
    scoketCandles
};