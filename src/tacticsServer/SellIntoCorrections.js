/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:50:17
 * @LastEditTime: 2020-08-12 15:53:12
 * @LastEditors: weishere.huang
 * @Description: 追涨杀跌对象
 * @~~
 */

const Tactics = require('./Tactics');
const Helper = require('./Helper');
const { clearInterval } = require('stompjs');
const { client } = require('../lib/binancer');


module.exports = class SellIntoCorrections extends Tactics {
    constructor(uid, name, parameter) {
        super(uid, name, parameter);
        this.runState = false;//运行状态  false:stop,true:run
        this.imitateRun = false;//是否是模拟状态
        this.buyState = false;//购买状态  true:in,false:out
        this.symbol = '';//当前交易对
        this.presentTrade = null;
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
        this.depth = null;//深度
        //关于交易的一些历史记录（用于BS线）
        this.historyForDeal = [];
        this.parameter = Object.assign({
            usdtAmount: 11,//每次入场数量（USDT）
            serviceCharge: 0.00075,//币安手续费(千一)
            serviceChargeDiscounts: 0.25,//优惠费率(实付费用(1-0.25))
            checkBuyRate: 5000,//入场时间检查速率
            riseStayCheckRateForBuy: 8000,//未入场及上涨情况下，判断间隔等待时间
            riseBuyRange: 0.0005,//上涨情况下，入场的上涨幅度
            ambushRange: 0.001,//需进行埋伏操作的下跌率
            /** 出场检测速率*/
            checkSellRate: 5000,
            riseStayCheckRateForSell: 8000,//止损等待时间
            stopRiseRate: 0,//强制止盈涨幅
            lowertRiseRate: 0.01,//最低盈利，少了这个值不割肉
            riseStopLossRate: 0.005,//上涨情况（盈利）下跌止损点
            isLiveRiseStopLossRate: true,
            lossStopLossRate: 0.1,//下跌情况（亏损）下跌止损点
            maxStayTime: 120//亏损但未达到止损值的情况下，最久呆的时间(分钟)
        }, parameter || {});

        //参数的说明，也表示需要进行界面设定的参数
        this.parameterDesc = {
            //serviceCharge: "币安手续费(千一)",
            //serviceChargeDiscounts: "优惠费率(实付费用(1-0.25))",
            stopRiseRate: "强制止盈(相对成本涨幅)",
            lowertRiseRate: "最低出场盈利(相对成本)",
            riseStopLossRate: "止盈(拐点跌幅)",
            lossStopLossRate: "止损(相对成本跌幅)",
            isLiveRiseStopLossRate: "是否动态设置拐点跌幅",
            checkBuyRate: "买入检查频率",
            riseStayCheckRateForBuy: "买入确认频率",
            riseBuyRange: "买入确认涨幅",
            //ambushRange: "埋伏入场下跌率",
            checkSellRate: "卖出检查频率",
            riseStayCheckRateForSell: "卖出确认频率",
            usdtAmount: "每次入场USDT数量",
            maxStayTime: "场内持续时间(分钟)",

        };
        //当前的交易信息
        this.presentDeal = {
            presentPrice: 0,//当前价格
            costing: 0,//成本,
            payPrice: 0,//买入价格
            amount: 0,//购买后持有的相应代币数量
            historyProfit: 0,//当前交易的历史盈利
            buyOrderInfo: null,
            sellOrderInfo: null,
            tradeRole: 'buyer',//'seller',当前的交易角色，用于
            tradesDoneAmount: 0//当前交易已经处理完成的币数量（如果tradesDoneAmount=amount即完成）
        }
    }
    /**添加历史记录，isDouble：如果重复两条记录，是否允许重复添加 */
    addHistory(type, content, isDouble) {
        if (isDouble && this.history.length !== 0 && this.history[this.history.length - 1].type === type && this.history[this.history.length - 1].content === content) {
            this.history[this.history.length - 1].time = Date.parse(new Date());
            return;
        }
        type !== 'profitChange' && this.history.push({
            type: type,//order、info、buy、sell
            time: Date.parse(new Date()),
            content: content//`实例已${(this.runState ? "运行" : "停止")}${this.imitateRun ? "模拟" : ""}`
        })
        if (type === 'buy' || type === 'sell') {
            this.historyForDeal.push({ ...this.history[this.history.length - 1] });
        } else if (type === 'profitChange') {
            let _historyForDeal = this.historyForDeal[this.historyForDeal.length - 1];
            if (_historyForDeal) {
                _historyForDeal['changeTime'] = Date.parse(new Date());
                _historyForDeal.content.profit = content;
            }
        }
        const _tacticesCommand = require('./TacticesCommand').getInstance();
        _tacticesCommand.mapTotacticsList(this.uid, this.id, true);
        //if (this.presentSymbleId === this.id) _tacticesCommand.mapTotacticsList(this.uid, _tacticesCommand.presentSymbleId, true);
    }
    changeSymbol(symbol) {
        this.nextSymbol = symbol;
    }
    /** 接收每次推过来的交易信息，如果有符合当前正在交易的数据，就要截获数据 */
    pushTrade(trade) {
        this.presentTrade = trade;
        if (this.runState && this.buyState && (this.presentDeal.buyOrderInfo || this.presentDeal.sellOrderInfo)) {
            const sellOrder = this.presentDeal.sellOrderInfo ? this.presentDeal.sellOrderInfo.orderId : 0;//在买的时候sellOrderInfo有可能还不存在
            if (trade.buyerOrderId === this.presentDeal.buyOrderInfo.orderId || trade.sellerOrderId === sellOrder) {
                //能到这里，说明有挂单在处理，不可能同时有两种状态的挂单，要么买要么卖（至少当前不考虑）
                console.log(trade);
                this.presentDeal.tradesDoneAmount += trade.quantity;
                if (trade.buyerOrderId === this.presentDeal.buyOrderInfo.orderId) {
                    //买
                    this.addHistory('info', `买入交易完成${Number(this.presentDeal.tradesDoneAmount)}/${Number(this.presentDeal.amount)}枚，实际成交价格：${Number(trade.price)}`);
                    //如果是买单的话，更新成本(累加)
                    this.presentDeal.costing += (trade.quantity * trade.price) *
                        (1 + (this.parameter.serviceCharge * (1 - this.parameter.serviceChargeDiscounts)))
                } else if (trade.sellerOrderId === sellOrder) {
                    //卖
                    this.addHistory('info', `卖出交易完成${Number(this.presentDeal.tradesDoneAmount)}/${Number(this.presentDeal.amount)}枚，实际成交价格：${Number(trade.price)}`);
                }
            }
        } else {
            //配合测试用
            if (trade.buyerOrderId === this.orderId || trade.sellerOrderId === this.orderId) {
                console.log('trade', trade);
            }
        }
    }
    /**nowBuy=true表示跳过入场判断，立即入场 */
    async powerSwitch(nowBuy) {
        this.fristNowBuy = nowBuy;
        this.runState = !this.runState;
        this.addHistory('order', `实例将${(this.runState ? "开始运行" : "停止")}${this.imitateRun ? "模拟程序" : ""}`);
        if (this.runState) {
            //开始运行
            let fn = async () => {
                clearTimeout(this.mainTimer);
                if (!this.buyState) {
                    if (this.fristNowBuy) {
                        //立即买入
                        this.buyState = true;
                        this.deal('buy');
                        this.fristNowBuy = false;//第二次买入逻辑，就不能立即买入了
                    } else {
                        //入场判断
                        this.buyState = await this.buy();
                    }
                } else {
                    //出场判断
                    const r = await this.sell();
                    this.buyState = !r;
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
    powerPause() {
        if (this.mainTimer) clearTimeout(this.mainTimer);
        this.runState = !this.runState;
        this.addHistory('info', `实例${this.name}已经发送暂停指令(执行完最后的逻辑)...`);
    }
    async remove(deleteFn) {
        if (this.runState) await this.stop();
        deleteFn(this);
        this.addHistory('info', `实例${this.name}已经删除...`);
    }
    async stop() {
        this.runState = false;
        this.mainTimer && clearInterval(this.mainTimer);
        //this.dealTimer && clearInterval(this.dealTimer);
        if (this.buyState) {
            await this.deal('sell');
            this.buyState = false;
        } else {

        }
        this.addHistory('info', `实例${this.name}已经停止...`);
    }
    async buy() {
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
        if (this.KLineItem5m.present && this.KLineItem5m.present.close - this.KLineItem5m.present.open > 0) {
            //if (this.KLineItem5m.present.close - (this.KLineItem5m.recent ? this.KLineItem5m.recent.open : this.KLineItem5m.present.open) > 0) {
            if (Math.abs(this.KLineItem5m.present.close - this.KLineItem5m.present.open) / this.KLineItem5m.present.open > this.parameter.riseBuyRange) {
                //记录当前价格
                const tempPrice = await this.getPresentPrice();//await Helper.getInstance(this).getPresentPrice();
                //console.log(Number(tempPrice) === this.presentDeal.presentPrice ? '价格一致' : '不一致'); console.log(tempPrice + "--" + this.presentDeal.presentPrice);
                this.addHistory('info', `5分线上涨幅度超过${this.parameter.riseBuyRange}，获取当前价格${Number(tempPrice)}，等待${this.parameter.riseStayCheckRateForBuy / 1000}s后价格...`);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        const price = await this.getPresentPrice();//await Helper.getInstance(this).getPresentPrice();
                        //console.log(Number(price) === this.presentDeal.presentPrice ? '价格一致' : '不一致'); console.log(price + "--" + this.presentDeal.presentPrice);
                        if (price - tempPrice < 0) {
                            this.addHistory('info', `${this.parameter.riseStayCheckRateForBuy / 1000}s后差价为${Number(price - tempPrice)},出现下跌，重新等待入场时机...`);
                            resolve(false);
                        } else {
                            resolve(true);//先要把状态切成交易中，再进行购买操作
                            this.deal('buy');
                        }
                    }, this.parameter.riseStayCheckRateForBuy);
                })
            } else {
                this.addHistory('info', `5分线上涨，却未保持上涨趋势，重新等待入场时机...`, true);
                return false;
            }
        } else {
            this.addHistory('info', `5分线下跌，重新等待入场时机...`, true);
            return false;
        }
    }
    async sell() {
        const _profit = this.getProfit();
        //this.profitSymbol[this.profitSymbol.length - 1] = { symbol: this.symbol, profit: _profit };
        this.addHistory('profitChange', _profit);
        if (_profit >= 0) {
            this.riseTimer && clearTimeout(this.riseTimer);//清除超时timer
            if (this.parameter.stopRiseRate !== 0 && _profit / this.presentDeal.costing > this.parameter.stopRiseRate) {
                //盈利止盈点
                this.addHistory('info', `盈利：${_profit / this.presentDeal.costing}，大于止盈点：${this.parameter.stopRiseRate}，准备卖出...`);
                await this.deal('sell');
                return true;
            }
            //如果盈利为正
            if (_profit >= this.presentDeal.historyProfit) {
                //利润大于上一次统计的利润，持续盈利中...
                this.addHistory('info', `记录到更高盈利${_profit}`, true);
                this.presentDeal.historyProfit = _profit;//存储最高利润
                return false;
            } else {
                //利润下降（出现拐点）判断亏损率
                /*if (_profit / this.presentDeal.costing < this.parameter.lowertRiseRate) {
                    //盈利率小于某一个值的话，就不予止盈，否则没太大意义（避免某一下的急跌造成割肉，却没赚到什么）
                    this.addHistory('info', `盈利下降，收益已低于最低出场盈利率${this.parameter.lowertRiseRate}，继续观察...`);
                    return false;
                } else {
                    this.addHistory('info', `盈利下降，收益高于最低出场盈利率${this.parameter.lowertRiseRate}，进行止盈操作！`);
                    await this.deal('sell');
                    return true;
                }*/
                if (this.parameter.isLiveRiseStopLossRate) Helper.getInstance(this).setRiseStopLossRate();
                const diff = this.presentDeal.historyProfit - _profit;//相比上次降低的利润
                const _riseStopLossRate = diff / this.presentDeal.costing;
                if (_riseStopLossRate > this.parameter.riseStopLossRate) {
                    //亏损率大于一个值,判断当前盈利率，选择是否止盈
                    if (_profit / this.presentDeal.costing < this.parameter.lowertRiseRate) {
                        //盈利率小于某一个值的话，就不予止盈，否则没太大意义（避免某一下的急跌造成割肉，却没赚到什么）
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(6)}，大于${this.parameter.riseStopLossRate}，但低于最低出场盈利率${this.parameter.lowertRiseRate}，继续观察...`, true);
                        return false;
                    } else {
                        this.addHistory('info', `相比最大历史盈利，下降量${_riseStopLossRate.toFixed(6)}，大于${this.parameter.riseStopLossRate}，且高于最低出场盈利率${this.parameter.lowertRiseRate}，进行止盈操作！`);
                        await this.deal('sell');
                        return true;
                    }
                } else {
                    //亏损率还未大于一个值，持续观察
                    this.addHistory('info', `盈利下降量${_riseStopLossRate.toFixed(6)}，继续观察盈利情况...`, true);
                    return false;
                }
            }
        } else {
            //盈利为负（亏损）
            //获取亏损率
            this.presentDeal.historyProfit = _profit;//重置最高盈利(考虑先盈利很高，突然暴跌后，重新拉回来，但没有冲破最高盈利，一直无法出场)
            if (!this.riseTimer) {
                this.riseTimer = setTimeout(async () => {
                    this.addHistory('info', `亏损状态时间超时，进行止损操作`);
                    await this.deal('sell');
                    this.buyState = false;
                }, this.parameter.maxStayTime * 60000);
            }
            const _lossStopLossRate = Math.abs(Number(this.getProfit() / this.presentDeal.costing));
            if (_lossStopLossRate >= this.parameter.lossStopLossRate) {
                //再观察一定时间，看是否涨回去
                this.addHistory('info', `当前处于亏损状态,亏损率：${_lossStopLossRate.toFixed(6)}，超过${this.parameter.lossStopLossRate}，${this.parameter.riseStayCheckRateForSell}ms后进行下一步判断是否止损...`, true);
                return await new Promise((resolve) => {
                    setTimeout(async () => {
                        //再次观察亏损
                        const _profit = this.getProfit();
                        const _lossStopLossRate2 = Math.abs(Number(_profit / this.presentDeal.costing));
                        if (_lossStopLossRate2 > 0) {
                            this.addHistory('info', `扭亏为盈，继续等待出场时机...`);
                            this.presentDeal.historyProfit = _profit;
                            // if (_profit > this.presentDeal.historyProfit) {
                            //     //可能是爆拉，直接顶破最高盈利历史记录
                            //     this.presentDeal.historyProfit = _profit;
                            // }

                            resolve(false);
                        } else {
                            if (Math.abs(_lossStopLossRate2) >= this.parameter.lossStopLossRate) {
                                this.riseTimer && clearTimeout(this.riseTimer);
                                //仍然大于止损值，割肉
                                this.addHistory('info', `二次判断，继续亏损,亏损率：${_lossStopLossRate2.toFixed(6)}，仍然超过${this.parameter.lossStopLossRate}，进行止损操作`);
                                await this.deal('sell');
                                resolve(true);
                            } else {
                                //说明在回涨，观察
                                this.addHistory('info', `二次判断，亏损降低，亏损率：${_lossStopLossRate2.toFixed(6)}，低于止损点${this.parameter.lossStopLossRate}，继续等待出场时机...`, true);
                                resolve(false);
                            }
                        }
                    }, this.parameter.riseStayCheckRateForSell);
                });
            } else {
                //持续观察
                this.addHistory('info', `当前处于亏损状态，亏损率：${_lossStopLossRate.toFixed(6)}，但未达止损点，继续等待出场时机...`, true);
                return false;
            }
        }

        //console.log(price + '---' + this.presentDeal.presentPrice)
        // this.addHistory('info', `暂时标定不卖出，继续...`);
        // return false;
    }
    /**利润,即若按照当前价格卖掉，获得的回报减去成本价(购买数量*当前价格)*(1-费率)-成本 */
    getProfit(amount) {
        if (this.imitateRun) {
            let _amount = amount || this.presentDeal.amount;
            return Number(_amount * this.getTheoryPrice(_amount).avePrive * (1 - this.parameter.serviceCharge) - this.presentDeal.costing);
        } else {
            //需要通过深度图获取理论交易均价，再做判断，不能再根据市价
            let _amount = amount || this.presentDeal.amount;
            return Number(_amount *
                this.getTheoryPrice(_amount) * (1 - (this.parameter.serviceCharge * (1 - this.parameter.serviceChargeDiscounts)))
                - this.presentDeal.costing);
        }

    }
    /**通过深度图获取可能最终成交的理论交易模型和理论均价 */
    getTheoryPrice(amount) {
        let _amount = 0;
        let total = 0, avePrive = 0;
        let tradesList = [];
        if (!this.imitateRun) {
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
        } else {
            tradesList.push({ price: this.presentDeal.presentPrice, amount: amount });
            avePrive = this.presentDeal.presentPrice;
        }
        return {
            tradesList,
            avePrive
        };
    }
    /**获取瞬时价格 */
    async getPresentPrice() {
        if (this.presentDeal.presentPrice) return this.presentDeal.presentPrice;
        const allPrice = await client.prices();
        return allPrice[this.symbol];
    }
    async deal(order) {
        const price = this.presentDeal.presentPrice = await this.getPresentPrice();//await Helper.getInstance(this).getPresentPrice();//this.presentDeal.presentPrice;
        //console.log(Number(price) === this.presentDeal.presentPrice ? '价格一致' : '不一致'); console.log(price + "--" + this.presentDeal.presentPrice);
        if (order === 'buy') {
            if (this.imitateRun) {
                this.presentDeal = Object.assign(this.presentDeal,
                    {
                        payPrice: price,//买入价
                        costing: this.parameter.usdtAmount,//模拟的时候这里成本等于usdt量
                        amount: (this.parameter.usdtAmount / price) * (1 - this.parameter.serviceCharge),//因为是模拟，这里是理论值
                        historyProfit: 0,//当前交易的历史盈利
                    });
                this.addHistory('buy', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount,
                    orderId: 0,
                    profit: this.getProfit(),
                    price: price,
                    costing: this.presentDeal.costing
                });
            } else {
                //真实购买，入场数量可以通过市价获取，需要通过推送获取到最终的交易均价，再获取到成本
                //this.dealTimer && clearInterval(this.dealTimer);
                this.presentDeal = Object.assign(this.presentDeal,
                    {
                        payPrice: price,//买入价,暂时等于市价
                        //这里成本暂时等于usdt量加手续费，之后获取订单后会更新
                        costing: 0,//this.parameter.usdtAmount * (1 + (this.parameter.serviceCharge * (1 - this.parameter.serviceChargeDiscounts))),
                        //通过BNB交手续费，那么这里导致数量不会扣减，就是实际到账数量
                        amount: (this.parameter.usdtAmount / price),
                        historyProfit: 0,//当前交易的历史盈利
                        tradesDoneAmount: 0//处理完成的币数量
                    });
                //挂单
                this.presentDeal.buyOrderInfo = await client.order({
                    symbol: this.symbol,
                    type: 'MARKET',
                    side: 'BUY',
                    quantity: this.presentDeal.amount
                });
                this.addHistory('info', `已挂单买入交易，理论均价：${price}，理论交易数量:${this.presentDeal.amount}`);
                //let dealResult = null;
                let dealResult = await new Promise(async (resolve) => {
                    const fn = async () => {
                        const clean = await client.ws.user(msg => {
                            console.log('userMsg', msg);
                        })
                        const _dealResult = await client.getOrder({
                            symbol: this.symbol,
                            orderId: this.presentDeal.buyOrderInfo.orderId,
                        });
                        if (!_dealResult.isWorking) {
                            resolve(_dealResult);
                        } else {
                            await fn();
                        }
                    }
                    await fn();
                });
                this.presentDeal.payPrice = dealResult.price;
                this.presentDeal.amount = this.presentDeal.tradesDoneAmount = dealResult.executedQty;//交易均价*交易数量
                this.presentDeal.costing = dealResult.price * dealResult.executedQty;//交易均价*交易数量
                this.addHistory('buy', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount,
                    orderId: this.presentDeal.buyOrderInfo.orderId,
                    profit: this.getProfit(),
                    price: dealResult.price,
                    costing: this.presentDeal.costing
                });
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
                    profit: this.getProfit(),
                    costing: this.presentDeal.amount * (1 - this.parameter.serviceCharge) * price
                });
                this.profitSymbol.push({ symbol: this.symbol, profit: this.getProfit() });
            } else {
                //真实卖出
                //this.dealTimer && clearInterval(this.dealTimer);
                this.presentDeal = Object.assign(this.presentDeal, {
                    tradesDoneAmount: 0//处理完成的币数量，之后的程序使用getProfit函数记得加上参数this.presentDeal.amount
                });
                //挂单
                this.presentDeal.sellOrderInfo = await client.order({
                    symbol: this.symbol,
                    type: 'MARKET',
                    side: 'SELL',
                    quantity: this.presentDeal.amount
                });
                this.addHistory('info', `已挂单卖出交易，理论交易数量:${this.presentDeal.amount}`);
                let dealResult = await new Promise(async (resolve) => {
                    const fn = async () => {
                        const clean = await client.ws.user(msg => {
                            console.log('userMsg-2', msg);
                        })
                        const _dealResult = await client.getOrder({
                            symbol: this.symbol,
                            orderId: this.presentDeal.sellOrderInfo.orderId,
                        });
                        if (!_dealResult.isWorking) {
                            resolve(_dealResult);
                        } else {
                            await fn();
                        }
                    }
                    await fn();
                });
                this.presentDeal.payPrice = dealResult.price;//实际交易均价
                this.presentDeal.amount = this.presentDeal.tradesDoneAmount = dealResult.executedQty;//实际交易数量
                this.presentDeal.costing = dealResult.price * dealResult.executedQty;//回本，交易均价*交易数量
                this.addHistory('sell', {
                    symbol: this.symbol,
                    dealAmount: this.presentDeal.amount,
                    orderId: this.presentDeal.sellOrderInfo.orderId,
                    profit: this.getProfit(this.presentDeal.amount),
                    price: this.presentDeal.payPrice
                });
                this.profitSymbol.push({ symbol: this.symbol, profit: this.getProfit(this.presentDeal.amount) });
            }
            if (this.nextSymbol) this.symbol = this.nextSymbol;//出场成功之后切换币
        }
        this.riseTimer && clearTimeout(this.riseTimer);
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
            historyForDeal: this.historyForDeal,
            runState: this.runState,
            buyState: this.buyState,
            imitateRun: this.imitateRun,
            profitSymbol: this.profitSymbol,
            KLineItem5m: this.KLineItem5m,
            presentTrade: this.presentTrade,
            depth: this.depth
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