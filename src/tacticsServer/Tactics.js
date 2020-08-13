/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:43:33
 * @LastEditTime: 2020-07-27 18:42:00
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const uuid = require('uuid');

module.exports = class Tactics {
    constructor(uid, name, parameter) {
        this.name = name;
        this.uid = uid;
        this.parameter = parameter;
        this.id = uuid.v1()
    }
    powerSwitch(order) {

    }
}

