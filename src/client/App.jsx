/*
 * @Author: weishere.huang
 * @Date: 2020-07-23 15:09:27
 * @LastEditTime: 2020-08-12 17:49:34
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */


import React from 'react'
import { Row, Col, message } from 'antd';
import MultipleWatch from '@components/MultipleWatch'
import KLine from '@components/KLine'
import PlusMinus from '@components/PlusMinus'
import HistoryRecord from '@components/HistoryRecord'
import Rate from '@components/Rate'
import BSLine from '@components/BSLine'
import Income from '@components/Income'
import IncomeUnit from '@components/IncomeUnit'
import ControlPanel from '@components/ControlPanel'
import Login from './Login'
import { connectScoket } from '@client/webscoketInstance'
import EventHub from '@client/EventHub'
import { WsRoute } from '@src/config'
import { requester } from '@src/tool/Requester'
import { switchTactics, getQueryString } from '@client/utils'
import api from '@client/api';
import { apiDateCode } from '@src/config';
import './style/style.less'

const getHash = () => {
    let hash = location.hash + '';
    return hash.substring(1, hash.length);
}
export default function App() {
    const [tacticeName, setTacticeName] = React.useState('');
    const [symbol, setSymbol] = React.useState('');
    const [user, setUser] = React.useState(null);
    React.useEffect(() => {
        const uid = getQueryString('uid');
        //加载选中币

        EventHub.getInstance().addEventListener('switchTactics', payload => {
            setTacticeName(payload.name);
            setSymbol(payload.symbol);
            connectScoket(res.data.data.id, getHash()).then(scoket => {
                scoket.on(WsRoute.TACTICS_LIST, data => {
                    //广播mapTacticsList
                    EventHub.getInstance().dispatchEvent('mapTacticsList', data);
                });
                scoket.on(WsRoute.KLINE_DATA, data => {
                    //广播kline数据
                    EventHub.getInstance().dispatchEvent('klineData', data);
                });
                scoket.emit('bindTid', { scoketId: scoket.id, tid: getHash() });
            });
        });

        if (uid) {
            //请求用户信息
            const key = 'laoding-1'
            message.loading({ content: '请求用户信息..', key, duration: 0 });
            requester({
                url: api.getUser, params: { uid }, option: {
                    baseUrl: 'API_server_url',
                    failedBack: (error) => message.error({ content: '用户信息请求错误', key, duration: 2 })
                }
            }).then(({ res }) => {
                message.destroy();
                if (res.data.code === apiDateCode.success) {
                    switchTactics(uid, getHash());
                }
                setUser(res.data.code === apiDateCode.success ? res.data.data : null);
            })
        } else {
            setUser(null);
        }
    }, []);

    return <div className='layout'>
        {user == null ? <Login /> :
            <>
                <Row style={{ height: '40%' }}>
                    <Col span={8} style={{ height: '100%' }}>
                        <MultipleWatch uid={user.id} />
                    </Col>
                    <Col span={8} style={{ height: '100%' }}>
                        <span className='head-title'>控制面板-({tacticeName}-{symbol})</span>
                        <section className='customerWrap'>
                            <div><ControlPanel uid={user.id} /></div>
                            <div>
                                <HistoryRecord uid={user.id} />
                            </div>
                        </section>
                    </Col>
                    <Col span={8} style={{ height: '100%' }}>
                        <KLine />
                    </Col>
                </Row>
                <Row style={{ height: '60%' }}>
                    <Col span={8}>
                        <Row style={{ height: '45%' }}>
                            <Col span={24}><PlusMinus /></Col>
                        </Row>
                        <Row style={{ height: '55%' }}>
                            <Col span={24}><Rate /></Col>
                        </Row>
                    </Col>
                    <Col span={8} style={{ border: 'solid 1px #666' }}>
                        <BSLine />
                    </Col>
                    <Col span={8}>
                        <Row style={{ height: '50%' }}>
                            <Col span={24}><Income /></Col>
                        </Row>
                        <Row style={{ height: '50%' }}>
                            <Col span={18}>
                                <IncomeUnit />
                            </Col>
                            <Col span={6}>
                                <div className='statistics'>
                                    <span className='head-title'>收益统计</span>
                                    <p>上次：￥4</p>
                                    <p>本小时：￥10</p>
                                    <p>今日：￥64</p>
                                    <p>24小时：￥7234</p>
                                    <p>本周：￥7234</p>
                                    <p>本月：￥19902</p>
                                    <p>总收益：￥244322</p>
                                    <p>收益/投入/日：0.033%</p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        }
    </div>
}






if (("onhashchange" in window) && ((typeof document.documentMode === "undefined") || document.documentMode == 8)) {
    // 浏览器支持onhashchange事件
    window.onhashchange = () => {
        let hash = location.hash + '';
        switchTactics(getQueryString('uid'), hash.substring(1, hash.length));
    };  // TODO，对应新的hash执行的操作函数
}