import React from 'react'
import { Row, Col, message } from 'antd';
import { connectScoket } from '@client/webscoketInstance'
import EventHub from '@client/EventHub'
import { WsRoute } from '@src/config'
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import { apiDateCode, System } from '@src/config';
import KLine from '@components/marginComponents/KLine'
import LongShort from '@components/marginComponents/LongShort'
import './style/marginStyle.less'

export default function Margin() {
    return <div className='marginWrapper'>
        <div className='kline'>
            <KLine />
        </div>
        <div className='longShort'>
            <LongShort />
        </div>
    </div>
}