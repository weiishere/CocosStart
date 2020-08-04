/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 00:05:32
 * @LastEditTime: 2020-08-04 17:40:42
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'
import './style.less'

export default function HistoryRecord() {
    const [history, setHistory] = React.useState([]);
    const [stateStr, setStateStr] = React.useState("");
    React.useEffect(() => {
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target) setHistory(target.history || []);
            const ele = document.querySelector("#history_record_wrap");
            ele.scrollTop = ele.scrollHeight;
            if (target && target.runState) {
                if (target.buyState) {
                    setStateStr(`出场检测中，买入价格：${target.presentDeal.payPrice}`);
                } else {
                    setStateStr('入场检测中...');
                }
            } else {
                setStateStr('未运行');
            }
        });
    }, [])
    return (<><div className='run_state_wrap'>运行状态：{stateStr}</div><ul id="history_record_wrap" className='history_record'>
        {history.map((item,i) => <li key={i} className='history_record_item'>
            <div>{dateFormat(new Date(item.time), "HH:mm:ss")}</div>
            <div>
                {
                    (() => {
                        switch (item.type) {
                            case 'buy':
                                return <div style={{ color: 'red' }}>买入{item.content.symbol.replace('USDT', '')}{item.content.dealAmount}枚，价格:{item.content.price}</div>

                            case 'sell':
                                return <div style={{ color: 'green' }}>卖出{item.content.symbol.replace('USDT', '')}{item.content.dealAmount}枚，
                                价格:{item.content.price}，卖出成本{item.contentcostPrice}，盈亏:{item.content.profit}</div>
                            case 'info':
                                return item.content
                            default:
                                return item.content
                        }
                    })()
                }
            </div>
        </li>)}

    </ul></>)
}