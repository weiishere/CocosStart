import React from 'react'
import { Row, Col, message } from 'antd';
import { connectScoket } from '@client/webscoketInstance'
import EventHub from '@client/EventHub'
import { WsRoute } from '@src/config'
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import { apiDateCode, System } from '@src/config';
import KLineMargin from '@components/HedgeMarginComponents/KLineMargin'
import LongShort from '@components/HedgeMarginComponents/LongShort'
import RecordList from '@components/HedgeMarginComponents/RecordList'
import ControlPanel from '@components/HedgeMarginComponents/ControlPanel'
import PlusMinus from '@components/HedgeMarginComponents/PlusMinus'
import Information from '@components/HedgeMarginComponents/Information'
import './style/marginStyle.less'

export default function HedgeMargin() {
    return <div className='marginWrapper'>
        <div className='k-line-mobile'>
            <KLineMargin />
        </div>
        <div className='longShort'>
            <LongShort />
        </div>
        <div className='recordList'>
            <RecordList />
        </div>
        <div className='controlPanel'>
            <ControlPanel />
        </div>
        <div className='plusMinus'>
            <PlusMinus />
        </div>
        <div className='information'>
            <Information/>
        </div>
    </div>
}