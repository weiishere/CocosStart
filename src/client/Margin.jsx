import React from 'react'
import { Row, Col, message } from 'antd';
import { connectScoket } from '@client/webscoketInstance'
import EventHub from '@client/EventHub'
import { WsRoute } from '@src/config'
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import { apiDateCode, System } from '@src/config';
import KLineMargin from '@components/marginComponents/KLineMargin'
import LongShort from '@components/marginComponents/LongShort'
import RecordList from '@components/marginComponents/RecordList'
import ControlPanel from '@components/marginComponents/ControlPanel'
import PlusMinus from '@components/marginComponents/PlusMinus'
import Information from '@components/marginComponents/Information'
import './style/marginStyle.less'

export default function Margin() {
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