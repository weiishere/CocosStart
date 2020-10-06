/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:50:17
 * @LastEditTime: 2020-10-05 03:34:59
 * @LastEditors: weishere.huang
 * @Description: 追涨杀跌对象
 * @~~
 */

const Tactics = require('./Tactics');
const restrainGroup = require('./restrainGroup');
const { client } = require('../lib/binancer');
const { scoketCandles } = require('./binanceScoketBind');
const LoadUpBuyHelper = require('./LoadUpBuyHelper')
const TacticesHelper = require('./TacticesHelper')
const { BuyDeal, SellDeal } = require('./Exchange');
const { mailTo } = require('../tool/sendEmail')

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
        this.KLineItem1m = {}
        this.nextSymbol = [];
        //盈利/亏损的交易对
        this.profitSymbol = [
            // { symbol: 'ETHUSDT', inCosting }
        ];
        this.roundId = this.getNewId('r_');//Date.parse(new Date());//交易回合
        this.roundRunStartTime = 0;
        this.history = []
        this.depth = null;//深度
        this.ticker = null;
        //this.avSpeed = [];//平均速度
        this.averageWave = 0;//平均波动
        //关于交易的一些历史记录（用于BS线）
        this.historyForDeal = [];
        this.checkBuyTime = 0;
        this.checkSymbolTime = 30;//寻币且默认入场检测的次数（之后若不停机，还是继续寻币，但还做不做入场检测，还有开关keepBuyFaildChangeSymbol）
        this.parameterBackup = this.parameter = Object.assign({
            usdtAmount: 25,//每次入场数量（USDT）
            serviceCharge: 0.00075,//币安手续费(千一)
            serviceChargeDiscounts: 0.15,//优惠费率(返费，暂不考虑))
            checkBuyRate: 7000,//入场时间检查速率
            riseStayCheckRateForBuy: 8000,//未入场及上涨情况下，判断间隔等待时间
            riseBuyRange: 0.001,//上涨情况下，入场的上涨幅度
            autoSymbol: true,//自动切币
            //autoRun: false,
            ambushRange: 0.001,//需进行埋伏操作的下跌率
            /** 出场检测速率*/
            checkSellRate: 5000,
            riseStayCheckRateForSell: 15000,//止损等待时间
            stopRiseRate: 0.2,//强制止盈涨幅
            lowestRiseRate: 0.008,//最低盈利，少了这个值不止盈
            riseStopLossRate: 50,//上涨情况（盈利）下跌止盈点（拐点止盈）
            //lossStopLossRate: 0,//下跌情况（亏损）上涨止损点
            //isLiveRiseStopLossRate: true,
            stopLossRate: 0.1,//下跌情况（亏损）下跌止损点
            maxStayTime: 0,//24 * 60,//亏损但未达到止损值的情况下，最久呆的时间(分钟)
            faildBuyTimeForChange: 20,//进场失败次数，用于切币
            isAllowLoadUpBuy: true,//是否允许加仓
            pauseFaildChangeSymbol: false,//若需切币且推荐币为空，是否停止
            keepBuyFaildChangeSymbol: true,//若需切币且推荐币为空且不停机，在寻币同时是否还做入场检测
            //symbolDriveMod: false,//选币驱动模式
        }, parameter || {});

        //基于基本逻辑下的高级约束(入场约束，出场约束，动态参数，选币方案)
        this.advancedOption = {
            premiseForBase: [],
            premiseForBuy: ['bollStandardUP', 'last10mNoFastRise'],
            premiseForSell: ['fastRise', 'hasLoadUpNoSell'],
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
            faildBuyTimeForChange: [false, "未盈利情况下需切币的进场失败次数(<100)，若“自动切币”功能打开，超过100次会强制切币"],
            //symbolDriveMod: [false, "选币驱动模式，会保持选币一直运行，如果有新币产生，即尽快出场(盈利或亏损在0.5个点内)并切币进入，打开此开关需保证有及其严格的选币方案"],
            isAllowLoadUpBuy: [false, "是否允许加仓"],
            pauseFaildChangeSymbol: [false, "切币但无币是否停机。(打开此项，进场失败次数达到n次且切币10次为空则会停机)"],
            keepBuyFaildChangeSymbol: [false, "在待机无限寻币的同时，在寻币同时是否还做入场检测（若”切币但无币是否停机“配置打开，此项无效）"],
        };
        this.presentPrice = 0;//当前价格
        //当前的交易信息
        this.presentDeal = {
            inCosting: 0,//入场成本,
            outCosting: 0,//回收成本,
            dealPrice: 0,//买入价格
            winPrice: 0,//扭亏价格
            amount: 0,//购买后持有的相应代币数量
            rtProfit: undefined,//当前盈利
            historyProfit: 0,//当前交易的历史盈利
            //下面的基本没啥用，考虑去掉
            buyOrderInfo: null,
            sellOrderInfo: null,
            orderId: '',//当前交易的orderId，可能是买，也可能是卖
            tradeRole: 'buyer',//'seller',当前的交易角色，用于
        }
        this.strategy = {}
        this.exchangeQueue = [];//本轮已经完成的交易队列
        //加仓对象
        this.loadUpBuyHelper = new LoadUpBuyHelper(this);
        this.tacticesHelper = new TacticesHelper(this);
    }
    /**初始化，启动的时候调用 */
    async initialize(symbol) {
        //if (this.runState) return false;//运行期间不允许更改
        this.symbol = symbol;
        this.symbolInfo = await require('./TacticesLauncher').getInstance().getExchangeInfo(this.symbol);
        //初始化时给点5/1分线数据
        //client.candles({ symbol, interval: '5m', limit: 1 }).then(data => this.KLineItem5m.present = data[0]);
        try {
            await this.tacticesHelper.getPresentPrice(true);//获取最新价格
            this.KLineItem5m.present = (await client.candles({ symbol, interval: '5m', limit: 1 }))[0];
            this.KLineItem5m.present && (this.KLineItem5m.present['startTime'] = this.KLineItem5m.present['openTime']);//坑爹玩意儿，字段不一样，必须重新赋个字段
            this.KLineItem1m = (await client.candles({ symbol, interval: '1m', limit: 1 }))[0];
            this.KLineItem1m && (this.KLineItem1m['startTime'] = this.KLineItem1m['openTime']);//坑爹玩意儿，字段不一样，必须重新赋个字段
            // const speed = this.tacticesHelper.getWaveSpeedList(21);
            // this.avSpeed.push(speed.reduce((pre, cur) => Math.abs(pre) + Math.abs(cur), 0) / (speed.length || 1));
            this.averageWave = this.tacticesHelper.getAverageWave();
            this.loadUpBuyHelper.setStepGrids();
            if (this.strategy.id) {
                this.tacticesHelper.setStrategy();
            }
        } catch (e) {
            console.log(e);
        }
        scoketCandles();
    }
    /**添加历史记录:isDouble：如果重复两条记录，是否允许重复添加
     * @type:info/profitChange
     * @content
     * @isDouble
     */
    addHistory(type, content, isDouble, option) {
        const lastItem = () => this.history[this.history.length - 1];
        if (isDouble && this.history.length !== 0 && lastItem().type === type && lastItem().content === content) {
            this.historyDoubleCount++;
            lastItem().time = Date.parse(new Date());
            require('./TacticesLauncher').getInstance().pushHistory(this.uid, this.id, {
                history: this.history,
                historyForDeal: this.historyForDeal
            });
            return;
        }
        const theOption = Object.assign({
            color: '#999',
            iconType: '',
            subType: '',
            tempMsg: false,
            isMap: (type === 'info' ? false : true)
        }, option || {});
        if (this.history.length > 0 && lastItem().tempMsg && lastItem().subType === theOption.subType) this.history.pop();
        type !== 'profitChange' && this.history.push({
            type: type,//order、info、buy、sell
            time: Date.parse(new Date()),
            content: content,//`实例已${(this.runState ? "运行" : "停止")}${this.imitateRun ? "模拟" : ""}`
            color: theOption.color,
            subType: theOption.subType,
            tempMsg: theOption.tempMsg
        })
        if (type === 'buy' || type === 'sell') {
            this.historyForDeal.push({ ...lastItem(), symbol: this.symbol });
        } else if (type === 'profitChange') {
            let hfdItem = this.historyForDeal[this.historyForDeal.length - 1];
            if (hfdItem) {
                hfdItem['symbol'] = this.symbol;
                hfdItem['changeTime'] = Date.parse(new Date());
                hfdItem.content.profit = content;
            }
        }
        if (theOption.isMap) {
            require('./TacticesLauncher').getInstance().mapTotacticsList(this.uid, this.id, (type === 'profitChange' ? false : true));
        }
        require('./TacticesLauncher').getInstance().pushHistory(this.uid, this.id, {
            history: this.history,
            historyForDeal: this.historyForDeal
        });
        //if (this.presentSymbleId === this.id) _tacticesLauncher.mapTotacticsList(this.uid, _tacticesLauncher.presentSymbleId, true);
    }
    /**寻找新币，返回待选列表，和当前用户下的实例中，此实例用到的交易对（可能排名前面的正在使用中） */
    async findSymbol() {
        let symbolList = require('./TacticesLauncher').getInstance().allTicker.map(({ symbol, priceChangePercent, high, low, volume, volumeQuote, totalTrades, curDayClose }) => ({
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
        let chooseItem = '';
        if (symbols.length !== 0) {
            const tacticsList = require('./TacticesLauncher').getInstance().tacticsList;
            for (let i = 0; i < symbols.length; i++) {
                if (tacticsList.some(item => (item.symbol === symbols[i].symbol && item.id !== this.id))) {
                    continue;
                } else {
                    chooseItem = symbols[i].symbol;
                    break;
                }
            }
        }
        require('./TacticesLauncher').getInstance().pushBetterSymbol(this.uid, this.id, symbols);
        return { symbols, chooseItem };
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
                    this.loadUpBuyHelper.setStepGrids();
                    this.initialize(chooseItem);
                    this.checkSymbolTime = 10;
                    this.checkBuyTime = 0;
                } else {
                    //无币
                    if (this.checkSymbolTime === 0) {
                        if (this.parameter.pauseFaildChangeSymbol) {
                            this.addHistory('info', `未搜寻到新币（10次），实例即将停止...`, true);
                            return false;
                        } else {
                            if (this.parameter.keepBuyFaildChangeSymbol) {
                                this.addHistory('info', `未搜寻到新币，开始待机无限制切币搜寻(保持入场监测)...`, true);
                            } else {
                                this.addHistory('info', `未搜寻到新币，开始待机无限制切币搜寻(不再做入场监测)...`, true);
                                return undefined;
                            }
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
        if (this.advancedOption.premiseForBase.indexOf('symbolDriveMod') !== -1) {
            this.checkBuyTime++;//用于切币驱动，免于刚刚入场就开始
            return true;
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
        this.tacticesHelper.resetParam();//重置参数
        this.addHistory('order', `实例将${(this.runState ? "开始运行" : "停止")}${this.imitateRun ? "模拟程序" : ""}`, true, { isMap: true, color: '#04ce55' });
        if (this.runState) {
            //开始运行
            let fn = async () => {
                clearTimeout(this.mainTimer);
                const checkRate = this.buyState ? this.parameter.checkSellRate : this.parameter.checkBuyRate;
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
                if (allowResult || this.buyState) {
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
                }, checkRate);
            }
            await fn();
        } else {
            //停止
            //this.stop();
        }

    }
    /**暂停 */
    powerPause() {
        if (this.mainTimer) clearTimeout(this.mainTimer);
        this.addHistory('order', `实例${this.name}已经发送暂停指令(执行完最后的逻辑)...`, false, { isMap: true, color: '#04ce55' });
        if (this.buyState) {
            this.addHistory('info', `【注意】实例处于买入状态，暂停期间将不进行出场判定...`, false);
        }
        this.runState = false;
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
        let chooseResult = await this.checkChangeSymbol();//切币检测
        // if (this.advancedOption.premiseForBase.indexOf('symbolDriveMod') === -1) {
        //     chooseResult = await this.checkChangeSymbol();//切币检测
        // } else {
        //     //在选币驱动模式下，就不用再做选币等待了，直接走
        //     chooseResult = true;
        // }
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
                const tempPrice = await this.tacticesHelper.getPresentPrice();
                //console.log(Number(tempPrice) === this.presentPrice ? '价格一致' : '不一致'); console.log(tempPrice + "--" + this.presentPrice);
                this.addHistory('info', `最近5分线上涨幅度${_riseBuyRange}，超过${this.parameter.riseBuyRange}，获取当前价格${Number(tempPrice)}，等待${this.parameter.riseStayCheckRateForBuy / 1000}s后价格...`);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        const price = await this.tacticesHelper.getPresentPrice();
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
        const _profit = this.presentDeal.rtProfit = this.getProfit();
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
        };
        //this.profitSymbol[this.profitSymbol.length - 1] = { symbol: this.symbol, profit: _profit };
        this.addHistory('profitChange', _profit);
        if (_profit >= 0) {
            this.riseTimer && clearTimeout(this.riseTimer);//清除超时timer
            if (this.parameter.stopRiseRate !== 0 && _profit / this.presentDeal.inCosting > this.parameter.stopRiseRate) {
                //盈利止盈点
                this.addHistory('info', `盈利：${_profit / this.presentDeal.inCosting}，已大于最高止盈点：${this.parameter.stopRiseRate}，准备卖出...`);
                return (await this.deal('sell'));
            }
            //如果盈利为正
            if (_profit > this.presentDeal.historyProfit) {
                //利润大于上一次统计的利润，持续盈利中...
                this.addHistory('info', `记录到更高盈利：${_profit}U，盈利率：${_profit / this.presentDeal.inCosting}`, true, { color: '#ddbfbe', tempMsg: true, subType: 'lub' });
                this.presentDeal.historyProfit = _profit;//存储最高利润
                return false;
            } else {
                //利润下降（出现拐点）判断亏损率
                const diff = this.presentDeal.historyProfit - _profit;//相比上次降低的利润
                const _riseStopLossRate = (diff / this.presentDeal.historyProfit) * 100;

                if (_riseStopLossRate > this.parameter.riseStopLossRate) {
                    this.addHistory('info', `盈利下降，且大于止盈拐点，剩余盈利率：` + _profit / this.presentDeal.inCosting, true);
                    //亏损率大于一个值,判断当前盈利率，选择是否止盈
                    if (_profit / this.presentDeal.inCosting < this.parameter.lowestRiseRate) {
                        //盈利率小于某一个值的话，就不予止盈，否则没太大意义（避免某一下的急跌造成割肉，却没赚到什么）
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(2)}%，大于${this.parameter.riseStopLossRate}%，但低于最低出场盈利率${this.parameter.lowestRiseRate}，继续观察...`, true);
                        return false;
                    } else {
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(2)}%，大于${this.parameter.riseStopLossRate}%，且高于最低出场盈利率${this.parameter.lowestRiseRate}，进行止盈操作！`);
                        //再次确认深度价是否也符合
                        if (((this.presentDeal.historyProfit - this.getProfit(this.presentDeal.amount, true)) / this.presentDeal.historyProfit) * 100 > this.parameter.riseStopLossRate) {
                            return (await this.deal('sell'));
                        } else {
                            this.addHistory('info', `取深度数据取得的成交均价不符合盈利要求，中止止盈，继续观察盈利情况...`, true, { subType: 'impt_1', color: '#0f0' });
                        }
                    }
                } else {
                    if (_riseStopLossRate === 0) return false;
                    //亏损率还未大于一个值，持续观察
                    this.addHistory('info', `盈利下降量${Number(_riseStopLossRate.toFixed(2))}%，未达止盈拐点，继续观察盈利情况...`, true);
                    return false;
                }
            }
        } else {
            //盈利为负（亏损）
            //获取亏损率
            //this.presentDeal.historyProfit = _profit;//重置最高盈利(考虑先盈利很高，突然暴跌后，重新拉回来，但没有冲破最高盈利，一直无法出场)
            const _stopLossRate = Math.abs(Number(this.getProfit() / this.presentDeal.inCosting));
            if (!this.riseTimer && this.parameter.maxStayTime !== 0) {
                this.riseTimer = setTimeout(async () => {
                    this.addHistory('info', `亏损状态时间超时，进行止损操作`);
                    await this.deal('sell')
                    tactics.buyState = false;
                }, this.parameter.maxStayTime * 60000);
            }
            if (_profit < this.presentDeal.historyProfit) {
                //亏损大于上一次统计的亏损，持续亏损中...
                this.addHistory('info', `记录到更高亏损：${_profit}U，亏损率：${_stopLossRate}`, true, { color: '#4abf69', tempMsg: true, subType: 'lub' });
                this.presentDeal.historyProfit = _profit;//存储最高亏损
            }
            //如果减仓模式打开，就不确认出场了
            if (_stopLossRate >= this.parameter.stopLossRate && !this.loadUpBuyHelper.lightenMod) {
                //止损流程
                //再观察一定时间，看是否涨回去
                this.addHistory('info', `当前处于亏损状态,亏损率：${_stopLossRate.toFixed(6)}，超过${this.parameter.stopLossRate}，${this.parameter.riseStayCheckRateForSell}ms后进行下一步判断是否止损...`, true);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        //再次观察亏损
                        const _profit = this.getProfit();
                        const _stopLossRate2 = Math.abs(Number(_profit / this.presentDeal.inCosting));
                        if (_profit > 0) {
                            this.addHistory('info', `扭亏为盈，继续等待出场时机...`);
                            this.presentDeal.historyProfit = _profit;
                            resolve(false);
                        } else {
                            if (_stopLossRate2 >= this.parameter.stopLossRate) {
                                this.riseTimer && clearTimeout(this.riseTimer);
                                //仍然大于止损值，割肉
                                //this.addHistory('info', `二次判断，继续亏损,亏损率：${_stopLossRate2.toFixed(6)}，仍然超过${this.parameter.stopLossRate}，进行止损操作`);
                                //resolve(await this.deal('sell'));

                                //这里暂时不止损了，改为变成减仓模式
                                this.addHistory('info', `二次判断，继续亏损,亏损率：${_stopLossRate2.toFixed(6)}，仍然超过${this.parameter.stopLossRate}，进入减仓模式`, { color: '#cc00ff' });
                                this.loadUpBuyHelper.lightenMod = true;//打开减仓模式
                                const elapsedTime = (Date.parse(new Date()) - this.roundRunStartTime) / 60000
                                mailTo({
                                    content:
                                        `<p>投入成本：${this.presentDeal.inCosting}</p>
                                        <p>已耗时：${parseInt(elapsedTime / 60)}时${parseInt(elapsedTime % 60)}分</p>
                                        <p>当前任务盈亏：${this.historyStatistics.totalProfit + this.presentDeal.rtProfit}</p>`,
                                    subject: `【提醒】任务${this.name}(${this.symbol})跌破止损值`
                                });
                                resolve(false);
                            } else {
                                //说明在回涨，观察
                                this.addHistory('info', `二次判断，亏损降低，亏损率：${_stopLossRate2.toFixed(6)}，低于止损点${this.parameter.stopLossRate}，继续等待出场时机...`, true);
                                resolve(false)
                            }
                        }
                    }, this.parameter.riseStayCheckRateForSell);
                });
            } else {
                //持续观察
                if (this.loadUpBuyHelper.lightenMod) {
                    this.addHistory('info', `当前处于亏损状态，亏损率：${_stopLossRate.toFixed(6)}，已超过止损点，等待减仓时机...`, true, { tempMsg: true, subType: 'lub' });
                } else {
                    this.addHistory('info', `当前处于亏损状态，亏损率：${_stopLossRate.toFixed(6)}，但未达止损点，继续等待出场时机...`, true, { tempMsg: true, subType: 'lub' });
                }

                //加仓
                this.parameter.isAllowLoadUpBuy && await this.loadUpBuyHelper.run(this.roundId);
                return false;
            }
        }
    }
    /**理论利润，用于即时计算利润（通过深度图），即若按照当前价格卖掉，获得的回报减去成本价 */
    getProfit(amount, istheoryPrice) {
        let _amount = amount || this.presentDeal.amount;
        if (istheoryPrice) return Number(_amount * this.tacticesHelper.getTheoryPrice(_amount).avePrive * (1 - this.parameter.serviceCharge) + this.presentDeal.outCosting - this.presentDeal.inCosting);
        //return Number(_amount * this.presentPrice * (1 - this.parameter.serviceCharge) - this.presentDeal.inCosting);
        return Number(_amount * this.presentPrice * (1 - this.parameter.serviceCharge) + this.presentDeal.outCosting - this.presentDeal.inCosting);
    }
    /**第二个参数dealQuantity用于补仓和减仓 */
    async deal(order, dealQuantity) {

        const price = this.presentPrice = await this.tacticesHelper.getPresentPrice(true);
        this.checkSymbolTime = 10;
        this.checkBuyTime = 0;
        if (order === 'buy') {
            if (!dealQuantity) {
                this.presentDeal = {
                    inCosting: 0, outCosting: 0, dealPrice: 0, winPrice: 0, amount: 0, rtProfit: undefined, historyProfit: 0,
                }
            }
            this.checkSymbolTime = 10;
            const quantity = dealQuantity || this.parameter.usdtAmount / price;
            this.addHistory('info', `将进行市价买入，预计买入${quantity}枚${this.symbol}，预估价格：${price}，投入${quantity * price}U`);
            const buyDeal = new BuyDeal(this.symbol, this.id, this.roundId, this.imitateRun, price, quantity);
            await buyDeal.deal(this.parameter.serviceCharge);
            this.presentDeal = Object.assign(this.presentDeal,
                {
                    dealPrice: buyDeal.dealPrice,//买入价,暂时等于市价
                    inCosting: dealQuantity ? this.presentDeal.inCosting + buyDeal.costing : buyDeal.costing,//考虑补仓的时候buyState=true
                    amount: this.presentDeal.amount + buyDeal.dealQuantity
                });
            this.presentDeal.historyProfit = this.getProfit();//当前交易的历史盈利，每买入一次，需要重置
            this.presentDeal.winPrice = this.presentDeal.amount === 0 ? 0 : (this.presentDeal.inCosting - this.presentDeal.outCosting) / this.presentDeal.amount;
            buyDeal.dealThenInfo = Object.assign({}, this.presentDeal);
            buyDeal.signStr = dealQuantity ? '补仓' : '入场';
            await buyDeal.saveToDB(this);

            this.exchangeQueue.push(buyDeal);
            this.addHistory('buy', {
                symbol: this.symbol,
                signStr: buyDeal.signStr,
                dealAmount: buyDeal.dealQuantity,
                profit: this.getProfit(),
                winPrice: this.presentDeal.winPrice,
                price: buyDeal.dealPrice,
                costing: this.presentDeal.inCosting
            }, false, { color: 'red' });
            if (!dealQuantity) {
                await this.tacticesHelper.roundBegin();
            }

        } else if (order === 'sell') {
            const quantity = dealQuantity || this.presentDeal.amount;//需要回收的U数量
            this.addHistory('info', `将进行市价卖出，预计卖出${quantity}枚${this.symbol}，预估价格：${price}，回收${quantity * price}U`);
            const sellDeal = new SellDeal(this.symbol, this.id, this.roundId, this.imitateRun, price, quantity);
            await sellDeal.deal(this.parameter.serviceCharge);
            this.presentDeal = Object.assign(this.presentDeal,
                {
                    dealPrice: sellDeal.dealPrice,//买入价,暂时等于市价
                    //outCosting: dealQuantity ? this.presentDeal.outCosting + sellDeal.costing : sellDeal.costing,//考虑补仓的时候buyState=true\
                    outCosting: this.presentDeal.outCosting + sellDeal.costing,
                    amount: this.presentDeal.amount - sellDeal.dealQuantity,
                });
            this.presentDeal.historyProfit = this.getProfit();//当前交易的历史盈利，每卖出一次，需要重置
            this.presentDeal.winPrice = this.presentDeal.amount === 0 ? 0 : (this.presentDeal.inCosting - this.presentDeal.outCosting) / this.presentDeal.amount;
            //await sellDeal.saveToDB({ uid: this.uid, tid: this.id, roundId: this.roundId });
            sellDeal.dealThenInfo = Object.assign({}, this.presentDeal);
            sellDeal.signStr = dealQuantity ? '减仓' : '出场';
            await sellDeal.saveToDB(this);

            this.exchangeQueue.push(sellDeal);
            this.addHistory('sell', {
                symbol: this.symbol,
                signStr: sellDeal.signStr,
                dealAmount: sellDeal.dealQuantity,
                price: sellDeal.dealPrice,
                winPrice: this.presentDeal.winPrice,
                profit: dealQuantity ? 0 : this.getProfit(),
                costing: this.presentDeal.outCosting
            }, false, { color: 'green' });

            if (!dealQuantity) {
                await this.tacticesHelper.roundEnd();
            } else {

            }
        }
        require('./TacticesLauncher').getInstance().pushExchange(this.uid, this.id, this.symbol, this.exchangeQueue);
        this.tacticesHelper.resetParam();//重置参数
        this.riseTimer && clearTimeout(this.riseTimer);//清除超时timer
        return true;
    }

    getInfo() {
        let result = {};
        ['id',
            'uid',
            'name',
            'symbol',
            'parameter',
            'parameterDesc',
            'presentDeal',
            'roundId',
            'averageWave',
            'historyForDeal',
            //'exchangeQueue',
            'roundRunStartTime',
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
            'presentPrice',
            'historyStatistics',
            'strategy',
            'ticker'].forEach(item => result[item] = this[item]);
        result['loadUpBuyHelper'] = this.loadUpBuyHelper.getInfo();
        // result['exchangeQueue'] = this.exchangeQueue.map(item => ({
        //     roundId: item.roundId,
        //     dealType: item.dealType,
        //     dealDate: item.dealDate,
        //     symbol: item.symbol,
        //     dealPrice: item.dealPrice
        // }));
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
            'roundId',
            'history',
            //'historyForDeal',
            'roundRunStartTime',
            'checkBuyTime',
            'runState',
            'buyState',
            'imitateRun',
            'profitSymbol',
            'parameterBackup',
            'historyStatistics',
            'strategy',
            'presentPrice',//缓存到数据库，免得服务重启，这里是0，s导致瞬间出场
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
            //'historyForDeal',
            'roundRunStartTime',
            'historyStatistics',
            'presentDeal',
            'roundId',
            'strategy',
            'buyState'].forEach(item => result[item] = this[item]);
        result['loadUpBuyHelper'] = this.loadUpBuyHelper.getInfo();
        return result;
    }
}