/*
 * @Author: weishere.huang
 * @Date: 2020-10-26 13:46:51
 * @LastEditTime: 2020-10-26 17:09:29
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
        this.runState = false;
        this.btcPrice = 0;
        this.positionLong = new PositionLong();
        this.positionShort = new PositionShort();
        this.recordHistoryList = [];
        this.lineStatus = this.statusRefresh();//三线状态:singleLong、singleShort、longShort、shortLong
        this.presentInfo = {
            hadProfit: 0,//已经实现的盈利
        }
        this.frameLoop = [{ name: '', fn: () => { } }];
    }
    /**刷新状态 */
    statusRefresh() {
        if (this.positionLong.state === 'out' && this.positionShort.state === 'out') {
            //场外
            return 'out';
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
    /**初始化 */
    initialize() {
        if (this.runState) {
            this.powerSwitch(true);
        }
    }
    /**开关 */
    async powerSwitch(order) {
        this.runState = order;
        if (order) {
            //开启
            //启动价格监控
            //拉取订单信息
            this.lineStatus = this.statusRefresh();
            const looper = async () => {
                clearTimeout(this.mainTimer);
                this.frameLoop.forEach(item => item.fn());
                this.mainTimer = setTimeout(async () => {
                    this.runState && await looper();
                }, this.baseRate);
            }
            await looper();
        } else {
            //暂停
        }
    }

}