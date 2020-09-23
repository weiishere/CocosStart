/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 11:43:33
 * @LastEditTime: 2020-09-23 20:13:48
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
        this.strategy = {};//应用的策略(id:123,name:'')
        this.id = uuid.v1()
    }
    
}

