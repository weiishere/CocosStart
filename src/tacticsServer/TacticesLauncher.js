/*
 * @Author: weishere.huang
 * @Date: 2020-07-28 02:58:03
 * @LastEditTime: 2020-10-06 00:41:25
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const SellIntoCorrections = require('./SellIntoCorrections');
const { WsConfig, WsRoute } = require('../config')
const { client } = require('../lib/binancer');
const { userRooms } = require('../controllers/user')
const { Task, ExchangeDB } = require('../db');
const { reExecute } = require('../tool/Common');
const { getSymbolStorageFromDB } = require('./restrainGroup');
const { BuyDeal, SellDeal } = require('./Exchange');
const { mailTo } = require('../tool/sendEmail')
//const { scoketCandles } = require('./binanceScoketBind');


module.exports = class TacticesLauncher {
    constructor() {
        this.scoketIO;
        this.isDone = false;
        this.presentSymbleId = '';//当前选中的交易
        this.tacticsList = [];
        this.isRateDone = true;//是否已经完成了正常数据发送
        this.getExchangeInfo();
        this.getAllTicker();
        this.allTicker = null;
        this.syncDataGo();
        this.startWaveSpeedData();
        this.sendEmailOnTime();
    }
    static getInstance() {
        if (!this.tacticesLauncher) {
            this.tacticesLauncher = new TacticesLauncher();
        }
        return this.tacticesLauncher;
    }
    async syncDataGo() {
        await this.syncData();
        setTimeout(() => { this.syncDataGo() }, 5000);
    }
    /**
     * 
     * {
        "timezone": "UTC",
        "serverTime": 1508631584636,
        "rateLimits": [
            {
            "rateLimitType": "REQUEST_WEIGHT",
            "interval": "MINUTE",
            "intervalNum": 1,
            "limit": 1200
            },
            {
            "rateLimitType": "ORDERS",
            "interval": "SECOND",
            "intervalNum": 1,
            "limit": 10
            },
            {
            "rateLimitType": "ORDERS",
            "interval": "DAY",
            "intervalNum": 1,
            "limit": 100000
            }
        ],
        "exchangeFilters": [],
        "symbols": [{
            "symbol": "ETHBTC",
            "status": "TRADING",
            "baseAsset": "ETH",
            "baseAssetPrecision": 8,
            "quoteAsset": "BTC",
            "quotePrecision": 8,
            "orderTypes": ["LIMIT", "MARKET"],
            "icebergAllowed": false,
            "filters": [{
            "filterType": "PRICE_FILTER",
            "minPrice": "0.00000100",
            "maxPrice": "100000.00000000",
            "tickSize": "0.00000100"
            }, {
            "filterType": "LOT_SIZE",
            "minQty": "0.00100000",
            "maxQty": "100000.00000000",
            "stepSize": "0.00100000"
            }, {
            "filterType": "MIN_NOTIONAL",
            "minNotional": "0.00100000"
            }]
        }]
        }
     * @param symbol 可选
     */
    async getExchangeInfo(symbol) {
        try {
            if (!this.exchangeInfo) this.exchangeInfo = await client.exchangeInfo();
            return symbol ? this.exchangeInfo.symbols.find(item => item.symbol === symbol) : this.exchangeInfo;
        } catch (e) {
            console.log(e);
            return await reExecute(async (symbol) => {
                if (!this.exchangeInfo) this.exchangeInfo = await client.exchangeInfo();
                return symbol ? this.exchangeInfo.symbols.find(item => item.symbol === symbol) : this.exchangeInfo;
            }, 500);
        }

    }
    /**取数据库数据同步至tacticsList，并根据状态启动 */
    async initTasks() {
        process.env.CHILD_PROCESS === '0' && await getSymbolStorageFromDB();//先初始化SymbolStorage
        const tasks = await Task.find({});
        tasks.forEach(async ({ uid, name, taskJson }) => {
            const mod = JSON.parse(taskJson);
            let tactics = new SellIntoCorrections(uid, name, mod.parameter);
            tactics.loadUpBuyHelper = Object.assign(tactics.loadUpBuyHelper, JSON.parse(mod.loadUpBuyHelper));
            delete mod.loadUpBuyHelper;
            tactics = Object.assign(tactics, mod);
            const exchangeList = await ExchangeDB.find({ tid: tactics.id }, 10800000);
            //const now = Date.parse(new Date());
            exchangeList.forEach(item => {
                let dealObj;
                if (item.dealType === 'buy') {
                    dealObj = new BuyDeal(item.symbol, item.id, item.roundId, item.imitateRun, item.marketPrice, item.dealAmount);
                } else {
                    dealObj = new SellDeal(item.symbol, item.id, item.roundId, item.imitateRun, item.marketPrice, item.dealAmount);
                }
                dealObj = Object.assign(dealObj, item.toObject());
                dealObj = Object.assign(dealObj, item.toObject());
                dealObj.id = item.id;
                tactics.exchangeQueue.push(dealObj);
            })
            await tactics.doHistoryStatistics();
            this.tacticsList.push(tactics);
            tactics.initialize(tactics.symbol);
            if (tactics.runState) {
                //tactics.runState = false;//powerSwitch函数在启动轮询前会反向设置runState
                tactics.powerSwitch();
            }
        })
    }
    /** 同步数据至数据库 */
    async syncData() {
        return new Promise(resolve => {
            this.tacticsList.forEach(async task => {
                //导入数据库之前清理一次历史记录
                this.historyClear(task);
                const result = await Task.findOneAndUpdate({
                    tid: task.id,
                    uid: task.uid,
                    name: task.name,
                    taskJson: JSON.stringify(task.getDBInfo()),
                    historyStatistics: task.historyStatistics
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
    async initTactics(uid, symbol, name, parameter) {
        try {
            // let _tactics = this.tacticsList.find(item => (item.uid === uid && item.symbol === symbol));
            // if (!_tactics) {
            //     _tactics = new SellIntoCorrections(uid, name || `${symbol}_${this.tacticsList.length + 1}`, parameter);
            //     this.tacticsList.push(_tactics);
            // }
            const _tactics = new SellIntoCorrections(uid, name || `${symbol}_${this.tacticsList.length + 1}`, parameter);
            this.tacticsList.push(_tactics);
            _tactics.initialize(symbol);
            this.mapTotacticsList(uid, _tactics.id, true);
            await this.syncData();
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
    mapTotacticsList(uid, _tid, nowSend) {
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
        return this.tacticsList.find(item => item.id === _tid);
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
    /**exchangeQueue可以缺省 */
    pushExchange(uid, id, symbol, exchangeQueue) {
        const _exchangeQueue = exchangeQueue || this.tacticsList.find(item => item.id === id).exchangeQueue;
        const r = userRooms.find(r => r.uid === uid);
        if (r) {
            r.tids.forEach(({ tid, scoketId }) => {
                if (tid === id) {
                    this.scoketIO.to(scoketId).emit(WsRoute.EXCHANGE_LIST, _exchangeQueue.filter(item => item.symbol === symbol).map(item => ({
                        roundId: item.roundId,
                        dealType: item.dealType,
                        dealDate: item.dealDate,
                        symbol: item.symbol,
                        dealPrice: item.dealPrice,
                        signStr: item.signStr
                    })));
                }
            })
        }
    }
    /**推送交易回合通知 */
    pushRoundResultInform(uid, id, order) {
        const tactices = this.tacticsList.find(item => item.id === id);
        const r = userRooms.find(r => r.uid === uid);
        if (r) {
            r.tids.forEach(({ tid, scoketId }) => {
                tid === id && this.scoketIO.to(scoketId).emit(WsRoute.ROUND_RESULT_INFORM, { order, tactices: tactices.getInfo() });
            })
        }
    }
    pushHistory(uid, id, historyObj) {
        const r = userRooms.find(r => r.uid === uid);
        if (r) {
            const objs = r.tids.filter(item => item.tid === id);
            if (objs.length) {
                objs.forEach(item => {
                    this.scoketIO.to(item.scoketId).emit(WsRoute.HISTORY_LIST, historyObj);
                })
            }

        }
    }
    /**清理历史记录 */
    historyClear(tactices) {
        const fn = (expression) => {
            let clearCount = 0;
            for (let i = 0; i <= 100; i++) {
                if (expression(tactices.history[i].type)) {
                    clearCount++;
                    tactices.history[i] = undefined;
                }
            }
            clearCount && (tactices.history = tactices.history.filter(item => item));
            return clearCount;
        }
        //数据超过500条做一个清理，清理前100条里面的info信息，其次清理非买卖信息，最后清理买卖
        if (tactices.history.length > 400) {
            let c = fn((value) => value === 'info');
            if (c === 0) {
                c = fn((value) => (value !== 'buy' && value !== 'sell'));
                if (c === 0) {
                    c = fn((value) => (value === 'buy' || value === 'sell'));
                }
            }
        }
    }
    async getAllTicker() {
        // const tickers = await client.allBookTickers();
        // this.allTicker = tickers;
        // setTimeout(() => {
        //     this.getAllTicker();
        // }, 60 * 60 * 1000);
        await client.ws.allTickers(tickers => {
            this.allTicker = tickers.filter(item => /USDT$/.test(item.symbol)).sort((a, b) => b.priceChangePercent - a.priceChangePercent);
            !this.isDone && this.initTasks();
            this.isDone = true;
        });

    }
    /**定时器处理波动速度数据 */
    startWaveSpeedData() {
        setInterval(() => {
            this.tacticsList.forEach(item => {
                if (item.presentPrice) {
                    //2秒取一次样
                    if (item.presentSpeedArr.length === 50) item.presentSpeedArr.shift();
                    item.presentSpeedArr.push(item.presentPrice);
                }
            })
        }, 2000);
    }
    /**定时器发送通知邮件 */
    sendEmailOnTime() {
        setInterval(() => {
            if (Date.parse(new Date()) % (60 * 60 * 1000) < 60000) {
                //整点报告

                mailTo({
                    subject: '当前运行中的任务情况',
                    content: this.tacticsList.filter(item => item.buyState).map(item => {
                        const elapsedTime = (Date.parse(new Date()) - item.roundRunStartTime) / 60000;
                        return `
                        <div>
                            <p>任务名：${item.name}(${item.symbol})</p>
                            <p>当前盈亏/盈亏率：${item.presentDeal.rtProfit}/${item.presentDeal.rtProfit / (item.presentDeal.inCosting - item.presentDeal.outCosting)}</p>
                            <p>场内成本：${item.presentDeal.inCosting - item.presentDeal.outCosting}</p>
                            <p>已耗时：${parseInt(elapsedTime / 60)}时${parseInt(elapsedTime % 60)}分</p>
                            <p>历史盈亏：${item.historyStatistics.totalProfit}</p><hr/>
                            <p>盈利/回合数：${(item.historyStatistics.winRoundCount || 0)}/${(item.historyStatistics.roundCount || 0)}</p><hr/>
                        </div>`
                    }).join('')
                })
            }

        }, 1000 * 60);
    }
}