

import React from 'react';
import { Popconfirm, Switch, Radio, Button, message, Popover, Modal } from 'antd';
import './style.less'

export default function RecordList() {
    return <>
        <div class='mainList'>
            <ul id="history_record_wrap">
                <li className='history_record_item'>
                    <div>10-11 12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>10-11 12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>10-11 12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
                <li className='history_record_item'>
                    <div>10-11 12:22:10</div>
                    <div>
                        这是消息消息消息消息
                </div>
                </li>
            </ul>
            <div>

            </div>
        </div>
        <div>
            <Radio.Group>
                <Radio value={1}>所有</Radio>
                <Radio value={2}>动作</Radio>
                <Radio value={3}>动作-空</Radio>
                <Radio value={4}>动作-多</Radio>
            </Radio.Group>
        </div>
    </>
}