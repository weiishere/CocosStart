/*
 * @Author: weishere.huang
 * @Date: 2020-10-30 01:51:56
 * @LastEditTime: 2020-10-31 00:39:56
 * @LastEditors: weishere.huang
 * @Description: 
 * @symbol_custom_string_obkoro1: ~~
 */
module.exports = class LoadUpHelper {
    // loadUpOfDiff: 300,//触发补仓的双线差值
    // loadUpStep: 0.2,//补仓步进值
    // maxBuying: 2,//最大买入值
    constructor(margin) {
        this.margin = margin;
        this.longLoadUpQue = 0;//多方已补仓数量
        this.shortLoadUpQue = 0;//空方已补仓数量
        this.disable = false;//是否暂时禁用
        this.eventTime = Date.parse(new Date());
        //this.rebindParam();
    }
    /**重新绑定参数，已及时更新最新的参数 */
    // rebindParam() {
    //     const { loadUpMod, loadUpOfDiff, loadUpStep, maxBuying } = this.margin.parameter;
    //     this.loadUpMod = loadUpMod;//同步模式sync、异步模式async
    //     this.loadUpOfDiff = loadUpOfDiff;
    //     this.loadUpStep = loadUpStep;
    //     this.maxBuying = maxBuying;
    // }
    /**
     * {
     * position: 'long',//short,both
     * action: 'sell'
     * }
     */
    run() {
        //this.rebindParam();
        const result = {
            position: '',
            action: ''
        };
        
        if (this.margin.parameter.loadUpOff || this.margin.parameter.loadUpOfDiff > (this.margin.positionLong.avgPrice - this.margin.positionShort.avgPrice)) {
            //不满足补仓基本条件(补仓开关和双线最大差值)
            return result;
        }
        const nowDate = Date.parse(new Date());
        if (nowDate - this.eventTime < 60000 * this.margin.parameter.loadupInterval) {
            //this.tactices.addHistory('info', `离上次补仓时间不及${this.loadupInterval}分钟，暂不做补仓检测...`, true, { color: "#759AA0", tempMsg: true, subType: 'lub' });
            return result;
        }
        //正常情况下，动线在多线下，空线上，才进行补仓判断
        if (this.margin.lineStatus === 'longShort') {
            if (this.loadUpMod === 'sync') {
                //同步补仓
                return {
                    position: 'both',
                    action: 'buy'
                }
            } else {
                //异步补仓，检测离那条线最近，然后反向补仓，然后尽快补仓另外一方(调大敏感度)
                if (this.margin.positionLong.avgPrice - this.margin.priceInfo.markPrice < this.margin.parameter.loadUpOfDiff / 20) {
                    //离多线近，空方补仓，且将多方补仓调敏感
                    this.margin.positionLong.rnflexion_buy.setOrigin(this.margin.priceInfo.markPrice);
                    this.margin.positionLong.rnflexion_buy.setSensitivityLevel(5);
                    return {
                        position: 'short',
                        action: 'buy'
                    }
                } else if (this.margin.priceInfo.markPrice - this.margin.positionShort.avgPrice < this.margin.parameter.loadUpOfDiff / 20) {
                    //离空线近，多方补仓，且将空方补仓调敏感
                    this.margin.positionShort.rnflexion_buy.setOrigin(this.margin.priceInfo.markPrice);
                    this.margin.positionShort.rnflexion_buy.setSensitivityLevel(5);
                    return {
                        position: 'long',
                        action: 'buy'
                    }
                }
            }
        }
        return result;
    }
}