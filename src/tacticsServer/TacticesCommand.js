/*
 * @Author: weishere.huang
 * @Date: 2020-07-28 02:58:03
 * @LastEditTime: 2020-08-24 14:19:23
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const Tactics = require('./Tactics');
const SellIntoCorrections = require('./SellIntoCorrections');
const { WsConfig, WsRoute } = require('../config')
const { client } = require('../lib/binancer');
const { userRooms } = require('../controllers/user')
const { Task } = require('../db')

module.exports = class TacticesCommand {
    constructor() {
        this.scoketIO;
        this.presentSymbleId = '';//当前选中的交易
        this.tacticsList = [];
        this.isRateDone = true;//是否已经完成了正常数据发送
        this.initTasks();
        this.getAllTicker();
        this.allTicker = null;
        this.syncDataGo();
        this.startWaveSpeedData();
    }
    static getInstance() {
        if (!this.tacticesCommand) {
            this.tacticesCommand = new TacticesCommand();
        }
        return this.tacticesCommand;
    }
    async syncDataGo() {
        await this.syncData();
        setTimeout(() => { this.syncDataGo() }, 5000);
    }
    /**取数据库数据同步至tacticsList，并根据状态启动 */
    async initTasks() {
        const tasks = await Task.find({});
        tasks.forEach(({ uid, name, taskJson }) => {
            const mod = JSON.parse(taskJson);
            let tactics = new SellIntoCorrections(uid, name, mod.parameter);
            tactics = Object.assign(tactics, mod);
            this.tacticsList.push(tactics);
            tactics.setSymbol(tactics.symbol);
            if (tactics.runState) {
                tactics.runState = false;//powerSwitch函数在启动轮询前会反向设置runState
                tactics.powerSwitch();
            }
        })
    }
    /** 同步数据至数据库 */
    async syncData() {
        return new Promise(resolve => {
            this.tacticsList.forEach(async tesk => {
                const result = await Task.findOneAndUpdate({
                    tid: tesk.id,
                    uid: tesk.uid,
                    name: tesk.name,
                    taskJson: JSON.stringify(tesk.getInfo())
                }, function (err) { console.error(err) });
            });
            resolve(true);
        });
    }
    /**启动K线逻辑 */
    async runSymbolSync() {

    }

    setScoket(scoketIO) {
        this.scoketIO = scoketIO;
    }
    initTactics(uid, symbol, name, parameter) {
        try {
            let _tactics = this.tacticsList.find(item => (item.symbol === symbol && item.uid === uid));//一个用户亦种币最多跑一个程序
            if (!_tactics) {
                _tactics = new SellIntoCorrections(uid, name || `${symbol}_${this.tacticsList.length + 1}`, parameter);
                this.tacticsList.push(_tactics);
            }
            _tactics.setSymbol(symbol);
            this.mapTotacticsList(uid, _tactics.id, true);
            this.syncData();
            return _tactics;
        } catch (e) {
            console.error(`initTactics Error${e}`)
            return false;
        }
    }
    removeTactics(id) {
        let _tactics = this.tacticsList.find(item => item.id === id);
        if (_tactics) _tactics.remove(async () => {
            this.tacticsList = this.tacticsList.filter(item => item.id !== id);
            this.mapTotacticsList(_tactics.uid, id, true);
            await Task.findOneAndRemove(_tactics.id, function (err) { console.error(err) });
            _tactics = undefined;
        });
    }
    /** 获取量化交易实例列表（若带参数，则有重点的给出数据，其他给简易数据，如果不带则全部给出）
     * nowSend=true,表示马上发出，并暂停下一次自动推送
     * nowSend=false,表示不马上发出，等待下一次自动推送
     * nowSend为空，表示马上发出，而且下次正常推送 */
    mapTotacticsList(uid, tid, nowSend) {
        const r = userRooms.find(r => r.uid === uid);
        if (r) {
            r.tids.forEach(({ tid, scoketId }) => {
                let result;
                if (nowSend === true) {
                    this.isRateDone = false;
                } else if (nowSend === false) {
                    return;
                }
                if (!tid) {
                    result = this.tacticsList.filter(item => item.uid === uid).map(item => item.getInfo());
                } else {
                    result = this.tacticsList.filter(item => item.uid === uid).map(item => {
                        if (item.id === tid) {
                            return { target: true, ...item.getInfo() };
                        } else {
                            return { target: false, ...item.getSimplyInfo() };
                        }
                    })
                }
                this.scoketIO.to(scoketId).emit(WsRoute.TACTICS_LIST, result);
                //if (this.scoketIO.sockets.connected[scoketId]) this.scoketIO.sockets.connected[scoketId].emit(WsRoute.TACTICS_LIST, result);
                //this.scoketIO.to(r.uid).emit(WsRoute.TACTICS_LIST, result);
            })
        }

        //console.log(result);
        // const user = userList.find(user => user.id === uid);
        // if (user) {
        //     const scokets = user.scokets.filter(item => item.tid === tid);
        //     scokets.forEach(item => {
        //         const scoket = getScoket(item.scoketId);
        //         if (scoket) {
        //             scoket.emit(WsRoute.TACTICS_LIST, result);
        //         } else {
        //             console.log('未找到scoket:'+item.scoketId)
        //         }
        //     })
        // }
        //this.scoket.emit(WsRoute.TACTICS_LIST, result);
        return this.tacticsList.find(item => item.id === tid);
    };
    pushBetterSymbol(uid, id, symbolList) {
        const r = userRooms.find(r => r.uid === uid);
        if (r) {
            r.tids.forEach(({ tid, scoketId }) => {
                if (tid === id) {
                    this.scoketIO.to(scoketId).emit(WsRoute.MULTIPLE_PRICE_CHANGE, symbolList);
                }
            })
        }
    }
    async getAllTicker() {
        // const tickers = await client.allBookTickers();
        // this.allTicker = tickers;
        // setTimeout(() => {
        //     this.getAllTicker();
        // }, 60 * 60 * 1000);
        client.ws.allTickers(tickers => {
            this.allTicker = tickers.filter(item => /USDT$/.test(item.symbol)).sort((a, b) => b.priceChangePercent - a.priceChangePercent);
        })
    }
    /**定时器处理波动速度数据 */
    startWaveSpeedData() {
        setInterval(() => {
            this.tacticsList.forEach(item => {
                if (item.presentTrade) {
                    //1秒取一次样
                    if (item.presentSpeedArr.length === 35) item.presentSpeedArr.shift();
                    item.presentSpeedArr.push(item.presentTrade.price);
                }
            })
        }, 1000);
    }
}