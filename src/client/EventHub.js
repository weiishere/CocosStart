/*
 * @Author: weishere.huang
 * @Date: 2020-07-26 01:19:47
 * @LastEditTime: 2020-07-29 02:03:45
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */


export default class EventHub {
    constructor() {
        this.EventList = [];
    }
    static getInstance() {
        if (!this.EventList) {
            this.EventList = new EventHub();
        }
        return this.EventList;
    }
    /**
     * @description: 监听（订阅）事件
     * @param {type} 
     * @return: 
     */
    addEventListener(name, listener) {
        //if (this.EventList.find(item => item.name === name)) return;
        this.EventList.push({ name, listener });
    }
    /**
     * @description: 取消监听（订阅）
     * @param {type} 
     * @return: 
     */
    removeEventListener(name) {
        this.EventList = this.EventList.filter(event => event.name !== name)
    }
    /**
     * @description: 发布事件消息
     * @param {type} 
     * @return: 
     */
    dispatchEvent(name, message) {
        this.EventList.filter(event => event.name === name)
            .map(event => event.listener)
            .forEach(listener => listener(message))
    }
}