import React from 'react'
import { Row, Col, message } from 'antd';
import { connectScoket } from '@client/webscoketInstance'
import EventHub from '@client/EventHub'
import { WsRoute } from '@src/config'
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import { apiDateCode, System } from '@src/config';
import KLineMargin from '@components/Macd/KLineMargin'
import ControlPanel from '@components/Macd/ControlPanel'
import RecordList from '@components/hedgeMarginComponents/RecordList'
import PlusMinus from '@components/hedgeMarginComponents/PlusMinus'
import Information from '@components/hedgeMarginComponents/Information'
import './style/marginStyle.less'

export default function MacdMargin() {
    return <div className='marginWrapper'>
        <div className='k-line-mobile'>
            <KLineMargin />
            <ControlPanel/>
        </div>
    </div>
}