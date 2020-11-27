/*
 * @Author: weishere.huang
 * @Date: 2020-10-12 14:09:11
 * @LastEditTime: 2020-10-27 14:11:45
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer2');

const buy = async (symbol) => {
    try {
        const result = await client.futuresMarketBuy('BTCUSDT', 0.2, { positionSide: 'LONG' });
        // const result = await client.futuresUserTrades("BTCUSDT");
        console.log(result);

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