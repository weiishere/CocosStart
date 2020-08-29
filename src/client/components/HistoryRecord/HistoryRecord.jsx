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
import { Scrollbars } from 'react-custom-scrollbars'
import './style.less'

export default function HistoryRecord() {
    const [history, setHistory] = React.useState([]);
    const [stateStr, setStateStr] = React.useState("");
    const [runState, setRunState] = React.useState(false);
    const scrollbars = React.useRef(null);
    let isToBottom = true;
    let updateCount = 0;

    React.useEffect(() => {
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target) {
                setRunState(target.imitateRun);
                setHistory(target.history || []);
            }
            const { scrollTop, top } = scrollbars.current.getValues();
            //console.log(top)
            if (scrollTop === 0 || top > 0.9) {
                window.setTimeout(() => {
                    
                    scrollbars.current.scrollToBottom();
                }, 100);
                
            }
            // if (scrollTop === 0 || scrollTop + clientHeight > scrollHeight) {
            //     scrollbars.current.scrollToBottom();
            // }
            // const ele = document.querySelector("#history_record_wrap");
            // ele.scrollTop = ele.scrollHeight;
            if (target && target.runState) {
                if (target.buyState) {
                    setStateStr(`出场检测中，交易信息≈${(+(+target.presentDeal.payPrice).toFixed(5))}U/${+(+target.presentDeal.amount.toFixed(5))}枚`);
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
    const renderThumb = ({ style, ...props }) => {
        const thumbStyle = { backgroundColor: `rgba(255,255,255,0.6)`, borderRadius: '3px' };
        return (<div style={{ ...style, ...thumbStyle }}  {...props} />);
    }
    return (<><div className='run_state_wrap'>运行状态{runState ? '(模拟)' : ''}：{stateStr}</div>
        <Scrollbars
            autoHide
            renderThumbVertical={renderThumb}
            style={{ height: 'calc(100% - 1.5rem)' }}
            ref={scrollbars}
            onUpdate={(value) => {
                //console.log(value);
                //setTop(top);
            }}
        >
            <ul id="history_record_wrap" className='history_record'>
                {history.map((item, i) => <li key={item.time} className='history_record_item'>
                    <div>{dateFormat(new Date(item.time), "HH:mm:ss")}</div>
                    <div>
                        {
                            (() => {
                                switch (item.type) {
                                    case 'buy':
                                        return <div style={{ color: item.color || '#999' }}>买入{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                均价:{Number(item.content.price)} U，成本{item.content.costing} U</div>
                                    case 'sell':
                                        return <div style={{ color: item.color || '#999' }}>卖出{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                均价:{Number(item.content.price)}，回本{item.content.costing} U，盈亏:{item.content.profit} U</div>
                                    case 'info':
                                        return <div style={{ color: item.color || '#999' }}>{item.content}</div>
                                    default:
                                        return item.content
                                }
                            })()
                        }
                    </div>
                </li>)}

            </ul>
        </Scrollbars></>)
}