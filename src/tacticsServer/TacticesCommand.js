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
const { scoketCandles } = require('./binanceScoketBind');
const { userList } = require('../controllers/user')
const { getScoket } = require('../tool/ScoketInstance');

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
    initTactics(uid, symbol, name, parameter) {
        try {
            let _tactics = this.tacticsList.find(item => item.symbol === symbol);//一种币最多跑一个程序
            if (!_tactics) {
                _tactics = new SellIntoCorrections(uid, name || `${symbol}_${this.tacticsList.length + 1}`, parameter);
                _tactics.symbol = symbol;
                this.tacticsList.push(_tactics);
                this.setPresentSymbleId(_tactics.id)
            }
            //初始化时给点数据
            client.candles({ symbol: symbol, interval: '5m', limit: 1 }).then(data => _tactics.KLineItem5m.present = data[0]);
            this.mapTotacticsList(uid, _tactics.id, true);
            scoketCandles.call(this, symbol, _tactics.id);
            return _tactics;
        } catch (e) {
            console.error(`initTactics Error${e}`)
            return false;
        }
    }
    removeTactics(id) {
        let _tactics = this.tacticsList.find(item => item.id === id);
        if (_tactics) _tactics.remove(() => {
            this.tacticsList = this.tacticsList.filter(item => item.id !== id);
            this.mapTotacticsList(_tactics.uid, id);
            _tactics = undefined;
        });
    }
    /** 获取量化交易实例列表（若带参数，则有重点的给出数据，其他给简易数据，如果不带则全部给出）isUnAuto=false,表示不马上发出，等待下一次自动推送 */
    mapTotacticsList(uid, tid, isUnAuto) {
        let result;
        if (isUnAuto === false) this.isRateDone = false;
        if (!tid) {
            result = this.tacticsList.filter(item => item.uid === uid).map(item => item.getInfo());
        } else {
            result = this.tacticsList.filter(item => item.uid === uid).map(item => {
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
        //console.log(result);
        const user = userList.find(user => user.id === uid);
        if (user) {
            const scokets = user.scokets.filter(item => item.tid === tid);
            scokets.forEach(item => {
                const scoket = getScoket(item.scoketId);
                if (scoket) {
                    scoket.emit(WsRoute.TACTICS_LIST, result);
                } else {
                    console.log('未找到scoket:'+item.scoketId)
                }
            })
        }
        //this.scoket.emit(WsRoute.TACTICS_LIST, result);
        return this.tacticsList.find(item => item.id === tid);
    };
}