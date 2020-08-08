/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 00:05:32
 * @LastEditTime: 2020-08-08 17:31:39
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
    const [runState, setRunState] = React.useState(false);
    let isToBottom = true;
    let updateCount = 0;
    React.useEffect(() => {
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target) {
                setRunState(target.imitateRun);
                setHistory(target.history || []);
            }

            const ele = document.querySelector("#history_record_wrap");
            // isToBottom = Math.abs(ele.scrollTop + ele.clientHeight - ele.scrollHeight) <= 20;
            // window.setTimeout(() => {
            //     //console.log(isToBottom)
            //     if (isToBottom) {
            //         var h = $(ele).height();
            //         $(ele).scrollTop(h);
            //     };
            // }, 100);
            // if (updateCount === 0) ele.scrollTop = ele.scrollHeight-ele.clientHeight;
            // updateCount++;

            //if (isToBottom) ele.scrollTop = ele.scrollHeight;
            ele.scrollTop = ele.scrollHeight;
            if (target && target.runState) {
                if (target.buyState) {
                    setStateStr(`出场检测中，交易信息≈${(+(+target.presentDeal.payPrice).toFixed(5)) }U/${+(+target.presentDeal.amount.toFixed(5))}枚`);
                } else {
                    setStateStr('入场检测中...');
                }
            } else {
                setStateStr('未运行');
            }
        });
        EventHub.getInstance().addEventListener('switchTactics', payload => {
            updateCount = 0;
        })
    }, [])
    return (<><div className='run_state_wrap'>运行状态{runState ? '(模拟)' : ''}：{stateStr}</div><ul id="history_record_wrap" className='history_record'>
        {history.map((item, i) => <li key={i} className='history_record_item'>
            <div>{dateFormat(new Date(item.time), "HH:mm:ss")}</div>
            <div>
                {
                    (() => {
                        switch (item.type) {
                            case 'buy':
                                return <div style={{ color: 'red' }}>买入{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                均价:{Number(item.content.price)} U，成本{item.content.costing} U</div>

                            case 'sell':
                                return <div style={{ color: 'green' }}>卖出{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                均价:{Number(item.content.price)}，回本{item.content.costing} U，盈亏:{item.content.profit} U</div>
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