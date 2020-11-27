/*
 * @Author: weishere.huang
 * @Date: 2020-10-29 01:45:15
 * @LastEditTime: 2020-10-31 18:41:26
 * @LastEditors: weishere.huang
 * @Description: 
 * @symbol_custom_string_obkoro1: ~~
 */
module.exports = class Rnflexion {
    constructor(name, direction, baseRate, autoLevelFn) {
        this.baseRate = baseRate;//基本值（用于自定义配置）
        this.amount = 0;//拐点量（最大变化宽容值）
        this.level = 5;//敏感级别（用于程序自动配置）------------------注意！！！！！！！！！！！！默认拐点为0.01，敏感级别为5，也就是0.002，也就是一个0.2个点就触发
        this.direction = direction;//up：动线向上触发;down：动线向下触发
        this.name = name;
        this.signPrice = 0;//标示值
        this.autoLevelFn = autoLevelFn || ((level) => level);//自动根据具体情况调整level
        this.isSetndRun = false;//防止重复
        this.lowPrice = 0;
        this.highPrice = 0;
    }
    /**设置起点，按理说执行了一次，如果未发生触发，则不允许再修改（onframe会动态更新起点值），第二个参数设为true，则强制更新 */
    setOrigin(price, isForce) {
        this.signPrice = this.lowPrice = this.highPrice = price;
        this.setSensitivityLevel();
        this.setRnflexionAmount(price);
    }
    //敏感度设置1~10级，越大越敏感，用于程序动态变更
    setSensitivityLevel(level) {
        this.level = this.autoLevelFn(level || this.level);
        //this.setRnflexionAmount(price);
    }
    onframe(markPrice) {
        //上下挤压最大值和最小值
        //let isUpadatesSignPrice = false;
        if (this.lowPrice === 0 || markPrice < this.lowPrice) {
            //跌破最小值
            this.lowPrice = markPrice;
            //跌破最小值，若是上拐点检测，则需要更新参考标识值到最低值
            this.direction === 'up' && (this.signPrice = markPrice);
        }
        if (this.highPrice === 0 || markPrice > this.highPrice) {
            //冲破最大值
            this.highPrice = markPrice;
            //冲破最大值，若是下拐点检测，则需要更新参考标识值到最低值
            this.direction === 'down' && (this.signPrice = markPrice);
        }
        this.isSetndRun = false;
    }
    /**设置拐点宽容量 */
    setRnflexionAmount(price) {
        this.amount = price * this.baseRate * (0.01 / this.level);
        return this.amount;
    }
    /**是否触发 */
    trigger(price, level) {
        if (this.amount === 0) return false;//可能还未设置拐点量
        if (level) this.setSensitivityLevel(level);
        const result = (this.direction === 'up' ? price - this.signPrice : this.signPrice - price) > this.amount ? true : false;
        
        return result;
    }
}