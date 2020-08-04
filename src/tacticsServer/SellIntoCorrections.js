/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:50:17
 * @LastEditTime: 2020-08-04 18:43:51
 * @LastEditors: weishere.huang
 * @Description: 追涨杀跌对象
 * @~~
 */

const Tactics = require('./Tactics');
const tool = require('./tool');



module.exports = class SellIntoCorrections extends Tactics {
    constructor(name, parameter) {
        super(name, parameter);
        this.runState = false;//运行状态  false:stop,true:run
        this.imitateRun = false;//是否是模拟状态
        this.buyState = false;//购买状态  true:in,false:out
        this.symbol = '';//当前交易对
        this.KLineItem5m = {
            recent: null,//最近的完整K线
            present: null//当前正在运行的k线
        }
        this.USDTPrice = 0;
        //this.KLineItem1m = {}
        // this.KLineItem5mForRecent = null;
        // this.KLineItem5mForPresent = null;
        this.nextSymbol = '';
        //盈利/亏损的交易对
        this.profitSymbol = [
            // { symbol: 'ETHUSDT', profit: 15.2, buyCount: 2 },
            // { symbol: 'BTCUSDT', profit: 1, buyCount: 2 },
            // { symbol: 'ADAUSDT', profit: 2, buyCount: 3 },
            // { symbol: 'FNUSDT', profit: -3.2, buyCount: 1 }
        ];
        this.history = []
        //关于交易的一些历史记录（用于BS线）
        this.historyForDeal = [];
        this.parameter = Object.assign({
            usdtAmount: 10 * 0.99,//每次入场数量（USDT）,考虑到每次入场可能不会整卖
            serviceCharge: 0.00075,//币安手续费(千一)
            serviceChargeDiscounts: 0.25,//优惠费率(实付费用(1-0.25))
            checkBuyRate: 15000,//入场时间检查速率
            riseStayCheckRateForBuy: 15000,//未入场及上涨情况下，5分线判断间隔等待时间
            riseBuyRange: 0.0005,//上涨情况下，入场的上涨幅度
            ambushRange: 0.001,//需进行埋伏操作的下跌率
            /** 出场检测速率*/
            checkSellRate: 10000,
            riseStayCheckRateForSell: 8000,//未出场及上涨情况下，5分线判断间隔等待时间
            riseStopLossRate: 0.01,//上涨情况（盈利）下跌止损点
            lossStopLossRate: 0.05,//下跌情况（亏损）下跌止损点
        }, parameter || {});

        //参数的说明，也表示需要进行界面设定的参数
        this.parameterDesc = {
            usdtAmount: "每次入场USDT数量",
            //serviceCharge: "币安手续费(千一)",
            //serviceChargeDiscounts: "优惠费率(实付费用(1-0.25))",
            checkBuyRate: "买入检查频率",
            riseStayCheckRateForBuy: "买入确认频率",
            riseBuyRange: "确认买入涨幅",
            ambushRange: "埋伏入场下跌率",

            checkSellRate: "卖出检查频率",
            riseStayCheckRateForSell: "卖出确认频率",
            riseStopLossRate: "止盈跌幅",
            lossStopLossRate: "止损跌幅"
        };
        //当前的交易信息
        this.presentDeal = {
            presentPrice: 0,//当前价格
            payPrice: 0,//买入价格
            costCredit: 0,//利润
            amount: 0,//购买后持有的相应代币数量
            historyProfit: 0,//当前交易的历史盈利
        }
    }
    /**添加历史记录，isDouble：如果重复两条记录，是否允许重复添加 */
    addHistory(type, content, isDouble) {
        if (isDouble && this.history.length !== 0 && this.history[this.history.length - 1].type === type && this.history[this.history.length - 1].content === content) {
            this.history[this.history.length - 1].time = Date.parse(new Date());
            return;
        }
        this.history.push({
            type: type,//order、info、buy、sell
            time: Date.parse(new Date()),
            content: content//`实例已${(this.runState ? "运行" : "停止")}${this.imitateRun ? "模拟" : ""}`
        })
        if (type === 'buy' || type === 'sell') {
            this.historyForDeal.push({ ...this.history[this.history.length - 1] });
        }
        const _tacticesCommand = require('./TacticesCommand').getInstance();
        _tacticesCommand.mapTotacticsList(_tacticesCommand.presentSymbleId, true);
    }
    changeSymbol(symbol) {
        this.nextSymbol = symbol;
    }
    powerSwitch(order) {
        this.runState = order === undefined ? !this.runState : order;
        this.addHistory('order', `实例将${(this.runState ? "开始运行" : "停止")}${this.imitateRun ? "模拟程序" : ""}`);
        if (this.runState) {
            //开始运行
            let fn = async () => {
                clearTimeout(this.timer);
                if (!this.buyState) {
                    //入场判断
                    this.buyState = await this.buy();
                } else {
                    //出场判断
                    const r = await this.sell();
                    this.buyState = !r;
                }
                this.timer = setTimeout(() => { this.runState && fn(); }, this.buyState ? this.parameter.checkSellRate : this.parameter.checkBuyRate);
            }
            fn();
        } else {
            //停止
            // if (this.buyState) {
            //     //直接卖出
            // }
            this.stop();
        }

    }
    remove(deleteFn) {
        if (this.runState) this.stop();
        deleteFn(this);
        this.addHistory('info', `实例${this.symbol}已经删除...`);
    }
    stop() {
        this.runState = false;
        this.timer && clearInterval(this.timer);
        if (this.buyState) {
            this.deal('sell');
            this.buyState = false;
        }
        this.addHistory('info', `实例${this.symbol}已经停止...`);
    }
    async buyTest() {
        this.addHistory('info', `等待买入`);
        return await new Promise((resolve) => {
            setTimeout(async () => {
                this.addHistory('info', `买入成功`);
                resolve(true);
            }, 5000);
        })
    }
    async sellTest() {
        this.addHistory('info', `等待卖出`);
        return false;
        // return await new Promise((resolve) => {
        //     setTimeout(async () => {
        //         this.addHistory('info', `卖出成功`);
        //         resolve(true);
        //     }, 5000);
        // })
    }
    async buy() {
        //分析5分线
        //const increaseRate = tool.getIncreasePriceRate(this.symbol, Date.parse(new Date()), '5m');
        //5分线显示上涨
        // if (!this.KLineItem5m.recent || !this.KLineItem5m.present) {
        //     this.addHistory('info', `获取最近5分线数据...`, true);
        //     return false;
        // }
        if (!this.KLineItem5m.present) {
            this.addHistory('info', `获取最近5分线数据...`, true);
            return false;
        }

        //this.addHistory('info', `获取最近5分线数据成功，判断入场时机...`, true);
        //如果当前的收盘价减去上一条五分线的开盘价是上涨且判断涨幅
        //if (this.KLineItem5m.present.close - this.KLineItem5m.recent.open > 0) {
        if (this.KLineItem5m.present.close - (this.KLineItem5m.recent ? this.KLineItem5m.recent.open : this.KLineItem5m.present.open) > 0) {
            if (Math.abs(this.KLineItem5m.present.close - this.KLineItem5m.present.open) / this.KLineItem5m.present.open > this.parameter.riseBuyRange) {
                //记录当前价格
                this.tempPrice = await tool.getPresentPrice(this.symbol);
                this.addHistory('info', `5分线上涨幅度超过${this.parameter.riseBuyRange}，获取当前价格${this.tempPrice}，等待15s后价格...`);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        const price = await tool.getPresentPrice(this.symbol);
                        const result = price - this.tempPrice >= 0 ? true : false;
                        if (!result) {
                            this.addHistory('info', `15s后差价为${(price - this.tempPrice).toFixed(5)},出现下跌，重新等待入场时机...`);
                            resolve(result);
                        } else {
                            this.deal('buy');
                            resolve(true);
                        }
                    }, this.parameter.riseStayCheckRateForBuy);
                })
            } else {
                this.addHistory('info', `上5分线上涨，却未保持上涨趋势，重新等待入场时机...`, true);
                return false;
            }
        } else {
            this.addHistory('info', `上一个5分线下跌，重新等待入场时机...`, true);
            return false;
        }
    }
    async sell() {
        if (this.nextSymbol) this.symbol = this.nextSymbol;//出场成功之后切换币
        const _profit = this.getProfit();
        if (_profit >= 0) {
            //如果盈利为正
            if (_profit >= this.presentDeal.historyProfit) {
                //利润大于上一次统计的利润，持续盈利中...
                this.addHistory('info', `记录到更高盈利${_profit}`);
                this.presentDeal.historyProfit = _profit;//存储最高利润
                return false;
            } else {
                //利润下降（出现拐点）判断亏损率
                const diff = this.presentDeal.historyProfit - _profit;//相比上次降低的利润
                const _riseStopLossRate = diff / this.presentDeal.historyProfit;
                if (_riseStopLossRate > this.parameter.riseStopLossRate) {
                    //亏损率大于一个值,止盈
                    this.addHistory('info', `相比最大历史盈利，下降${_riseStopLossRate}，大于${this.parameter.riseStopLossRate}，进行止盈操作！`);
                    this.profitSymbol.push({ symbol: this.symbol, profit: _profit });
                    this.deal('sell');
                    return true;
                } else {
                    //亏损率还未大于一个值，持续观察
                    this.addHistory('info', `盈利下降${_riseStopLossRate}，继续观察盈利情况...`);
                    return false;
                }
            }
        } else {
            //盈利为负（亏损）
            //获取亏损率
            const getRiseStopLossRate = () => this.getProfit() / this.parameter.usdtAmount;
            const _riseStopLossRate = Math.abs(getRiseStopLossRate());
            if (_riseStopLossRate >= this.parameter.riseStopLossRate) {
                //再观察一定时间，看是否涨回去
                this.addHistory('info', `当前处于亏损状态-${_riseStopLossRate}，出现亏损超过${this.parameter.riseStopLossRate}，${this.parameter.riseStayCheckRateForSell}ms后进行下一步判断是否止损...`);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        //再次观察亏损
                        const _riseStopLossRate = getRiseStopLossRate();
                        if (_riseStopLossRate > 0) {
                            this.addHistory('info', `扭亏为盈，继续等待出场时机...`);
                            if (this.getProfit() > this.presentDeal.historyProfit) {
                                //可能是爆拉，直接顶破最高盈利历史记录
                                this.presentDeal.historyProfit = this.getProfit();
                            }
                            resolve(false);
                        } else {
                            if (Math.abs(_riseStopLossRate) >= this.parameter.riseStopLossRate) {
                                //仍然大于止损值，割肉
                                this.addHistory('info', `二次判断，继续亏损,${_riseStopLossRate}，仍然超过${this.parameter.riseStopLossRate}，进行止损操作`);
                                this.deal('sell');
                                resolve(true);
                            } else {
                                //说明在回涨，观察
                                this.addHistory('info', `二次判断，亏损降低，为${_riseStopLossRate}，低于止损点${this.parameter.riseStopLossRate}，继续等待出场时机...`);
                                resolve(false);
                            }
                        }
                    }, this.parameter.riseStayCheckRateForSell);
                });
            } else {
                //持续观察
                this.addHistory('info', `当前处于亏损状态，亏损率${_riseStopLossRate}，但未达止损点，继续等待出场时机...`);
                return false;
            }
        }
        //console.log(price + '---' + this.presentDeal.presentPrice)
        // this.addHistory('info', `暂时标定不卖出，继续...`);
        // return false;
    }
    /**利润,即若按照当前价格卖掉，获得的回报减去成本价(购买数量*当前价格)*(1-费率)-成本 */
    getProfit() {
        return this.presentDeal.amount * this.presentDeal.presentPrice * (1 - this.parameter.serviceCharge) - this.parameter.usdtAmount;
    }
    async deal(order) {
        const price = this.presentDeal.presentPrice;
        if (order === 'buy') {
            if (this.imitateRun) {
                this.presentDeal = Object.assign(this.presentDeal,
                    {
                        payPrice: price,//买入价
                        amount: (this.parameter.usdtAmount / price) * (1 - this.parameter.serviceCharge),
                        historyProfit: 0,//当前交易的历史盈利
                    });
                this.addHistory('buy', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount,
                    orderId: 0,
                    price: price
                });
            } else {
                //真实购买
            }
        } else if (order === 'sell') {
            if (this.imitateRun) {
                //模拟卖出
                //获得回收金额
                this.addHistory('sell', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount * (1 - this.parameter.serviceCharge),
                    orderId: 0,
                    price: price,
                    profit: this.getProfit()
                });
                this.profitSymbol.push({ symbol: this.symbol, profit: this.getProfit() });
            } else {
                //真实卖出
            }
        }
    }
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            symbol: this.symbol,
            param: this.parameter,
            paramDesc: this.parameterDesc,
            presentDeal: this.presentDeal,
            history: this.history.slice(this.history.length > 100 ? this.history.length - 100 : 0, this.history.length),
            historyForDeal: this.historyForDeal.slice(this.historyForDeal.length > 15 ? this.historyForDeal.length - 15 : 0, this.historyForDeal.length),
            runState: this.runState,
            buyState: this.buyState,
            imitateRun: this.imitateRun,
            profitSymbol: this.profitSymbol,
            KLineItem5m: this.KLineItem5m
        }
    }
    getSimplyInfo() {
        return {
            id: this.id,
            name: this.name,
            symbol: this.symbol,
            runState: this.runState,
            imitateRun: this.imitateRun,
            buyState: this.buyState
        }
    }
}