import React from 'react';
import { Input, Tooltip, Button, Select, InputNumber, Tag, Modal, Popover } from 'antd';
import { PlusOutlined, CaretRightOutlined, PauseOutlined, CloseOutlined, PauseCircleOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { requester } from '@src/tool/Requester'
import { message } from 'antd';
import EventHub from '@client/EventHub'
import { apiDateCode } from '@src/config'
import { switchTactics } from '@client/utils'
import api from '@client/api';
const { Option } = Select;
const { Search } = Input;
import './style.less'

export default function ControlPanel() {
    const [tacticeName, setTacticeName] = React.useState('');
    const [symbolStr, setSymbolStr] = React.useState('');
    const [opations, setOpations] = React.useState([]);
    const [chooseTacticeId, setChooseTacticeId] = React.useState('');
    const [paramter, setParamter] = React.useState([]);
    const [modal, setModal] = React.useState({ visible: false, title: '', key: '', value: undefined });
    const [disables, setDisables] = React.useState([true, true, true]);
    const key = 'loading';
    const addTactice = () => {
        message.loading({ content: 'loading..', key, duration: 0 });
        requester({
            url: api.initTactics,
            type: 'post',
            params: {
                name: tacticeName,
                symbol: symbolStr
            },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => {
                    message.error({ content: error, key, duration: 2 });
                }
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                message.success({ content: '操作成功', key, duration: 2 });
                //console.log(res.data.id)
                location.replace(`#${res.data.data.id}`);
            } else {
                message.error({ content: res.data.msg, key, duration: 2 });
            }
        });
    }
    const powerSwitch = (tid, order) => {
        message.loading({ content: 'loading..', key, duration: 0 });
        requester({
            url: api.tacticsOrder,
            type: 'post',
            params: { tid, order },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                //message.success({ content: '操作成功', key, duration: 2 });
                message.destroy();
            } else {
                message.error({ content: res.data.msg, key, duration: 2 });
            }
            if (order === 'remove') {
                setChooseTacticeId('');
                setDisables([true, true, true]);
                setParamter([]);
                setSymbolStr('')
            }
        });
    }
    React.useEffect(() => {
        // window.setTimeout(() => {
        //     alert('update')
        //     setSymbolStr('update');
        // }, 3000)
        //选中推荐交易对之后，切换待选币
        EventHub.getInstance().addEventListener('chooseSymbol', payload => {
            setSymbolStr(payload.symbol);
            setTacticeName(payload.name);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            console.log(payload)
            setOpations(payload.map(item => ({
                id: item.id,
                name: item.name,
                symbol: item.symbol,
                runState: item.runState
            })));
            const targetSymbol = payload.find(item => item.target === true);
            //targetSymbol && setParamter(targetSymbol.paramDesc.map(item => ({ paramDesc: item, value: targetSymbol.param[item] })));
            let paramArr = [];
            if (targetSymbol) {
                for (let key of Object.keys(targetSymbol.paramDesc)) {
                    paramArr.push({ key, value: targetSymbol.param[key], desc: targetSymbol.paramDesc[key] })
                }
                targetSymbol.runState ? setDisables([true, false, true]) : setDisables([false, true, false]);
                setParamter(paramArr);
            }
        });
        //运行币切换
        EventHub.getInstance().addEventListener('switchTactics', payload => {
            setChooseTacticeId(payload.id);
            if (payload.runState) {
                setDisables([true, false, true]);
            } else {
                setDisables([false, true, false]);
            }
        });

    }, []);//symbolStr, chooseTacticeId, disables
    const openEditModal = (mod) => {
        setModal(Object.assign({}, modal, { key: mod.key, title: mod.desc, value: mod.value }));
    }
    return <div className='customerSetWrap'>
        <div>
            {/* 待选:{symbolStr || 'null'} */}
            <Input maxLength={10} size="small" placeholder='请输入实例名称' value={tacticeName} onChange={e => {
                setTacticeName(e.target.value)
            }} style={{ width: "8rem" }} />&nbsp;
            <Tooltip placement="bottom" title="创建实例">
                <Button onClick={addTactice} type="primary" size={'small'} shape="circle" icon={<PlusOutlined />} />
            </Tooltip>
        </div>
        <div>
            <Select size="small" style={{ width: "10rem" }} value={chooseTacticeId} onChange={e => {
                location.replace(`#${e}`);
                //switchTactics(tid);
            }}>
                {
                    opations.map(option => <Option key={option.id} value={option.id}>
                        <Tooltip placement="right" title={`当前交易对：${option.symbol}`}>
                            {
                                !option.runState ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                            }
                            &nbsp;&nbsp;{option.name}
                        </Tooltip>
                    </Option>)
                }
                {/* <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
                <Option value="Yiminghe">yiminghe</Option> */}
            </Select>
            <div>
                <Tooltip placement="bottom" title="运行实例">
                    <Button onClick={() => {
                        powerSwitch(chooseTacticeId, 'run')
                    }} disabled={disables[0]} type="primary" shape="circle" danger icon={<CaretRightOutlined />} />
                </Tooltip>
                <Tooltip placement="bottom" title="模拟运行">
                    <Button onClick={() => {
                        powerSwitch(chooseTacticeId, 'imitateRun')
                    }} disabled={disables[0]} type="primary" shape="circle" icon={<PlayCircleOutlined />} />
                </Tooltip>
                <Tooltip placement="bottom" title="停止实例">
                    <Button onClick={() => {
                        powerSwitch(chooseTacticeId, 'stop')
                    }} disabled={disables[1]} type="primary" shape="circle" icon={<PauseOutlined />} />
                </Tooltip>
                <Tooltip placement="bottom" title="删除实例">
                    <Button onClick={() => {
                        powerSwitch(chooseTacticeId, 'remove')
                    }} disabled={disables[2]} type="primary" shape="circle" icon={<DeleteOutlined />} />
                </Tooltip>
            </div>
        </div>
        <div className='paramPanel'>
            {
                paramter.map(item => <Popover
                    key={`popover-${item.key}`}
                    content={<div>
                        修改参数--{item.desc}:<br /><br />
                        <Search
                            type='number'
                            value={modal.value}
                            style={{ width: '15rem' }}
                            placeholder="请输入修改后的值"
                            enterButton="确认修改"
                            onSearch={value => console.log('修改')}
                            disabled={disables[0]}
                            onChange={e => {
                                setModal(Object.assign({}, modal, { value: e.target.value }))
                            }}
                        />
                        {/* <a style={{ verticalAlign: 'bottom' }} onClick={() => setModal(Object.assign({}, modal, { key: '' }))}>cancel</a> */}
                    </div>}
                    title={item.title}
                    trigger="click"
                ><Tag onClick={() => {
                    openEditModal(item)
                }} key={item.key} color='#2E384E'>{item.desc}：{item.value}</Tag></Popover>)
            }
            {/* <Tag color='#3b5999'>买入USDT数量:100</Tag>
            <Tag color='#3b5999'>买入检查频率:15s</Tag>
            <Tag color='#3b5999'>买入确认频率:15s</Tag>
            <Tag color='#3b5999'>确认买入涨幅:0.05%</Tag>
            <Tag color='#3b5999'>埋伏入场下跌率:0.1%</Tag>
            <Tag color='#3b5999'>卖出检查频率:100</Tag>
            <Tag color='#3b5999'>卖出确认频率:100</Tag>
            <Tag color='#3b5999'>止盈跌幅:100</Tag>
            <Tag color='#3b5999'>止损跌幅:100</Tag> */}
        </div>
        {/* <Modal
            title={modal.title}
            visible={modal.visible}
            width={}
            onOk={() => {
                setModal({},Object.assign(modal, { visible: false }))
            }}
            onCancel={() => {
                setModal({},Object.assign(modal, { visible: false }))
            }}
        >
            {modal.title}：<Input value={modal.value}/>

        </Modal> */}
    </div>
}