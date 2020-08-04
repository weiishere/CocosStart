/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 17:31:27
 * @LastEditTime: 2020-07-27 19:23:27
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */


const TacticesCommand = require('./TacticesCommand');
const SellIntoCorrections = require('./SellIntoCorrections');

module.exports = {
    TacticesCommand,
    SellIntoCorrections
}



/*
const Tactics = require('./Tactics');
const SellIntoCorrections = require('./SellIntoCorrections');
const { WsConfig, WsRoute } = require('../config')

let scoket;
let presentSymbleId = '';//当前选中的交易
let tacticsList = [];
let isRateDone = true;//是否已经完成了正常数据发送
const initTactics = (symbol, name, parameter) => {
   try {
       let _tactics = tacticsList.find(item => item.symbol === symbol);//一种币最多跑一个程序
       if (!_tactics) {
           _tactics = new SellIntoCorrections(name || `${symbol}_${tacticsList.length + 1}`, parameter);
           _tactics.symbol = symbol;
           tacticsList.push(_tactics);
           mapTotacticsList(presentSymbleId,false);
       }
       return _tactics;
   } catch (e) {
       console.error(`initTactics Error${e}`)
       return false;
   }
}
const removeTactics = (name) => {
   tacticsList = tacticsList.filter(item => item.name !== name);
}
//获取量化交易实例列表（若带参数，则有重点的给出数据，其他给简易数据，如果不带则全部给出）
const mapTotacticsList = (tid, isUnAuto) => {
   let result;
   if (!isUnAuto) isRateDone = false;
   if (!tid) {
       result = tacticsList.map(item => item.getInfo());
   } else {
       result = tacticsList.map(item => {
           if (item.id === tid) {
               return {
                   target: true,
                   ...item.getInfo()
               };
           } else {
               return {
                   target: false,
                   ...item.getSimplyInfo()
               };
           }
       })
   }
   scoket.emit(WsRoute.TACTICS_LIST, result);
};

module.exports = {
   presentSymbleId,
   isRateDone,
   tacticsList,
   initTactics,
   removeTactics,
   mapTotacticsList,
   setScoket: (_scoket) => scoket = _scoket,
}
*/