/*
 * @Author: weishere.huang
 * @Date: 2020-08-06 13:56:49
 * @LastEditTime: 2020-08-08 12:39:59
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { client } = require('../lib/binancer');
const { WsConfig, WsRoute } = require('../config')
const { userList } = require('../controllers/user')

const scoketCandles = function (uid, symbol) {
    //let tactics = this.tacticsList.find(item => item.symbol === symbol);
    const targetTacticsList = this.tacticsList.filter(item => item.symbol === symbol);
    //const targetTacticsList = () => this.tacticsList.map(item => item.symbol === symbol);
    client.ws.candles(symbol, '5m', payload => {
        targetTacticsList.forEach(item => {
            if (payload.isFinal) {
                item.KLineItem5m.recent = payload;
            } else {
                item.KLineItem5m.present = payload;
            }
        });
    });
    // client.ws.ticker(symbol, ticker => {
    //     targetTacticsList.forEach(item => item.presentDeal.presentPrice = Number(ticker.prevDayClose));
    // })
    client.ws.candles(symbol, '1m', payload => {
        const user = userList.find(user => user.id === uid);
        if (user) {
            //const scokets = user.scokets.filter(item => item.tid === tid);
            user.scokets.forEach(item => {
                item.scoket.emit(WsRoute.KLINE_DATA, payload);
            })
        }
        //this.scoket.emit(WsRoute.KLINE_DATA, payload);
    })
    client.ws.partialDepth({ symbol, level: 10 }, depth => {
        targetTacticsList.forEach(item => item.depth = depth);
    })
    client.ws.trades(symbol, trade => {
        targetTacticsList.forEach(item => {
            item.presentDeal.presentPrice = Number(trade.price);
            item.pushTrade(trade);
        });
    });
}


module.exports = {
    scoketCandles
};