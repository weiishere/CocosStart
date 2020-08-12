/*
 * @Author: weishere.huang
 * @Date: 2020-07-28 02:58:03
 * @LastEditTime: 2020-08-12 18:51:59
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const Tactics = require('./Tactics');
const SellIntoCorrections = require('./SellIntoCorrections');
const { WsConfig, WsRoute } = require('../config')
//const client = require('binance-api-node').default()
const { client } = require('../lib/binancer');
const { scoketCandles } = require('./binanceScoketBind')
module.exports = class TacticesCommand {
    constructor() {
        this.scoket;
        this.presentSymbleId = '';//当前选中的交易
        this.tacticsList = [];
        this.isRateDone = true;//是否已经完成了正常数据发送
    }
    static getInstance() {
        if (!this.tacticesCommand) {
            this.tacticesCommand = new TacticesCommand();
        }
        return this.tacticesCommand;
    }
    setScoket(scoket) {
        this.scoket = scoket;
    }
    setPresentSymbleId(symbleId) {
        this.presentSymbleId = symbleId;
    }
    initTactics(symbol, name, parameter) {
        try {
            let _tactics = this.tacticsList.find(item => item.tactics.symbol === symbol);//一种币最多跑一个程序
            if (!_tactics) {
                _tactics = new SellIntoCorrections(name || `${symbol}_${this.tacticsList.length + 1}`, parameter);
                _tactics.symbol = symbol;
                this.tacticsList.push({ userId: 0, tactics: _tactics });
                this.setPresentSymbleId(_tactics.id)
                //this.mapTotacticsList(_tactics.id, false);
            }
            //初始化时给点数据
            client.candles({ symbol: symbol, interval: '5m', limit: 1 }).then(data => _tactics.KLineItem5m.present = data[0]);
            this.mapTotacticsList(_tactics.id, true);
            scoketCandles.call(this, symbol, _tactics.id);
            return _tactics;
        } catch (e) {
            console.error(`initTactics Error${e}`)
            return false;
        }
    }
    removeTactics(id) {
        let _tactics = this.tacticsList.find(item => item.tactics.id === id);
        if (_tactics) _tactics.remove(() => {
            this.tacticsList = this.tacticsList.filter(item => item.tactics.id !== id);
            this.mapTotacticsList(id);
            _tactics = undefined;
        });
    }
    /** 获取量化交易实例列表（若带参数，则有重点的给出数据，其他给简易数据，如果不带则全部给出）isUnAuto=false,表示不马上发出，等待下一次自动推送 */
    mapTotacticsList(tid, isUnAuto) {
        let result;
        if (isUnAuto === false) this.isRateDone = false;
        if (!tid) {
            result = this.tacticsList.map(item => item.tactics.getInfo());
        } else {
            result = this.tacticsList.map(item => {
                if (item.tactics.id === tid) {
                    return {
                        target: true,
                        ...item.tactics.getInfo()
                    };
                } else {
                    return {
                        target: false,
                        ...item.tactics.getSimplyInfo()
                    };
                }
            })
        }
        //console.log(result);
        this.scoket.emit(WsRoute.TACTICS_LIST, result);
        return this.tacticsList.find(item => item.tactics.id === tid).map(item => item.tactics);
    };
    // mapTotacticsListTest(scoket) {
    //     this.scoket.emit(WsRoute.TACTICS_LIST, { eee: 9000 });
    // }
}