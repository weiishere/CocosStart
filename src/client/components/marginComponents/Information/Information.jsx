


import React from 'react';
import { Popconfirm, Switch, Radio, Button, message, Popover, Modal } from 'antd';
import './style.less'

export default function Information() {
    return <>
        <ul>
            <li>
                当前合计盈亏：236U
            </li>
            <li>
                当前以耗时：5h21m
            </li>
            <li>
                总完成回合：16
            </li>
            <li>
                历史总盈亏：844U
            </li>
        </ul>
    </>
}