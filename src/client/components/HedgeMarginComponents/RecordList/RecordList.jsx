

import React from 'react';
import { Popconfirm, Switch, Radio, Button, message, Popover, Modal } from 'antd';
import './style.less'

export default function RecordList() {
    return <>
        <div class='mainList'>
            <ul id="history_record_wrap">
                <li className='history_record_item'>
                    <div>12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
            </ul>
            <div>
                <span className='long'>多:12536</span>
                <span className='price'>动:12530</span>
                <span className='short'>空:12400</span>
                <hr />
                <span className='info'>方向:空</span>
                <span className='info'>动作:补仓</span>
                <span className='info'>盈亏:23U</span>
                <hr />
                <span className='info'>设定值:20</span>
                <span className='info'>拐点量:15</span>
                <span className='info'>临界:15252</span>
            </div>
        </div>
        <div>
            <table style={{ width: '100%' }}>
                <tr>
                    <td>
                        <div>
                            <Radio.Group>
                                <Radio value={1}>All</Radio>
                                <Radio value={2}>动作</Radio>
                                <Radio value={3}>空</Radio>
                                <Radio value={4}>多</Radio>
                            </Radio.Group>
                        </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        300条 <label><Switch size="small" style={{  }}
                            onChange={() => { }} />自动置底</label>
                    </td>
                </tr>
            </table>


        </div>
    </>
}