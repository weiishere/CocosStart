/*
 * @Author: weishere.huang
 * @Date: 2020-09-016 18:19:58
 * @LastEditTime: 2020-10-09 16:32:54
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer');
const { symbolStorage } = require('./restrainGroup');
const { System } = require('../config')
const { Strategy, RoundResult } = require('../db');
const { mailTo } = require('../tool/sendEmail')
const { requester } = require('../tool/Requester')

module.exports = class TacticsHelper {
    constructor(tactices) {
        this.tactices = tactices;
    }

    /**通过深度图获取可能最终成交的理论交易模型和理论均价 */
    getTheoryPrice(amount) {
        let _amount = 0;
        let total = 0, avePrive = 0;
        let tradesList = [];
        for (let i = 0; i < this.tactices.depth.bids.length; i++) {
            const item = this.tactices.depth.bids[i];
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
        return {
            tradesList,
            avePrive
        };
    }
    /**获取瞬时市场价格(应该只用于检测入场的时候使用这个，在卖出的时候都应该通过深度图获取理论交易价来判断) */
    async getPresentPrice(newPrice) {
        if (this.tactices.presentPrice && !newPrice) return this.tactices.presentPrice;
        try {
            // console.log(await client.prices({ symbol: 'ETHUSDT' }));
            // const allPrice = await client.prices({ symbol: this.tactices.symbol });
            // this.tactices.presentPrice = allPrice[this.tactices.symbol];
            // return allPrice[this.tactices.symbol];
            const result = await requester({
                url: 'ticker/price',
                params: { symbol: this.tactices.symbol },
                option: { failedBack: (error) => console.error(error) }
            });
            return Number(result.res.data.price);
        } catch (e) {
            console.log('获取最新价格失败:' + e)
            return this.tactices.presentPrice;
        }
    }
    /**根据步长取小数 */
    getDecimalsForCount(quantity) {
        const stepSize = +this.tactices.symbolInfo.filters.find(item => item.filterType === 'LOT_SIZE').stepSize;
        let sizeStep = 0;
        while (stepSize * Math.pow(10, sizeStep) < 1) { sizeStep++; }
        return +quantity.toFixed(sizeStep);
    }
    /**重置基本参数 */
    resetParam(key) {
        if (key) {
            this.tactices.parameter[key] = this.tactices.parameterBackup[key];
        } else {
            this.tactices.parameter = Object.assign({}, this.tactices.parameterBackup);
        }
    }
    /**获取波动速度列表，level是取最近的变更值深度，越深越准，值必须大于等于1，小于等于20 */
    getWaveSpeedList(level) {
        if (this.tactices.presentSpeedArr.length <= 1) return [];
        const deep = this.tactices.presentSpeedArr.length - level <= 0 ? 0 : this.tactices.presentSpeedArr.length - level
        const arr = [...this.tactices.presentSpeedArr].splice(deep);
        let speedArr = [];
        arr.reduce((pre, cur) => {
            //console.log(pre,cur);
            speedArr.push((cur - pre) / cur);
            return cur;
        })
        // for (let i = 0, l = arr.length; i < l; i++) {
        //     if (i !== 0) {
        //         speedArr.push((arr[i] - arr[i - 1]));
        //     }
        // }
        return speedArr;
    }
    /**获取5分线平均波动率,symbol可以为空 */
    getAverageWave(symbol) {
        const symbolObj = symbolStorage[symbol || this.tactices.symbol];
        if (!symbolObj) return 0;
        const { klineData5m } = symbolObj;
        let total = 0;
        //klineData.reduce((per, cur) => { }, klineData[0]);
        klineData5m.forEach(item => {
            total += Math.abs((item[1] - item[4]) / item[1]);
            //total += Math.abs(item[1] - item[4]);
        });
        return total / klineData5m.length;
    }
    /**按照策略重置参数,id为空时会调用自身的ID查询策略 */
    async setStrategy(id) {
        if (!id && !this.tactices.strategy.id) {
            console.error('策略应用失败：id不存在');
            return false;
        }
        //else if (this.tactices.strategy.id === id) return; 可能是重置策略，所以这里不能限制
        const strategys = (await Strategy.find({ _id: id || this.tactices.strategy.id }));
        if (strategys.length === 0) {
            console.error(`已应用策略不存在或被删除（${id || this.tactices.strategy.id}）`);
            this.tactices.addHistory('info', `已应用策略不存在或被删除`, true, { isMap: true });
            return;
        }
        const _strategy = strategys[0];
        if (_strategy.version !== System.version) {
            console.error('策略版本不对应，无法应用');
            this.tactices.addHistory('info', `策略版本不对应，无法应用`, true, { isMap: true });
            return;
        }
        const { name, version } = _strategy;
        this.tactices.strategy = { id: _strategy.id, name, version };
        this.tactices.parameter = Object.assign({}, _strategy.options.parameter);
        this.tactices.loadUpBuyHelper = Object.assign(this.tactices.loadUpBuyHelper, _strategy.options.loadUpBuyHelper);
        this.tactices.advancedOption = Object.assign(this.tactices.advancedOption, _strategy.options.advancedOption);
        this.tactices.addHistory('info', `已应用策略-${_strategy.name}`, true, { isMap: true });
    }
    async roundBegin() {
        await RoundResult.create({
            symbol: this.tactices.symbol, isDone: false,
            tid: this.tactices.id, uid: this.tactices.uid, roundId: this.tactices.roundId,
            exchangeQueue: [],
            profit: this.tactices.getProfit(),
            startTime: Date.parse(new Date()), endTime: '', strategyId: this.tactices.strategy.id || '',
            inCosting: this.tactices.presentDeal.inCosting, outCosting: 0, commission: 0,
            loadUpBuy: []
        }, e => {
            console.log('新增RoundResult失败', e);
        });
        this.tactices.loadUpBuyHelper.lightenMod = false;//关闭减仓模式
        this.tactices.roundRunStartTime = this.tactices.loadUpBuyHelper.lastLoadUpTime = Date.parse(new Date());//重置开始时间
        require('./TacticesLauncher').getInstance().pushRoundResultInform(this.tactices.uid, this.tactices.id, 'roundBegin');
    }
    async roundEnd() {
        const thisExchangeQueue = this.tactices.exchangeQueue.filter(item => item.roundId === this.tactices.roundId);
        const commissionTotal = thisExchangeQueue.reduce((pre, cur) => pre + cur.commission, 0);
        await RoundResult.findOneAndUpdate({ roundId: this.tactices.roundId }, {
            isDone: true,
            exchangeQueue: thisExchangeQueue, profit: this.tactices.getProfit(),
            endTime: Date.parse(new Date()), strategyId: this.tactices.strategy.id || '',
            inCosting: this.tactices.presentDeal.inCosting,
            outCosting: this.tactices.presentDeal.outCosting, commission: commissionTotal,
            loadUpBuy: this.tactices.loadUpBuyHelper.loadUpList.filter(item => item.roundId === this.tactices.roundId)
        }, e => {
            console.log('更新RoundResult失败', e);
        });
        const elapsedTime = (Date.parse(new Date()) - this.tactices.roundRunStartTime) / 60000
        const now = Date.parse(new Date());
        //清除3小时前但不是该交易回合的交易
        this.tactices.exchangeQueue = this.tactices.exchangeQueue.filter(item => !((now - item.dealDate) > 10800000 && item.roundId !== this.tactices.roundId));
        this.tactices.loadUpBuyHelper.roundEnd();
        await this.tactices.doHistoryStatistics();
        mailTo({
            content:
                `<p>回合ID：${this.tactices.roundId}</p>
                <p>投入成本：${this.tactices.presentDeal.inCosting}</p>
                <p>回收成本：${this.tactices.presentDeal.outCosting}</p>
                <p>耗时：${parseInt(elapsedTime / 60)}时${parseInt(elapsedTime % 60)}分</p>
                <p>本次盈亏：${this.tactices.presentDeal.outCosting - this.tactices.presentDeal.inCosting}</p>
                <p>历史总盈亏：${this.tactices.historyStatistics.totalProfit}</p>`,
            subject: `任务“${this.tactices.name}”(${this.tactices.symbol})完成回合交易`
        });
        this.tactices.roundId = this.tactices.getNewId('r_'); //下一回合
        require('./TacticesLauncher').getInstance().pushRoundResultInform(this.tactices.uid, this.tactices.id, 'roundEnd');
    }
}