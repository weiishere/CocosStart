/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 00:05:32
 * @LastEditTime: 2020-09-30 16:43:31
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'
import { Scrollbars } from 'react-custom-scrollbars'
import { ClearOutlined, QuestionOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Popconfirm, Switch, Radio, Button, message, Popover, Modal } from 'antd';
import { requester } from '@src/tool/Requester'
import { apiDateCode } from '@src/config'
import api from '@client/api'
import './style.less'

export default function HistoryRecord() {
    const [history, setHistory] = React.useState([]);
    const [historyBackup, setHistoryBackup] = React.useState([]);
    const [stateStr, setStateStr] = React.useState("");
    const [runState, setRunState] = React.useState(false);
    const [presentDealModal, setPresentDealModal] = React.useState(false);
    const [isGoBottom, setIsGoBottom] = React.useState(true);
    const [msgListType, setMsgListType] = React.useState(1);
    const [tactics, setTactics] = React.useState(null);
    const scrollbars = React.useRef(null);
    const [chooseTid, setChooseTid] = React.useState('');
    let updateCount = 0;

    React.useEffect(() => {
        EventHub.getInstance().addEventListener('mapTacticsList', 'hr_mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            //setPresentDeal(null);
            setTactics(target);
            if (target) {
                if (chooseTid !== target.id) setChooseTid(target.id);
                setRunState(target.imitateRun);
                if (target.runState) {
                    if (target.buyState) {

                        setStateStr(`出场检测中，交易信息≈${(+(+target.presentDeal.dealPrice).toFixed(5))}U/${+(+target.presentDeal.amount.toFixed(5))}枚`);
                    } else {
                        setStateStr(`第${target.checkBuyTime}次入场检测...`);
                    }
                } else {
                    setStateStr('未运行');
                }
            }
        });
        EventHub.getInstance().addEventListener('switchTactics', 'hr_switchTactics', payload => {
            updateCount = 0;
        })
        EventHub.getInstance().addEventListener('historyRecord', 'hr_historyRecord', payload => {
            setHistory(getRecordList(payload.history || []));
            setHistoryBackup(payload.history);
            const { scrollTop, top } = scrollbars.current.getValues();
            if (scrollTop === 0 || top > 0.9) {
                window.setTimeout(() => { }, 100);
            }
            isGoBottom && scrollbars.current.scrollToBottom();
        });
        return () => {
            EventHub.getInstance().removeEventListener('mapTacticsList', 'hr_mapTacticsList');
            EventHub.getInstance().removeEventListener('switchTactics', 'hr_switchTactics');
            EventHub.getInstance().removeEventListener('historyRecord', 'hr_historyRecord');
        }
    }, [isGoBottom, msgListType, historyBackup]);
    const renderThumb = ({ style, ...props }) => {
        const thumbStyle = { backgroundColor: `rgba(255,255,255,0.6)`, borderRadius: '3px' };
        return (<div style={{ ...style, ...thumbStyle }}  {...props} />);
    }
    const getRecordList = (recordList, type) => {
        const _type = type || msgListType;
        let result = [];
        if (_type === 1) {
            result = recordList;
        } else if (_type === 2) {
            result = recordList.filter(item => (item.type !== 'info' || item.color !== '#999'))
        } else if (_type === 3) {
            result = recordList.filter(item => (item.type === 'buy' || item.type === 'sell'))
        }
        // if (result.length >= 300) {
        //     result = result.splice(result.length - 300, 300);
        // }
        return result;
    }
    const changeSwitch = (ischeck) => {
        setIsGoBottom(ischeck);
    }
    const changeType = (e) => {
        setMsgListType(e.target.value);
        setHistory(getRecordList(historyBackup, e.target.value));
        window.setTimeout(() => { scrollbars.current.scrollToBottom(); }, 50);
    }
    const clearNormalInfo = (order) => {
        requester({
            url: api.clearNormalInfo,
            type: 'post',
            params: {
                tid: chooseTid,
                order
            },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => { message.error({ content: error, key, duration: 2 }); }
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) { message.info('清除信息完成~') }
        });
    }
    return (<><div className='run_state_wrap'>运行状态{runState ? '(模拟)' : ''}：{stateStr}</div>
        <Scrollbars
            autoHide
            renderThumbVertical={renderThumb}
            style={{ height: 'calc(100% - 2.6rem)' }}
            ref={scrollbars}
            onUpdate={(value) => {
                //console.log(value);
                //setTop(top);
            }}
        >
            <ul id="history_record_wrap" className='history_record'>
                {history.map((item, i) => <li key={item.time + '_' + i} className='history_record_item'>
                    <div>{dateFormat(new Date(item.time), "HH:mm:ss")}</div>
                    <div>
                        {
                            (() => {
                                switch (item.type) {
                                    case 'buy':
                                        return <div style={{ color: item.color || '#999' }}>【{item.content.signStr}】买入{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                买入均价:{Number(item.content.price)} U，入场成本{item.content.costing} U</div>
                                    case 'sell':
                                        return <div style={{ color: item.color || '#999' }}>【{item.content.signStr}】卖出{item.content.symbol.replace('USDT', '')}币{item.content.dealAmount}枚，
                                卖出均价:{Number(item.content.price)}，累计回本{item.content.costing} U，盈亏:{item.content.profit} U</div>
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
        </Scrollbars>
        <div className='operation_wrap'>
            {history.length}条 <label><Switch checked={isGoBottom} size="small" style={{ verticalAlign: 'sub' }}
                onChange={changeSwitch} />自动置底</label>&nbsp;
            {tactics && tactics.buyState && <InfoCircleOutlined style={{ color: '#fff', float: 'right', lineHeight: '1.7rem', margin: '0 0.5rem' }} onClick={() => { setPresentDealModal(true) }} />}
            <Popconfirm placement="top" title={`确认删除${['一般', '关键', '交易'][msgListType - 1]}记录？`} onConfirm={() => clearNormalInfo(msgListType)}
                okText="删除" cancelText="取消" icon={<QuestionOutlined />}>
                <Button style={{ color: '#fff', float: 'right' }} size='small' shape="link" icon={<ClearOutlined />} />
            </Popconfirm>


            {/* <Popconfirm placement="top" title='请选择清除记录范围？' onConfirm={() => clearNormalInfo(false)} onCancel={() => clearNormalInfo(true)}
                okText="流水" cancelText="全部" icon={<QuestionOutlined />}>
                <Button style={{ color: '#fff' }} size='small' shape="link" icon={<ClearOutlined />} />
            </Popconfirm> */}
            <Radio.Group style={{ float: 'right' }} onChange={changeType} value={msgListType}>
                <Radio size='small' value={1}>所有</Radio>
                <Radio value={2}>关键</Radio>
                <Radio value={3}>交易</Radio>
            </Radio.Group>
            <Modal
                title="当前交易信息"
                visible={presentDealModal}
                onCancel={() => { setPresentDealModal(false) }}
                footer={
                    <Button onClick={() => { setPresentDealModal(false) }}>关闭</Button>
                }
            >
                {tactics && tactics.buyState && <div className='presentDealWrap'>
                    <div><label>场内成本(USDT)</label>：{tactics.presentDeal.inCosting-tactics.presentDeal.outCosting}U</div>
                    <div><label>当前市场价</label>：{tactics.presentPrice}U</div>
                    <div><label>最后入场价格</label>：{tactics.presentDeal.dealPrice}U</div>
                    {tactics.presentDeal.winPrice < 0 && <div><label>扭亏均价</label>：{tactics.presentDeal.winPrice}U</div>}
                    <div><label>入场币数量</label>：{tactics.presentDeal.amount}枚</div>
                    <div><label>最高盈亏</label>：{tactics.presentDeal.historyProfit}U</div>
                    <div><label>10小时平均波动率</label>：{tactics.averageWave * 100}%</div>
                    <div><label>补仓倍数/次数</label>：
                    {tactics.loadUpBuyHelper.loadUpList.filter(i => i.roundId === tactics.roundId).reduce((pre, cur) => pre + cur.times, 0)}/
                    {tactics.loadUpBuyHelper.loadUpList.filter(i => i.roundId === tactics.roundId).length}</div>
                    <div><label>补仓网格</label>：{tactics.loadUpBuyHelper.stepGrids.map(i => i.rate).join('->')}</div>
                </div>}
            </Modal>
        </div>
    </>)
}