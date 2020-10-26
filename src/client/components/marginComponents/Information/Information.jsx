


import React from 'react';
import { Popconfirm, Switch, Radio, Button, message, Popover, Modal } from 'antd';
import './style.less'

export default function Information() {
    return <>
        <ul>
            <li>
                空/亏盈亏：18/36U
            </li>
            <li>
                合计盈利：54U
            </li>
            <li>
                平多/平空次数：5/4
            </li>
            <li>
                当前耗时：5h21m
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