/*
 * @Author: weishere.huang
 * @Date: 2020-10-26 13:46:51
 * @LastEditTime: 2020-10-31 18:40:24
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer2');
const { Trade, PositionLong, PositionShort } = require('./Position');
const LoadUpHelper = require('./LoadUpHelper');

class RecordHistory {
    constructor() {
        this.eventTime = 0;//发生时间
        this.avgPriceLong = 0;//多方均价
        this.avgPriceShort = 0;//空方均价
        this.themPrive = 0;//当时的价格
        this.content = 0;//内容
        this.longProfit = 0;//多方盈亏
        this.shortProfit = 0;//空方盈亏
        this.refer = {//相关方向
            position: 'long',
            action: 'build',//build:建仓、loadUp:补仓、平仓:sell

        }
    }
}

module.exports = class Margin {
    constructor() {
        this.parameter = {
            baseBuying: 0.4,//基础买入数量
            baseRate: 3000,//基本检测频率
            loadUpOff: false,//是否关闭补仓
            loadUpOfDiff: 300,//触发补仓的双线差值
            loadUpStep: 0.2,//补仓步进值
            maxBuying: 1,//最大买入值
            loadupInterval: 30,//补仓间隔，分钟
        }
        this.symbol = 'BTCUSDT';
        this.runState = false;
        this.priceInfo = {};//markPrice、indexPrice
        this.positionLong = new PositionLong();
        this.positionShort = new PositionShort();
        this.recordHistoryList = [];
        this.lineStatus = this.statusRefresh();//三线状态:singleLong、singleShort、longShort、shortLong
        this.lowPrice = 0;
        this.highPrice = 0;
        this.presentPrice = 0;
        this.presentInfo = {
            hadProfit: 0,//已经实现的盈利
        }
        this.id = 'r_' + (parseInt(Math.random() * 1000000000) + Date.parse(new Date()) / 1000);
        //this.frameLoop = [{ name: '', fn: () => { } }];
        //this.resetSignPrice = this.resetSignPrice.bind(this);
        this.loadUpHelper = new LoadUpHelper(this);
    }
    /**刷新状态 */
    statusRefresh() {
        if (this.positionLong.state === 'init' && this.positionShort.state === 'init') {
            //初始化
            return 'init';
        } else if (this.positionLong.state === 'init' && this.positionShort.state === 'in') {
            //初始化-单多状态
            return 'init_singleLong';
        } else if (this.positionLong.state === 'in' && this.positionShort.state === 'init') {
            //初始化-单空状态
            return 'init_singleShort';
        } else if (this.positionLong.state === 'out' && this.positionShort.state === 'in') {
            //单多状态
            return 'singleLong';
        } else if (this.positionLong.state === 'in' && this.positionShort.state === 'out') {
            //单空状态
            return 'singleShort';
        } else if (this.positionLong.state === 'in' && this.positionShort.state === 'in') {
            //双向持仓
            if (this.positionLong.avgPrice > this.positionShort.avgPrice) {
                //多线在上
                return 'longShort';
            } else if (this.positionLong.avgPrice < this.positionShort.avgPrice) {
                //空线在上
                return 'shortLong';
            } else if (this.positionLong.avgPrice === this.positionShort.avgPrice) {
                //双线一致
                return 'same';
            }
        }
    }
    /**历史记录 */
    pushHistoryRecord(type, content, { subType, option, isNowSend, isRplace } = {}) {
        const recordHistory = new RecordHistory();
        this.recordHistoryList.push(recordHistory)
    }
    /**初始化 */
    async initialize() {
        //配置scoket
        client.futuresMarkPriceStream(this.symbol, (data) => {
            this.priceInfo = data;
            this.presentPrice = Number(this.priceInfo.markPrice);
        });
        await this.initKlines('5m');
        //this.resetSignPrice();//获取最新价格后需要执行！！！！！！！！！
        if (this.runState) {
            this.powerSwitch(true);
        }
    }
    /**重置最高值和最低值，用于拐点 */
    // resetSignPrice() {
    //     this.lowPrice = this.highPrice = this.presentPrice;
    // }
    async initKlines(interval) {
        //获取第一页K线数据
        //sc推送K线单条数据
    }
    /**开关 */
    async powerSwitch(order) {
        this.runState = order;
        if (order) {
            //开启
            //启动价格监控
            //拉取订单信息
            const looper = async () => {
                clearTimeout(this.mainTimer);
                this.lineStatus = this.statusRefresh();//init、init_singleLong、init_singleShort、singleLong、singleShort、longShort、shortLong、same
                //this.frameLoop.forEach(item => item.fn());
                this.positionLong.onframe(this);
                this.positionShort.onframe(this);
                switch (this.lineStatus) {
                    case 'init':
                        //初始化，趋势判断
                        const result = await this.tendencyTest();
                        if (result === 'long') {
                            await this.positionLong.buy(this);
                        } else if (result === 'short') {
                            await this.positionShort.buy(this);
                        }
                        break;
                    case 'init_singleLong':
                        //初始化-单多状态，寻求空方入场时机
                        // const result = await this.tendencyTest('short');
                        // if (result === 'short') await this.positionShort.buy(this);
                        this.positionShort.rnflexion_buy.setOrigin(this.presentInfo.markPrice);
                        this.positionShort.rnflexion_buy.setSensitivityLevel();
                        if (this.positionShort.rnflexion_buy.trigger(this.presentInfo.markPrice)) {
                            await this.positionShort.buy(this);
                        }
                        break;
                    case 'init_singleShort':
                        //初始化-单空状态，寻求多方入场时机
                        // const result = await this.tendencyTest('long');
                        // if (result === 'long') await this.positionLong.buy(this);
                        this.positionLong.rnflexion_buy.setOrigin(this.presentInfo.markPrice);
                        this.positionLong.rnflexion_buy.setSensitivityLevel();
                        if (this.positionLong.rnflexion_buy.trigger(this.presentInfo.markPrice)) {
                            await this.positionLong.buy(this);
                        }
                        break;
                    case 'shortLong':
                        //空>多线
                        await this.doubleLine(this.lineStatus);
                        break;
                    case 'longShort':
                        //多>空线
                        await this.doubleLine(this.lineStatus);
                        break;
                    case 'same':
                        await this.doubleLine(this.lineStatus);
                        break;
                    case 'singleLong':
                        //单多线
                        const result = await this.singleLine(this.lineStatus);
                        break;
                    case 'singleShort':
                        //单空线
                        const result = await this.singleLine(this.lineStatus);
                        break;
                }
                //补仓入口
                if (!this.parameter.loadUpOff) {
                    const { position, action } = this.loadUpHelper.run();
                    if ((position === 'both' || position === 'long')) {
                        if (action === 'buy') {
                            const result = await this.positionLong.buy(this, this.parameter.loadUpStep);
                            result && (this.loadUpHelper.longLoadUpQue += this.parameter.loadUpStep);
                        } else if (action === 'sell') {
                            const result = await this.positionLong.sell(this, this.parameter.loadUpStep);
                            result && (this.loadUpHelper.longLoadUpQue -= this.parameter.loadUpStep);
                        }
                    }
                    if ((position === 'both' || position === 'short')) {
                        if (action === 'buy') {
                            const result = this.positionShort.buy(this, this.parameter.loadUpStep);
                            result && (this.loadUpHelper.shortLoadUpQue += this.parameter.loadUpStep);
                        } else if (action === 'sell') {
                            const result = this.positionShort.sell(this, this.parameter.loadUpStep);
                            result && (this.loadUpHelper.shortLoadUpQue -= this.parameter.loadUpStep);
                        }
                    }
                }
                this.mainTimer = setTimeout(async () => {
                    this.runState && await looper();
                }, this.baseRate);
            }
            await looper();
        } else {
            //暂停
        }
    }
    /**趋势判断 检测 
     * return 涨/跌/空
    */
    async tendencyTest(target) {
        return null;//先不返回判断，手动入场
    }
    /**双线*/
    async doubleLine(state) {
        //首先判断补仓数量是否一致，如果不一致，则需要判断数量少一方是否需要加仓
        if (this.longLoadUpQue > this.shortLoadUpQue) {
            //多方持仓更多
            if (this.positionShort.rnflexion_buy.trigger(this.presentPrice)) {
                await this.positionShort.buy(this, this.shortLoadUpQue - this.longLoadUpQue);
                return;
            }
        } else if (this.shortLoadUpQue > this.longLoadUpQue) {
            //空方持仓更多
            if (this.positionLong.rnflexion_buy.trigger(this.presentPrice)) {
                await this.positionLong.buy(this, this.longLoadUpQue - this.shortLoadUpQue);
                return;
            }
        }
        if (this.presentPrice > this.positionLong.avgPrice && this.presentPrice > this.positionShort.avgPrice) {
            //双线之上
            this.positionLong.rnflexion_sell.setOrigin(this.presentPrice);
            if (state === 'shortLong') {
                //空线在上，说明离多线更远，寻求最高点多方平仓
                this.positionLong.rnflexion_sell.setSensitivityLevel(2);//敏感度降低
            } else if (state === 'longShort') {
                //空线在下，寻求多方盈利出场
                this.positionLong.rnflexion_sell.setSensitivityLevel();//敏感度恢复正常
            }
            if (this.positionLong.rnflexion_sell.trigger(this.presentPrice)) {
                await this.positionLong.sell(this);//多方平仓
            }
        } else if (this.presentPrice < this.positionLong.avgPrice && this.presentPrice < this.positionShort.avgPrice) {
            //双线之下
            this.positionShort.rnflexion_sell.setOrigin(this.presentPrice);
            if (state === 'shortLong') {
                //多线之下，说明离空线更远，寻求最低点空方平仓
                this.positionShort.rnflexion_sell.setSensitivityLevel(2);//敏感度降低
            } else if (state === 'longShort') {
                //空线在下，寻求空方盈利出场
                this.positionShort.rnflexion_sell.setSensitivityLevel();//敏感度恢复正常
            }
            if (this.positionShort.rnflexion_sell.trigger(this.presentPrice)) {
                await this.positionShort.sell(this);//空方平仓
            }
        } else {
            //双线之间
            if (state === 'shortLong') {
                //空>多，

            } else if (state === 'longShort') {
                //多>空，说明亏起得，先不管了，是否有动作由补仓逻辑处理
            }
        }
    }
    /**单线 */
    async singleLine(state) {
        if (state === 'singleLong') {
            //单多线
            this.positionShort.rnflexion_buy.setOrigin(this.presentInfo.markPrice);
            if (this.presentPrice > this.positionLong.avgPrice) {
                //盈利，如果价格回调则平多完结本轮
                this.positionShort.rnflexion_buy.setSensitivityLevel(3);//敏感度降低
                if (this.positionShort.rnflexion_buy.trigger(this.presentPrice)) {
                    this.positionLong.sell(this, this.positionLong.quantity);
                    this.roundEnd();
                }
            } else {
                //亏损
                this.positionShort.rnflexion_buy.setSensitivityLevel(10);//加大敏感度，不要亏多了才入场
                if (this.positionShort.rnflexion_buy.trigger(this.presentPrice)) {
                    this.positionShort.buy(this, this.positionLong.quantity);
                }
            }
        } else if (state === 'singleShort') {
            //单空线
            this.positionLong.rnflexion_buy.setOrigin(this.presentInfo.markPrice);
            if (this.presentPrice > this.positionShort.avgPrice) {
                //亏损
                this.positionLong.rnflexion_buy.setSensitivityLevel(10);//加大敏感度，不要亏多了才入场
                if (this.positionLong.rnflexion_buy.trigger(this.presentPrice)) {
                    this.positionLong.buy(this, this.positionLong.quantity);
                }
            } else {
                //盈利
            }
        }
    }
    roundEnd() {

    }
    getInfo() {
        let result = {};
        ['id',
            'runState',
            'parameter'].forEach(item => result[item] = this[item]);
    }
}