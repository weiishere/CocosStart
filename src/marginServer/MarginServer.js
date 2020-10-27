/*
 * @Author: weishere.huang
 * @Date: 2020-10-26 13:46:51
 * @LastEditTime: 2020-10-27 18:35:40
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer2');
const { Trade, PositionLong, PositionShort } = require('./Position');

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
            loadUpStep: 0.2,//补仓步进值
            maxBuying: 2,//最大买入值
        }
        this.symbol = 'BTCUSDT';
        this.runState = false;
        this.priceInfo = {};//markPrice、indexPrice
        this.positionLong = new PositionLong();
        this.positionShort = new PositionShort();
        this.recordHistoryList = [];
        this.lineStatus = this.statusRefresh();//三线状态:singleLong、singleShort、longShort、shortLong
        this.presentInfo = {
            hadProfit: 0,//已经实现的盈利
        }
        this.id = 'r_' + (parseInt(Math.random() * 1000000000) + Date.parse(new Date()) / 1000);
        //this.frameLoop = [{ name: '', fn: () => { } }];
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
        client.futuresMarkPriceStream(this.symbol, (data) => this.priceInfo = data);
        await this.initKlines('5m');
        if (this.runState) {
            this.powerSwitch(true);
        }
    }
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
                switch (this.lineStatus) {
                    case 'init':
                        //初始化，趋势判断
                        const result = await this.tendencyTest();
                        if (result === 'long') {
                            await this.positionLong.buy(priceInfo.markPrice, this.parameter.baseBuying);
                        } else if (result === 'short') {
                            await this.positionShort.buy(priceInfo.markPrice, this.parameter.baseBuying);
                        }
                        break;
                    case 'init_singleLong':
                        //初始化-单多状态，寻求空方入场时机
                        const result = await this.tendencyTest('short');
                        if (result === 'short') await this.positionShort.buy(priceInfo.markPrice, this.parameter.baseBuying);
                        break;
                    case 'init_singleShort':
                        //初始化-单空状态，寻求多方入场时机
                        const result = await this.tendencyTest('long');
                        if (result === 'long') await this.positionLong.buy(priceInfo.markPrice, this.parameter.baseBuying);
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

    }
    /**双线*/
    async doubleLine(state) {
        if (state === 'shortLong') {
            //空>多，寻求最大盈利时机
        } else if (state === 'longShort') {
            //多>空，寻求利润，缩小差距，伺机双向离场
        }
    }
    /**单线 */
    async singleLine(state) {
        if (state === 'singleLong') {
            //单多线
        } else if (state === 'singleShort') {
            //单空线
        }
    }
    getInfo() {
        let result = {};
        ['id',
            'runState',
            'parameter'].forEach(item => result[item] = this[item]);
    }
}