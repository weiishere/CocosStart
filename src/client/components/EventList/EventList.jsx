/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-10-09 19:34:31
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import { Table, Button } from 'antd'
import dateFormat from 'format-datetime'
import './style.less'
import EventHub from '@client/EventHub'


const stringTemplate = {
    buyIn: ({ name, eventTime, inCosting }) => {
        return `【入场】“${name}”于${dateFormat(new Date(eventTime), "dd日HH:mm:ss")}完成入场，入场金额${inCosting.toFixed(4)}U`
    },
    loadUp: ({ name, index, eventTime, inCosting }) => {
        retuen`【补仓】“${name}”于${dateFormat(new Date(eventTime), "dd日HH:mm:ss")}进行第${index}次补仓，补仓金额${inCosting.toFixed(4)}U`
    },
    LightenUp: ({ name, eventTime, outCosting }) => {
        return `【减仓】“${name}”于${dateFormat(new Date(eventTime), "dd日HH:mm:ss")}进行第${index}次减仓，减仓金额${outCosting.toFixed(4)}U`
    },
    sellOut: ({ name, eventTime, benginTime, inCosting, profit }) => {
        const elapsedTimeSim = eventTime - benginTime;
        let elapsedTime = parseInt(elapsedTimeSim / 60) + '时' + parseInt(elapsedTimeSim % 60) + '分';
        return `【出场】“${name}”于${dateFormat(new Date(eventTime), "dd日HH:mm:ss")}完成离场，出场金额${inCosting.toFixed(4)}U，盈利:${profit.toFixed(4)}，耗时${elapsedTime}`;
    },
    switchSymbol: ({ name, eventTime, symbol }) => {
        return `【切币】“${name}”于${dateFormat(new Date(eventTime), "dd日HH:mm:ss")}成功切币至${symbol}`
    }
}
export default function EventList() {
    React.useEffect(() => {


    }, []);
    return <div id='eventList'>
        EventList
    </div>
}