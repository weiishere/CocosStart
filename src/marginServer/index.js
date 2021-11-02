/*
 * @Author: weishere.huang
 * @Date: 2020-10-12 14:09:11
 * @LastEditTime: 2020-10-27 14:11:45
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer2');
var talib = require('ta-lib');
const ccxt = require('ccxt');
const { System } = require('../config')

// const client = Binance({
//     apiKey: System.user_4620.apiKey,//'bfVEzz5KwA960lS88TfeIY8aEcdRcOaXd5KDJFoKwiedWpd2iBrZrJtyc8VLAYPH',
//     apiSecret: System.user_4620.apiSecret,//'2SsfZtgIGIUhepNWj5uNX3ykgSBhmOqMkHCv6fGaIzJmSr8uqiFOHJen6WjNe59a',
//     //getTime: Date.now(), // time generator function, optional, defaults to () => Date.now()
// })

const buy = async (symbol) => {
    try {
        // const result = await client.futuresMarketBuy('BTCUSDT', 0.2, { positionSide: 'LONG' });
        // // const result = await client.futuresUserTrades("BTCUSDT");
        // console.log(result);

        let exchange = new ccxt.binance({
            'apiKey': System.user_4620.apiKey,
            'secret': System.user_4620.apiSecret,
            'timeout': 30000,
            'enableRateLimit': true,
        });
        await exchange.loadMarkets();
        let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let closeList = [];
        if (exchange.has.fetchOHLCV) {
            let ohlcv = await exchange.fetchOHLCV(symbol, '5m');
            
            closeList = ohlcv.map(item=>item[4]);
            // for (sy in exchange.markets) {
            //     await sleep(exchange.rateLimit) // milliseconds
            //     console.log(await exchange.fetchOHLCV(sy, '1m')) // one minute
            // }
        }

        let ticker = await exchange.fetch_ticker(symbol)
        console.log(ticker);

        const re = talib.MACD(closeList, 12, 26, 9);
        console.log(re);
        // const result = await client.futuresAccount();
        // const positions = result.positions.filter(item => item.symbol === 'BTCUSDT');
        // console.log(positions);




        //持仓
        // let position_data = await client.futuresPositionRisk(), markets = Object.keys( position_data );
        // for ( let market of markets ) {
        //   let obj = position_data[market], size = Number( obj.positionAmt );
        //   if ( size == 0 ) continue;
        //   console.log( `${obj.leverage}x\t${market}\t${obj.unRealizedProfit}` );
        //   console.info( obj ); //positionAmt entryPrice markPrice unRealizedProfit liquidationPrice leverage marginType isolatedMargin isAutoAddMargin maxNotionalValue
        // }
    } catch (e) {
        console.log(e);
    }

}

module.exports = { buy }