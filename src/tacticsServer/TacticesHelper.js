/*
 * @Author: weishere.huang
 * @Date: 2020-09-016 18:19:58
 * @LastEditTime: 2020-09-17 17:57:01
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { client } = require('../lib/binancer');

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
            const allPrice = await client.prices();
            this.tactices.presentPrice = allPrice[this.tactices.symbol];
            return allPrice[this.tactices.symbol];
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
        const arr = [...this.tactices.presentSpeedArr].splice(this.tactices.presentSpeedArr.length - level + 2);
        let speedArr = [];
        for (let i = 0, l = arr.length; i < l; i++) {
            if (i !== 0) {
                speedArr.push((arr[i] - arr[i - 1]));
            }
        }
        return speedArr;
    };
}