/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:50:17
 * @LastEditTime: 2020-09-11 14:32:15
 * @LastEditors: weishere.huang
 * @Description: 追涨杀跌对象
 * @~~
 */

const Tactics = require('./Tactics');
const restrainGroup = require('./restrainGroup');
const { client } = require('../lib/binancer');
const { scoketCandles } = require('./binanceScoketBind');
const LoadUpBuyHelper = require('./LoadUpBuyHelper')

module.exports = class SellIntoCorrections extends Tactics {
    constructor(uid, name, parameter) {
        super(uid, name, parameter);
        this.runState = false;//运行状态  false:stop,true:run
        this.imitateRun = false;//是否是模拟状态
        this.buyState = false;//购买状态  true:in,false:out
        this.symbol = '';//当前交易对
        this.presentTrade = null;
        this.presentSpeedArr = [];
        this.symbolInfo = null;
        this.KLineItem5m = {
            recent: null,//最近的完整K线
            present: null//当前正在运行的k线
        }
        //this.USDTPrice = 0;
        this.KLineItem1m = {}
        // this.KLineItem5mForRecent = null;
        // this.KLineItem5mForPresent = null;
        this.nextSymbol = [];
        //盈利/亏损的交易对
        this.profitSymbol = [
            // { symbol: 'ETHUSDT', profit: 15.2, buyCount: 2 },
            // { symbol: 'BTCUSDT', profit: 1, buyCount: 2 },
            // { symbol: 'ADAUSDT', profit: 2, buyCount: 3 },
            // { symbol: 'FNUSDT', profit: -3.2, buyCount: 1 }
        ];
        this.roundId;//交易回合
        this.history = []
        this.depth = null;//深度
        this.ticker = null;
        //关于交易的一些历史记录（用于BS线）
        this.historyForDeal = [];
        this.checkBuyTime = 0;
        this.checkSymbolTime = 10;
        this.parameterBackup = this.parameter = Object.assign({
            usdtAmount: 11,//每次入场数量（USDT）
            serviceCharge: 0.00075,//币安手续费(千一)
            serviceChargeDiscounts: 0.15,//优惠费率(返费，暂不考虑))
            checkBuyRate: 5000,//入场时间检查速率
            riseStayCheckRateForBuy: 8000,//未入场及上涨情况下，判断间隔等待时间
            riseBuyRange: 0.001,//上涨情况下，入场的上涨幅度
            autoSymbol: true,//自动切币
            //autoRun: false,
            ambushRange: 0.001,//需进行埋伏操作的下跌率
            /** 出场检测速率*/
            checkSellRate: 5000,
            riseStayCheckRateForSell: 15000,//止损等待时间
            stopRiseRate: 0.2,//强制止盈涨幅
            lowestRiseRate: 0.005,//最低盈利，少了这个值不止盈
            riseStopLossRate: 30,//上涨情况（盈利）下跌止盈点（拐点止盈）
            //lossStopLossRate: 0,//下跌情况（亏损）上涨止损点
            //isLiveRiseStopLossRate: true,
            stopLossRate: 0.1,//下跌情况（亏损）下跌止损点
            maxStayTime: 120,//亏损但未达到止损值的情况下，最久呆的时间(分钟)
            faildBuyTimeForChange: 15,//进场失败次数，用于切币
            isAllowLoadUpBuy: true,//是否允许加仓
            pauseFaildChangeSymbol: true,//若需切币且推荐币为空，是否暂停
            //symbolDriveMod: false,//选币驱动模式
        }, parameter || {});

        //基于基本逻辑下的高级约束(入场约束，出场约束，动态参数，选币方案)
        this.advancedOption = {
            premiseForBase: [],
            premiseForBuy: ['last5kRise', 'bollStandard'],
            premiseForSell: ['fastRise'],
            premiseJoin: { premiseForBase: 'and', premiseForBuy: 'or', premiseForSell: 'and' },
            dynamicParam: ['setRiseStopLossRate'],
            symbolElecter: ['blacklist', 'history24h']
        }

        //参数的说明，也表示需要进行界面设定的参数
        this.parameterDesc = {
            //serviceCharge: "币安手续费(千一)",
            //serviceChargeDiscounts: "优惠费率(实付费用(1-0.25))",

            lowestRiseRate: [true, "最低盈利(相对成本)"],
            riseStopLossRate: [true, "止盈拐点跌幅%(相对盈利)"],
            stopLossRate: [true, "止损(相对成本跌幅)"],
            //isLiveRiseStopLossRate: [true, "是否动态设置拐点跌幅"],
            checkBuyRate: [true, "买入检查频率"],
            riseStayCheckRateForBuy: [false, "买入确认频率"],
            riseBuyRange: [true, "买入确认涨幅"],
            autoSymbol: [true, "自动切币(自启动)"],
            //autoRun: [true, "有推荐币是否自动入场(需先启动)"],
            //ambushRange: "埋伏入场下跌率",
            checkSellRate: [true, "卖出检查频率"],
            riseStayCheckRateForSell: [true, "卖出确认频率"],
            //lossStopLossRate: [false, "拐点止损(回本增幅%)，设0禁用"],
            stopRiseRate: [false, "强制止盈(相对成本涨幅),为0则关闭"],
            usdtAmount: [false, "每次入场USDT数量"],
            maxStayTime: [false, "场内持续时间(分钟)"],
            isAllowLoadUpBuy: [false, "是否允许加仓"],
            faildBuyTimeForChange: [false, "未盈利情况下需切币的进场失败次数(<100)，若“自动切币”功能打开，超过100次会强制切币"],
            //symbolDriveMod: [false, "选币驱动模式，会保持选币一直运行，如果有新币产生，即尽快出场(盈利或亏损在0.5个点内)并切币进入，打开此开关需保证有及其严格的选币方案"],
            pauseFaildChangeSymbol: [false, "是否待机等待。(关闭此项，进场失败次数达到n次，或者切币10次为空则会停机)"]
        };
        this.presentPrice = 0;//当前价格
        //当前的交易信息
        this.presentDeal = {
            costing: 0,//成本,
            payPrice: 0,//买入价格
            amount: 0,//购买后持有的相应代币数量
            historyProfit: 0,//当前交易的历史盈利
            buyOrderInfo: null,
            sellOrderInfo: null,
            orderId: '',//当前交易的orderId，可能是买，也可能是卖
            tradeRole: 'buyer',//'seller',当前的交易角色，用于
            // tradesDoneQuantity: 0,//当前交易已经处理完成的币数量（如果tradesDoneQuantity=amount即完成）随着pushTrade弃用而弃用！！
            // tradesDoneAmount: 0//已经完成的金额，随着pushTrade弃用而弃用！！
        }
        //加仓对象
        this.loadUpBuyHelper = new LoadUpBuyHelper(this);
    }
    /**初始化，启动的时候调用 */
    async initialize(symbol) {
        //if (this.runState) return false;//运行期间不允许更改
        this.symbol = symbol;
        this.symbolInfo = await require('./TacticesCommand').getInstance().getExchangeInfo(this.symbol);
        //初始化时给点5分线数据
        client.candles({ symbol, interval: '5m', limit: 1 }).then(data => this.KLineItem5m.present = data[0]);
        await this.getPresentPrice(true);//获取最新价格
        scoketCandles();
    }
    /**添加历史记录:isDouble：如果重复两条记录，是否允许重复添加
     * @type:info/profitChange
     * @content
     * @isDouble
     */
    addHistory(type, content, isDouble, option) {
        if (isDouble && this.history.length !== 0 && this.history[this.history.length - 1].type === type && this.history[this.history.length - 1].content === content) {
            this.historyDoubleCount++;
            this.history[this.history.length - 1].time = Date.parse(new Date());
            require('./TacticesCommand').getInstance().pushHistory(this.uid, this.id, {
                history: this.history,
                historyForDeal: this.historyForDeal
            });
            return;
        }
        const theOption = Object.assign({
            color: '#999',
            iconType: '',
            subType: '',
            isMap: (type === 'info' ? false : true)
        }, option || {});
        type !== 'profitChange' && this.history.push({
            type: type,//order、info、buy、sell
            time: Date.parse(new Date()),
            content: content,//`实例已${(this.runState ? "运行" : "停止")}${this.imitateRun ? "模拟" : ""}`
            color: theOption.color,
            subType: theOption.subType
        })
        if (type === 'buy' || type === 'sell') {
            this.historyForDeal.push({ ...this.history[this.history.length - 1], symbol: this.symbol });
        } else if (type === 'profitChange') {
            let hfdItem = this.historyForDeal[this.historyForDeal.length - 1];
            if (hfdItem) {
                hfdItem['symbol'] = this.symbol;
                hfdItem['changeTime'] = Date.parse(new Date());
                hfdItem.content.profit = content;
            }
        }
        if (theOption.isMap) {
            require('./TacticesCommand').getInstance().mapTotacticsList(this.uid, this.id, (type === 'profitChange' ? false : true));
        }
        require('./TacticesCommand').getInstance().pushHistory(this.uid, this.id, {
            history: this.history,
            historyForDeal: this.historyForDeal
        });
        //if (this.presentSymbleId === this.id) _tacticesCommand.mapTotacticsList(this.uid, _tacticesCommand.presentSymbleId, true);
    }
    /**寻找新币，返回待选列表，和当前用户下的实例中，此实例用到的交易对（可能排名前面的正在使用中） */
    async findSymbol() {
        let symbolList = require('./TacticesCommand').getInstance().allTicker.map(({ symbol, priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose }) => ({
            symbol: symbol, score: 0,
            data: {
                priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose
            }
        }));
        let symbols = symbolList;
        for (let i = 0; i < restrainGroup.symbolElecter.length; i++) {
            const restrain = restrainGroup.symbolElecter[i];
            if (this.advancedOption.symbolElecter.some(item => item === restrain.key)) {
                symbols = await restrain.method(symbols, this);
                // if (symbolList.length !== 0) {
                //     symbolList = symbolList.filter(v => _symbolList.some(it => it.symbol === v.symbol));//取交集
                // } else {
                //     symbolList = symbolList.concat(_symbolList);
                // }
            }
        }
        symbols = Array.from(new Set(symbols));//去重!!!这里要考虑一下symbol排序优先级
        //const symbols = a.concat(b.filter(v => !a.includes(v)));
        let chooseSymbol = '';
        if (symbols.length !== 0) {
            const tacticsList = require('./TacticesCommand').getInstance().tacticsList;
            for (let i = 0; i < symbols.length; i++) {
                if (tacticsList.some(item => (item.symbol === symbols[i].symbol && item.id !== this.id))) {
                    continue;
                } else {
                    chooseSymbol = symbols[i].symbol;
                    break;
                }
            }
        }
        require('./TacticesCommand').getInstance().pushBetterSymbol(this.uid, this.id, symbols);
        return { symbols, chooseItem: chooseSymbol };
    }
    /**切币函数，返回false则停止，返回true继续*/
    async checkChangeSymbol() {
        const startSwitch = async () => {
            if (this.parameter.autoSymbol) {
                //寻找新币
                const { chooseItem } = await this.findSymbol();
                if (chooseItem) {
                    this.addHistory('info', `获取到新推荐币种(${chooseItem})，实例即将自动启动...`, true, {
                        color: '#b1eac5',
                        subType: 'changeSymbol',
                        isMap: true,
                        data: { symbol: chooseItem }
                    });
                    this.initialize(chooseItem);
                    this.checkSymbolTime = 10;
                    this.checkBuyTime = 0;
                } else {
                    //无币
                    if (this.checkSymbolTime === 0) {
                        if (!this.parameter.pauseFaildChangeSymbol) {
                            this.addHistory('info', `未搜寻到新币（10次），实例即将停止...`, true);
                            return false;
                        } else {
                            this.addHistory('info', `未搜寻到新币，开始待机无限制切币搜寻(不再做入场监测)...`, true);
                            return undefined;
                        }
                    } else {
                        this.checkSymbolTime--;
                        this.addHistory('info', `进行第${10 - this.checkSymbolTime}次切币搜寻...`, true);
                    }
                }
                return true;
            } else {
                if (this.parameter.pauseFaildChangeSymbol) {
                    this.checkBuyTime = 0;//重启
                    this.addHistory('info', `不允许切币，但允许待机，重置次数再检测...`, true);
                    return true;
                } else {
                    this.addHistory('info', `实例不允许切币，且不允许待机，实例即将停止...`, true);
                    return false;
                }
            }
        }
        //亏损大于1个点就必须切币，要么走人
        if (this.presentDeal.historyProfit >= -0.01) {
            //检测
            this.checkBuyTime++;
            if (this.checkBuyTime >= this.parameter.faildBuyTimeForChange) {
                //达到基本检测次数
                return await startSwitch();
            } else {
                return true;
            }
        } else {
            //亏损，还检测个锤子，直接进入切币流程，且都不做入场检测了
            this.addHistory('info', `上次亏损过量，跳过入场次数检测，开始切币操作`, true);
            const result = await startSwitch();
            if (result) {
                //找到新币
                this.presentDeal.historyProfit = 0;//选到币之后，上一次盈利记录归零，不然下一次还会执行到这里
            }
            return result;
        }
    }

    /** 接收每次推过来的交易信息，如果有符合当前正在交易的数据，就要截获数据  */
    pushTrade(trade) {
        this.presentTrade = trade;
    }
    /**nowBuy=true表示跳过入场判断，立即入场 */
    async powerSwitch(nowBuy) {
        this.fristNowBuy = nowBuy;
        this.runState = true;
        this.checkSymbolTime = 10;
        this.checkBuyTime = 0;
        this.addHistory('order', `实例将${(this.runState ? "开始运行" : "停止")}${this.imitateRun ? "模拟程序" : ""}`, true, { isMap: true, color: '#04ce55' });
        if (this.runState) {
            //开始运行
            let fn = async () => {
                clearTimeout(this.mainTimer);
                //高级
                let allowResult = this.advancedOption.premiseForBase.length === 0 ? true : false;//如果没有约束则直接放过
                for (let i = 0; i < restrainGroup.premiseForBase.length; i++) {
                    const restrain = restrainGroup.premiseForBase[i];
                    if (this.advancedOption.premiseForBase.some(item => item === restrain.key)) {
                        if (await restrain.method(this)) {
                            if (this.advancedOption.premiseForBase.length === 1 || this.advancedOption.premiseJoin.premiseForBase === 'or') {
                                allowResult = true;//只要有一个满足就走
                                break;
                            }
                        } else {
                            if (this.advancedOption.premiseForBase.length === 1 || this.advancedOption.premiseJoin.premiseForBase === 'and') {
                                allowResult = false;//只要有一个不满足，就终止
                                this.addHistory('info', `运行基础约束“${restrain.label}”未通过，继续监测运行...`, true);
                                break;
                            }
                        }
                    }
                }
                if (allowResult) {
                    if (!this.buyState) {
                        if (this.fristNowBuy) {
                            //立即买入
                            this.buyState = true;
                            if (await this.deal('buy')) {
                            } else {
                                this.buyState = false;
                            }
                            this.fristNowBuy = false;//第二次买入逻辑，就不能立即买入了
                        } else {
                            //入场判断
                            this.buyState = await this.buy();
                        }
                    } else {
                        //动态参数高级
                        for (let i = 0; i < restrainGroup.dynamicParam.length; i++) {
                            const restrain = restrainGroup.dynamicParam[i];
                            if (this.advancedOption.dynamicParam.some(item => item === restrain.key)) {
                                await restrain.method(this);
                            }
                        }
                        const r = await this.sell();
                        this.buyState = !r;
                    }
                }
                this.mainTimer = setTimeout(async () => {
                    this.runState && await fn();
                }, this.buyState ? this.parameter.checkSellRate : this.parameter.checkBuyRate);
            }
            await fn();
        } else {
            //停止
            this.stop();
        }

    }
    /**暂停 */
    powerPause() {
        if (this.mainTimer) clearTimeout(this.mainTimer);
        //this.runState = false;
        this.addHistory('order', `实例${this.name}已经发送暂停指令(执行完最后的逻辑)...`, false, { isMap: true, color: '#04ce55' });
        if (this.buyState) {
            this.addHistory('info', `【注意】实例处于买入状态，暂停期间将不进行出场判定...`, false);
        }
    }
    async remove(deleteFn) {
        if (this.runState) await this.stop();
        deleteFn(this);
        this.addHistory('order', `实例${this.name}已经删除...`, false, { isMap: true, color: '#04ce55' });
    }
    async stop() {
        this.mainTimer && clearInterval(this.mainTimer);
        //this.dealTimer && clearInterval(this.dealTimer);
        if (this.buyState) {
            await this.deal('sell');
            this.buyState = false;
        } else {

        }
        this.runState = false;
        this.addHistory('order', `实例${this.name}已经停止...`, false, { isMap: true, color: '#04ce55' });
    }
    async buy() {
        //次数未满之前肯定返回true，没有切币判断，都返回true
        //如果上个交易亏损且检测次数满了，且没有币就会返回false，且不动，如果待机没开就停止了，如果待机开了，就等待有币了就会返回true，重新启动
        let chooseResult;
        if (this.advancedOption.premiseForBase.indexOf('symbolDriveMod') === -1) {
            chooseResult = await this.checkChangeSymbol();//切币检测
        } else {
            //在选币驱动模式下，就不用再做选币等待了，直接走
            chooseResult = true;
        }
        if (chooseResult === false) {
            //10次没有币推荐，或者不允许切币，且要求停机
            await this.stop();
            return false;
        } else if (chooseResult === true) {
            //进场尝试次数还没有达，或者也没新币却要求待机，或者获取到了新币
        } else {
            //入场检测都不做了
            return false;
        }
        // if (!this.KLineItem5m.present) {
        //     this.addHistory('info', `获取最近5分线数据...`, true);
        //     return false;
        // }
        //高级
        let allowResult = this.advancedOption.premiseForBuy.length === 0 ? true : false;//如果没有约束则直接放过
        for (let i = 0; i < restrainGroup.premiseForBuy.length; i++) {
            const restrain = restrainGroup.premiseForBuy[i];
            if (this.advancedOption.premiseForBuy.some(item => item === restrain.key)) {
                if (!await restrain.method(this)) {
                    if (this.advancedOption.premiseForBuy.length === 1 || this.advancedOption.premiseJoin.premiseForBuy === 'and') {
                        //只要有一个不符合，就不通过
                        this.addHistory('info', `入场约束“${restrain.label}”不符合，重新等待入场...`, true, { color: '#5bb3ab' });
                        return false;
                    }
                } else {
                    if (this.advancedOption.premiseForBuy.length === 1 || this.advancedOption.premiseJoin.premiseForBuy === 'or') {
                        allowResult = true;//只要有一个符合，就通过
                        break;
                    }
                }
            }
        }
        if (this.advancedOption.premiseJoin.premiseForBuy === 'or' && !allowResult) {
            this.addHistory('info', `入场约束均不符合条件，重新等待入场...`, true, { color: '#5bb3ab' });
            return false
        };
        //const isContinue = restrainGroup.premiseForBuy.some(item => this.advancedOption.some(i => i === item.key) && !item.method(this));

        //this.addHistory('info', `获取最近5分线数据成功，判断入场时机...`, true);
        //如果当前是上涨且判断涨幅满足
        if (this.KLineItem5m.present && this.KLineItem5m.present.close - this.KLineItem5m.present.open > 0) {
            //if (this.KLineItem5m.present.close - (this.KLineItem5m.recent ? this.KLineItem5m.recent.open : this.KLineItem5m.present.open) > 0) {
            const _riseBuyRange = Math.abs(this.KLineItem5m.present.close - this.KLineItem5m.present.open) / this.KLineItem5m.present.open;
            if (_riseBuyRange > this.parameter.riseBuyRange) {
                //记录当前价格
                const tempPrice = await this.getPresentPrice();//await Helper.getInstance(this).getPresentPrice();
                //console.log(Number(tempPrice) === this.presentPrice ? '价格一致' : '不一致'); console.log(tempPrice + "--" + this.presentPrice);
                this.addHistory('info', `最近5分线上涨幅度${_riseBuyRange}，超过${this.parameter.riseBuyRange}，获取当前价格${Number(tempPrice)}，等待${this.parameter.riseStayCheckRateForBuy / 1000}s后价格...`);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        const price = await this.getPresentPrice();//await Helper.getInstance(this).getPresentPrice();
                        //console.log(Number(price) === this.presentPrice ? '价格一致' : '不一致'); console.log(price + "--" + this.presentPrice);
                        if (price - tempPrice < 0) {
                            this.addHistory('info', `${this.parameter.riseStayCheckRateForBuy / 1000}s后差价为${Number(price - tempPrice)},出现下跌，重新等待入场时机...`);
                            resolve(false);
                        } else {
                            if (await this.deal('buy')) {
                                resolve(true);//先要把状态切成交易中，再进行购买操作
                            } else {
                                resolve(true);
                            }
                        }
                    }, this.parameter.riseStayCheckRateForBuy);
                })
            } else {
                this.addHistory('info', `最近5分线上涨，上涨幅度${_riseBuyRange}，低于买入确认涨幅${this.parameter.riseBuyRange}，重新等待入场时机...`, true);
                return false;
            }
        } else {
            this.addHistory('info', `最近5分线下跌，重新等待入场时机...`, true);
            return false;
        }
    }
    async sell() {
        //高级
        let allowResult = this.advancedOption.premiseForSell.length === 0 ? false : true;//如果没有约束则直接放过
        for (let i = 0; i < restrainGroup.premiseForSell.length; i++) {
            const restrain = restrainGroup.premiseForSell[i];
            if (this.advancedOption.premiseForSell.some(item => item === restrain.key)) {
                if (await restrain.method(this)) {
                    if (this.advancedOption.premiseForSell.length === 1 || this.advancedOption.premiseJoin.premiseForSell === 'or') {
                        //只要有一个满足就出场
                        this.addHistory('info', `符合出场约束“${restrain.label}”，即将进行出场操作...`, true, { color: '#5bb3ab' });
                        return (await this.deal('sell'));
                    }
                } else {
                    if (this.advancedOption.premiseForSell.length === 1 || this.advancedOption.premiseJoin.premiseForSell === 'and') {
                        allowResult = false;//只要有一个不满足出场条件，就不出场
                        break;
                    }
                }
            }
        }
        if (this.advancedOption.premiseJoin.premiseForSell === 'and' && allowResult) {
            this.addHistory('info', `出场约束满足所配置的所以条件，进行出场操作`, true, { color: '#5bb3ab' });
            return (await this.deal('sell'));
            return false;
        };
        const _profit = this.getProfit();
        //this.profitSymbol[this.profitSymbol.length - 1] = { symbol: this.symbol, profit: _profit };
        this.addHistory('profitChange', _profit);
        if (_profit >= 0) {
            this.riseTimer && clearTimeout(this.riseTimer);//清除超时timer
            if (this.parameter.stopRiseRate !== 0 && _profit / this.presentDeal.costing > this.parameter.stopRiseRate) {
                //盈利止盈点
                this.addHistory('info', `盈利：${_profit / this.presentDeal.costing}，已大于最高止盈点：${this.parameter.stopRiseRate}，准备卖出...`);
                return (await this.deal('sell'));
            }
            //如果盈利为正
            if (_profit > this.presentDeal.historyProfit) {
                //利润大于上一次统计的利润，持续盈利中...
                this.addHistory('info', `记录到更高盈利：${_profit}`, true);
                this.presentDeal.historyProfit = _profit;//存储最高利润
                return false;
            } else {
                //利润下降（出现拐点）判断亏损率
                const diff = this.presentDeal.historyProfit - _profit;//相比上次降低的利润
                const _riseStopLossRate = (diff / this.presentDeal.historyProfit) * 100;
                if (_riseStopLossRate > this.parameter.riseStopLossRate) {
                    //亏损率大于一个值,判断当前盈利率，选择是否止盈
                    if (_profit < this.parameter.lowestRiseRate) {
                        //盈利率小于某一个值的话，就不予止盈，否则没太大意义（避免某一下的急跌造成割肉，却没赚到什么）
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(6)}%，大于${this.parameter.riseStopLossRate}%，但低于最低出场盈利率${this.parameter.lowestRiseRate}，继续观察...`, true);
                        return false;
                    } else {
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(6)}%，大于${this.parameter.riseStopLossRate}%，且高于最低出场盈利率${this.parameter.lowestRiseRate}，进行止盈操作！`);
                        //再次确认深度价是否也符合
                        if (((this.presentDeal.historyProfit - this.getProfit(this.presentDeal.amount, true)) / this.presentDeal.historyProfit) * 100 > this.parameter.riseStopLossRate) {
                            return (await this.deal('sell'));
                        } else {
                            this.addHistory('info', `取深度数据取得的成交均价不符合盈利要求，中止止盈，继续观察盈利情况...`, true, { subType: 'impt_1', color: '#0f0' });
                        }
                    }
                } else {
                    //亏损率还未大于一个值，持续观察
                    this.addHistory('info', `盈利下降量${_riseStopLossRate.toFixed(6)}%，继续观察盈利情况...`, true);
                    return false;
                }
            }
        } else {
            //盈利为负（亏损）
            //获取亏损率
            //this.presentDeal.historyProfit = _profit;//重置最高盈利(考虑先盈利很高，突然暴跌后，重新拉回来，但没有冲破最高盈利，一直无法出场)
            if (!this.riseTimer) {
                this.riseTimer = setTimeout(async () => {
                    this.addHistory('info', `亏损状态时间超时，进行止损操作`);
                    if (await this.deal('sell')) {
                        return true;
                    }
                }, this.parameter.maxStayTime * 60000);
            }
            if (_profit < this.presentDeal.historyProfit) {
                //亏损大于上一次统计的亏损，持续亏损中...
                this.addHistory('info', `记录到更高亏损：${_profit}`, true);
                this.presentDeal.historyProfit = _profit;//存储最高亏损
            }
            const _stopLossRate = Math.abs(Number(this.getProfit() / this.presentDeal.costing));
            if (_stopLossRate >= this.parameter.stopLossRate) {
                //止损流程
                //再观察一定时间，看是否涨回去
                this.addHistory('info', `当前处于亏损状态,亏损率：${_stopLossRate.toFixed(6)}，超过${this.parameter.stopLossRate}，${this.parameter.riseStayCheckRateForSell}ms后进行下一步判断是否止损...`, true);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        //再次观察亏损
                        const _profit = this.getProfit();
                        const _stopLossRate2 = Math.abs(Number(_profit / this.presentDeal.costing));
                        if (_stopLossRate2 > 0) {
                            this.addHistory('info', `扭亏为盈，继续等待出场时机...`);
                            this.presentDeal.historyProfit = _profit;
                            // if (_profit > this.presentDeal.historyProfit) {
                            //     //可能是爆拉，直接顶破最高盈利历史记录
                            //     this.presentDeal.historyProfit = _profit;
                            // }
                            resolve(false);
                        } else {
                            if (_stopLossRate2 >= this.parameter.stopLossRate) {
                                this.riseTimer && clearTimeout(this.riseTimer);
                                //仍然大于止损值，割肉
                                this.addHistory('info', `二次判断，继续亏损,亏损率：${_stopLossRate2.toFixed(6)}，仍然超过${this.parameter.stopLossRate}，进行止损操作`);
                                if (await this.deal('sell')) resolve(true); else resolve(false);
                            } else {
                                //说明在回涨，观察
                                this.addHistory('info', `二次判断，亏损降低，亏损率：${_stopLossRate2.toFixed(6)}，低于止损点${this.parameter.stopLossRate}，继续等待出场时机...`, true);
                                resolve(false);
                                //获取相对最高亏损，回调的涨幅
                                // const diff = Math.abs(this.presentDeal.historyProfit - _profit);
                                // const _lossStopLossRate = Math.abs(diff / this.presentDeal.historyProfit) * 100;
                                // if (this.parameter.lossStopLossRate !== 0 && _lossStopLossRate > this.parameter.lossStopLossRate) {
                                //     //回涨的弧度超过一个值，止损
                                //     this.addHistory('info', `二次判断，继续亏损,亏损率：${_stopLossRate2.toFixed(6)}，低于止损点${this.parameter.stopLossRate}，但回涨幅度已高于${this.parameter.lossStopLossRate}%，进行止损操作`);
                                //     if (await this.deal('sell')) resolve(true); else resolve(false);
                                // } else {
                                //     this.addHistory('info', `二次判断，亏损降低，亏损率：${_stopLossRate2.toFixed(6)}，低于止损点${this.parameter.stopLossRate}，继续等待出场时机...`, true);
                                //     resolve(false);
                                // }
                            }
                        }
                    }, this.parameter.riseStayCheckRateForSell);
                });
            } else {
                //持续观察
                this.addHistory('info', `当前处于亏损状态，亏损率：${_stopLossRate.toFixed(6)}，但未达止损点，继续等待出场时机...`, true);
                //加仓
                this.parameter.isAllowLoadUpBuy && this.loadUpBuyHelper.run(this.roundId);
                return false;
            }
        }

        //console.log(price + '---' + this.presentPrice)
        // this.addHistory('info', `暂时标定不卖出，继续...`);
        // return false;
    }
    /**理论利润，用于即时计算利润（通过深度图），即若按照当前价格卖掉，获得的回报减去成本价 */
    getProfit(amount, istheoryPrice) {
        let _amount = amount || this.presentDeal.amount;
        if (istheoryPrice) return Number(_amount * this.getTheoryPrice(_amount).avePrive * (1 - this.parameter.serviceCharge) - this.presentDeal.costing);
        return Number(_amount * this.presentPrice * (1 - this.parameter.serviceCharge) - this.presentDeal.costing);
    }
    /**通过深度图获取可能最终成交的理论交易模型和理论均价 */
    getTheoryPrice(amount) {
        let _amount = 0;
        let total = 0, avePrive = 0;
        let tradesList = [];
        //if (!this.imitateRun) {
        for (let i = 0; i < this.depth.bids.length; i++) {
            const item = this.depth.bids[i];
            if (_amount < amount) {
                const singleTradesAmount = item.quantity > amount - _amount ? amount - _amount : item.quantity;
                tradesList.push({
                    price: item.price,
                    amount: singleTradesAmount
                });
                total += item.price * singleTradesAmount;
                _amount += singleTradesAmount;
            } else {
                break;
            }
        }
        avePrive = total / amount;
        // } else {
        //     tradesList.push({ price: this.presentPrice, amount: amount });
        //     avePrive = this.presentPrice;
        // }
        return {
            tradesList,
            avePrive
        };
    }
    /**获取瞬时市场价格(应该只用于检测入场的时候使用这个，在卖出的时候都应该通过深度图获取理论交易价来判断) */
    async getPresentPrice(newPrice) {
        if (this.presentPrice && !newPrice) return this.presentPrice;
        const allPrice = await client.prices();
        this.presentPrice = allPrice[this.symbol];
        return allPrice[this.symbol];
    }
    /**第二个参数amount用于补仓(buy时使用),其他时候不要用 */
    async deal(order, amount) {
        const price = this.presentPrice = await this.getPresentPrice(true);
        if (order === 'buy') {
            this.checkSymbolTime = 10;
            const dealAmount = this.buyState ? amount : this.parameter.usdtAmount;
            this.buyState && (this.roundId = Date.parse(new Date()));//如果不是加仓，则新生成一个roundId
            if (this.imitateRun) {
                //const hadBuyAmount = this.buyState ? (amount / price + this.presentDeal.amount) : this.parameter.usdtAmount / price, ;
                this.presentDeal = Object.assign(this.presentDeal,
                    {
                        payPrice: price,//买入价
                        costing: this.buyState ? this.presentDeal.costing + (amount * (1 + this.parameter.serviceCharge))
                            : this.parameter.usdtAmount * (1 + this.parameter.serviceCharge),//模拟的时候这里成本等于usdt量
                        amount: this.buyState ? (amount / price + this.presentDeal.amount) : this.parameter.usdtAmount / price,//因为是模拟，这里是理论值
                        historyProfit: this.buyState ? this.presentDeal.historyProfit : 0,//当前交易的历史盈利
                    });
                this.addHistory('buy', {
                    symbol: this.symbol,
                    dealAmount: dealAmount / price,
                    orderInfo: null,
                    profit: this.getProfit(),
                    price: price,
                    costing: this.presentDeal.costing
                }, false, { color: 'red' });
            } else {
                //真实购买，入场数量可以通过市价获取，需要通过推送获取到最终的交易均价，再获取到成本
                //this.dealTimer && clearInterval(this.dealTimer);

                this.presentDeal = Object.assign(this.presentDeal,
                    {
                        payPrice: price,//买入价,暂时等于市价
                        //这里成本暂时等于usdt量加手续费，之后获取订单后会更新
                        costing: this.buyState ? this.presentDeal.costing : 0,//考虑补仓的时候buyState=true
                        inCosting: this.buyState ? this.presentDeal.inCosting : 0,
                        amount: this.buyState ? this.presentDeal.amount : 0,
                        historyProfit: this.buyState ? this.presentDeal.historyProfit : 0,//当前交易的历史盈利
                        // tradesDoneQuantity: 0,//处理完成的币数量
                        // tradesDoneAmount: 0//已经处理完的金额
                    });
                try {
                    this.addHistory('info', `将进行市价买入，投入交易数：${dealAmount}U，预估价格：${price}`);
                    //挂单
                    const { status, type, transactTime, executedQty, orderId, origQty, fills, symbol } = await client.order({
                        symbol: this.symbol,
                        type: 'MARKET',
                        side: 'BUY',
                        quantity: this.getDecimalsForCount(dealAmount / price)
                    });
                    this.presentDeal.buyOrderInfo = { type, transactTime, executedQty, orderId, origQty, fills, symbol, commission: 0, tradesDoneQuantity: 0, tradesDoneAmount: 0 };
                    this.presentDeal.orderId = this.presentDeal.buyOrderInfo.orderId;
                    //this.addHistory('info', `交易完成，交易价格：${price}，完成数量:${this.presentDeal.amount}`);
                    // 这里是市价买入，是立即成交的
                    fills.forEach(item => {
                        //通过BNB交手续费，那么这里导致数量不会扣减，就是实际到账数量
                        this.presentDeal.buyOrderInfo.tradesDoneQuantity += Number(item.qty);
                        this.presentDeal.buyOrderInfo.tradesDoneAmount += Number(item.qty) * Number(item.price);
                    });
                    this.presentDeal.payPrice = this.presentDeal.buyOrderInfo.tradesDoneAmount / this.presentDeal.buyOrderInfo.tradesDoneQuantity;
                    this.presentDeal.amount += this.presentDeal.buyOrderInfo.tradesDoneQuantity;//购买的数量
                    this.presentDeal.costing += this.presentDeal.buyOrderInfo.tradesDoneAmount * (1 + this.parameter.serviceCharge);//实际成本，需加收手续费
                    this.addHistory('buy', {
                        symbol: this.symbol,
                        dealAmount: this.presentDeal.buyOrderInfo.tradesDoneQuantity,
                        orderInfo: this.presentDeal.buyOrderInfo,
                        profit: this.getProfit(),
                        price: this.presentDeal.payPrice,
                        costing: this.presentDeal.costing,
                        inCosting: this.presentDeal.costing
                    }, false, { color: 'red' });
                } catch (e) {
                    console.error(e);
                }
            }
        } else if (order === 'sell') {
            this.checkSymbolTime = 10;
            this.checkBuyTime = 0;
            if (this.imitateRun) {
                //模拟卖出
                //获得回收金额
                this.profitSymbol.push({ symbol: this.symbol, profit: this.getProfit() });
                const costingBuy = this.presentDeal.costing;
                this.presentDeal.costing = this.presentDeal.amount * (1 - this.parameter.serviceCharge) * price;
                this.addHistory('sell', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount,
                    orderInfo: null,
                    price: price,
                    profit: this.presentDeal.costing - costingBuy,
                    costing: this.presentDeal.costing,
                    inCosting: costingBuy,
                    outCosting: this.presentDeal.costing
                }, false, { color: 'green' });
                this.presentDeal.mount = 0;
            } else {
                //真实卖出
                //this.dealTimer && clearInterval(this.dealTimer);
                // this.presentDeal = Object.assign(this.presentDeal, {
                //     tradesDoneAmount: 0,
                //     tradesDoneQuantity: 0//处理完成的币数量和金额，归零用于卖出运算，之后的程序使用getProfit函数记得加上参数this.presentDeal.amount
                // });
                try {
                    this.addHistory('info', `将进行市价卖出，交易数量:${this.presentDeal.amount}`);
                    //挂单
                    const { status, type, transactTime, executedQty, orderId, origQty, fills, symbol } = await client.order({
                        symbol: this.symbol,
                        type: 'MARKET',
                        side: 'SELL',
                        quantity: this.presentDeal.amount
                    });
                    // if (!this.presentDeal.sellOrderInfo) {
                    //     this.addHistory('info', `出场挂单失败`);
                    //     await this.stop();
                    //     return false;
                    // }
                    this.presentDeal.sellOrderInfo = { type, transactTime, executedQty, orderId, origQty, fills, symbol, commission: 0, tradesDoneQuantity: 0, tradesDoneAmount: 0 };
                    this.presentDeal.orderId = this.presentDeal.sellOrderInfo.orderId;

                    // await new Promise(async (resolve) => {
                    //     const fn = () => {
                    //         if (this.presentDeal.tradesDoneQuantity === this.presentDeal.amount) { resolve(true) } else { setTimeout(() => { fn(); }, 100); }
                    //     }
                    //     await fn();
                    // });
                    fills.forEach(item => {
                        this.presentDeal.sellOrderInfo.tradesDoneQuantity += Number(item.qty);
                        this.presentDeal.sellOrderInfo.tradesDoneAmount += Number(item.qty) * Number(item.price);
                        this.presentDeal.sellOrderInfo.commission += Number(item.commission);
                    });

                    this.presentDeal.payPrice = this.presentDeal.sellOrderInfo.tradesDoneAmount / this.presentDeal.sellOrderInfo.tradesDoneQuantity;//实际交易均价
                    const costingBuy = this.presentDeal.costing;//因为要重设costing，这里先缓存一下
                    this.presentDeal.amount = 0;//实际交易数量
                    this.presentDeal.costing = this.presentDeal.sellOrderInfo.tradesDoneAmount * (1 - this.parameter.serviceCharge);//回本，这里是实际到账，手续费通过BNB另外扣了，所以还是要加手续费
                    this.addHistory('sell', {
                        symbol: this.symbol,
                        dealAmount: this.presentDeal.sellOrderInfo.tradesDoneQuantity,
                        orderInfo: this.presentDeal.sellOrderInfo,
                        inCosting: costingBuy,
                        costing: costingBuy,
                        outCosting: this.presentDeal.costing,
                        profit: this.presentDeal.costing - costingBuy,//卖出回本减去买入的成本，为什么不用getProfit，因为getProfit是理论利润
                        price: this.presentDeal.payPrice
                    }, false, { color: 'green' });
                    this.profitSymbol.push({ symbol: this.symbol, profit: this.presentDeal.costing - costingBuy });
                } catch (e) {
                    console.error(e);
                }
            }
            this.loadUpBuyHelper.nextRound();
            //if (this.nextSymbol) this.symbol = this.nextSymbol;//出场成功之后切换币
        }
        this.resetParam();//重置参数
        this.riseTimer && clearTimeout(this.riseTimer);
        return true;
    }
    /**根据步长取小数 */
    getDecimalsForCount(quantity) {
        const stepSize = +this.symbolInfo.filters.find(item => item.filterType === 'LOT_SIZE').stepSize;
        let sizeStep = 0;
        while (stepSize * Math.pow(10, sizeStep) < 1) { sizeStep++; }
        return +quantity.toFixed(sizeStep);
    }
    /**重置基本参数 */
    resetParam(key) {
        if (key) {
            this.parameter[key] = this.parameterBackup[key];
        } else {
            this.parameter = Object.assign({}, this.parameterBackup);
        }
    }
    /**获取波动速度列表，level是取最近的变更值深度，越深越准，值必须大于等于1，小于等于20 */
    getWaveSpeedList(level) {
        if (this.presentSpeedArr.length <= 1) return [];
        const arr = [...this.presentSpeedArr].splice(this.presentSpeedArr.length - level + 2);
        let speedArr = [];
        for (let i = 0, l = arr.length; i < l; i++) {
            if (i !== 0) {
                speedArr.push((arr[i] - arr[i - 1]));
            }
        }
        return speedArr;
    };
    getInfo() {
        let result = {};
        ['id',
            'uid',
            'name',
            'symbol',
            'parameter',
            'parameterDesc',
            'presentDeal',
            // 'history',
            'historyForDeal',
            'checkBuyTime',
            'runState',
            'buyState',
            'imitateRun',
            'profitSymbol',
            'KLineItem1m',
            'KLineItem5m',
            'presentTrade',
            'advancedOption',
            'depth',
            'ticker'].forEach(item => result[item] = this[item]);
        result['loadUpBuyHelper'] = this.loadUpBuyHelper.getInfo();
        return result;
    }
    getDBInfo() {

        let result = {};
        ['id',
            'uid',
            'name',
            'symbol',
            'parameter',
            'presentDeal',
            'history',
            'historyForDeal',
            'checkBuyTime',
            'runState',
            'buyState',
            'imitateRun',
            'profitSymbol',
            'advancedOption'].forEach(item => result[item] = this[item]);
        result['loadUpBuyHelper'] = JSON.stringify(this.loadUpBuyHelper.getInfo());
        return result;
    }
    getSimplyInfo() {
        let result = {};
        ['id',
            'uid',
            'name',
            'symbol',
            'runState',
            'parameter',
            'imitateRun',
            'historyForDeal',
            'presentDeal',
            'buyState'].forEach(item => result[item] = this[item]);
        return result;
    }

}