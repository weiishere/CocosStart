import React from 'react';
import { Input, Tooltip, Button, Select, InputNumber, Tag, Modal, Popover, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, CaretRightOutlined, PauseOutlined, IssuesCloseOutlined, SwapOutlined, ReloadOutlined, PauseCircleOutlined, SettingOutlined, PoweroffOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { requester } from '@src/tool/Requester'
import EventHub from '@client/EventHub'
import AdvancedSetPanel from './AdvancedSetPanel'
import StrategyPanel from './StrategyPanel'
import { apiDateCode } from '@src/config'
import { switchTactics } from '@client/utils'
import api from '@client/api';
const { Option } = Select;
const { Search } = Input;
import './style.less'

export default function ControlPanel({ uid }) {
    const [tacticeName, setTacticeName] = React.useState('');
    const [symbolStr, setSymbolStr] = React.useState('');
    const [opations, setOpations] = React.useState([]);
    const [chooseTacticeId, setChooseTacticeId] = React.useState('');
    const [paramter, setParamter] = React.useState([]);
    const [modal, setModal] = React.useState({ visible: false, title: '', key: '', value: undefined });
    const [disables, setDisables] = React.useState([true, true, true]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [targetTactice, setTargetTactice] = React.useState(null);
    const [strategys, setStrategys] = React.useState([
        //{ _id: '123', name: '实例策略',version:'2.1' }
    ]);
    const [strategyValue, setStrategyValue] = React.useState('');
    const key = 'loading';
    let parameterDesc = {};
    const addTactice = () => {
        message.loading({ content: 'loading..', key, duration: 0 });
        let quickName, quickSymbol;
        if (tacticeName.indexOf('&') !== -1) {
            quickName = tacticeName.split('&')[0];
            quickSymbol = tacticeName.split('&')[1];
        }
        requester({
            url: api.initTactics,
            type: 'post',
            params: {
                uid,
                name: quickName || tacticeName,
                symbol: quickSymbol || symbolStr
            },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => {
                    message.error({ content: error, key, duration: 2 });
                }
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                message.success({ content: '新增实例成功', key, duration: 1 });
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
    const refreshSymbol = () => {
        message.loading({ content: 'loading..', key, duration: 0 });
        requester({
            url: api.refreshSymbol,
            params: { tid: chooseTacticeId },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                message.destroy();
            }
            if (res.data.data.length === 0) {
                message.info('暂无符合条件的交易对~');
            }
        });
    }
    const updateParameter = (key, value, callback) => {
        requester({
            url: api.updateParameter,
            type: 'post',
            params: {
                id: chooseTacticeId,
                key, value
            },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => {
                    message.error({ content: error, key, duration: 2 });
                }
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                message.success({ content: '参数更新成功', key, duration: 2 });
            } else {
                message.error({ content: res.data.msg, key, duration: 2 });
            }
            callback && callback();
        });
    }
    //切币
    const switchSymbol = () => {
        message.loading({ content: 'loading..', key, duration: 0 });
        let quickSymbol;
        if (tacticeName.indexOf('&') !== -1) {
            quickSymbol = tacticeName.split('&')[1];
        }
        requester({
            url: api.switchSymbol,
            type: 'post',
            params: { tid: chooseTacticeId, symbol: quickSymbol || symbolStr },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => { message.error({ content: error, key, duration: 2 }); }
            }
        }).then(({ res }) => {
            if (res.data.code === apiDateCode.success) {
                message.success({ content: '切币操作成功', key, duration: 1 });
                EventHub.getInstance().dispatchEvent('switchTactics', res.data.data);
            } else {
                message.error({ content: res.data.msg, key, duration: 2 });
            }
        });
    }
    const sgetStrategyList = () => {
        requester({
            url: api.getStrategy,
            params: { uid },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            if (res.data.code !== apiDateCode.success) {
                message.error({ content: res.data.msg, key, duration: 2 });
            } else {
                //message.destroy();
                setStrategys(res.data.data)
            }
        });
    }
    const asyncGetParameterDesc = async () => {
        parameterDesc = await requester({
            url: api.getParameterDesc,
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => {
                    message.error({ content: error, key, duration: 2 });
                }
            }
        });
        console.log('');
    }
    React.useEffect(() => {
        asyncGetParameterDesc();
        //选中推荐交易对之后，切换待选币
        EventHub.getInstance().addEventListener('chooseSymbol', 'cp_chooseSymbol', payload => {
            setSymbolStr(payload.symbol);
            setTacticeName(payload.name);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', 'cp_mapTacticsList', payload => {
            setOpations(payload.map(item => ({
                id: item.id,
                name: item.name,
                symbol: item.symbol,
                runState: item.runState
            })));
            const _targetTactice = payload.find(item => item.target === true);
            let paramArr = [];
            if (_targetTactice) {
                for (let key of Object.keys(_targetTactice.parameterDesc)) {
                    paramArr.push({ key, value: _targetTactice.parameter[key], desc: _targetTactice.parameterDesc[key][1], isNoAdv: _targetTactice.parameterDesc[key][0] })
                }
                _targetTactice.runState ? setDisables([true, false, true]) : setDisables([false, true, false]);
                setParamter(paramArr);
                setTargetTactice(_targetTactice)
            }
        });
        EventHub.getInstance().addEventListener('switchTactics', 'cp_switchTactics', payload => {
            setChooseTacticeId(payload.id);
            setTargetTactice(payload);
            setStrategyValue(payload.strategy.id);
            if (payload.runState) {
                setDisables([true, false, true]);
            } else {
                setDisables([false, true, false]);
            }
            sgetStrategyList();
        });
    }, []);//symbolStr, chooseTacticeId, disables
    const openEditModal = (mod) => {
        setModal(Object.assign({}, modal, { key: mod.key, title: mod.desc, value: mod.value }));
    }
    return <div className='customerSetWrap'>
        <div>
            {/* 待选:{symbolStr || 'null'} */}
            <Input maxLength={15} size="small" placeholder='请输入实例名称' value={tacticeName} onChange={e => {
                setTacticeName(e.target.value)
            }} style={{ width: "60%" }} />&nbsp;
            <Tooltip placement="bottom" title="创建实例">
                <Button onClick={addTactice} type="primary" size={'small'} shape="circle" icon={<PlusOutlined />} />
            </Tooltip>&nbsp;
            <Tooltip placement="bottom" title="切币">
                <Button disabled={disables[0]} onClick={switchSymbol} type="primary" size={'small'} shape="circle" icon={<SwapOutlined />} />
            </Tooltip>
        </div>
        <div>
            <Select size="small" style={{ width: "90%" }} value={chooseTacticeId} onChange={e => {
                location.replace(`#${e}`);
                //switchTactics(tid);
            }}>
                {
                    opations.map(option => <Option key={option.id} value={option.id}>
                        <Tooltip placement="right" title={`当前交易对：${option.symbol}`}>
                            {
                                !option.runState ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                            }
                            &nbsp;&nbsp;{option.name}-({option.symbol})
                        </Tooltip>
                    </Option>)
                }
                {/* <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
                <Option value="Yiminghe">yiminghe</Option> */}
            </Select>
            <div>
                <Tooltip placement="bottom" title={`立即刷新推荐币`}>
                    <Button disabled={!chooseTacticeId ? true : false} onClick={refreshSymbol} type="primary" shape="circle" icon={<ReloadOutlined />} />
                </Tooltip>
                <Popover
                    key={`popover-0`}
                    content={<div className="popover_botton">
                        <Tooltip placement="bottom" title="运行">
                            <Button onClick={() => {
                                powerSwitch(chooseTacticeId, 'run')
                            }} disabled={disables[0]} type="primary" shape="circle" danger icon={<CaretRightOutlined />} />
                        </Tooltip>
                        <Tooltip placement="bottom" title="模拟运行">
                            <Button onClick={() => {
                                powerSwitch(chooseTacticeId, 'imitateRun')
                            }} disabled={disables[0]} type="primary" shape="circle" icon={<PlayCircleOutlined />} />
                        </Tooltip>
                        <Tooltip placement="bottom" title='立即运行并入场'>
                            <Button disabled={disables[0]} onClick={() => powerSwitch(chooseTacticeId, 'runAndBuy')}
                                type="primary" shape="circle" icon={<IssuesCloseOutlined />} />
                        </Tooltip>
                    </div>}
                    title="选择运行模式"
                    trigger="click"
                >
                    <Button disabled={disables[0]} type="primary" shape="circle" danger icon={<CaretRightOutlined />} />
                </Popover>
                <Tooltip placement="bottom" title='暂停实例'>
                    <Button disabled={disables[1]} onClick={() => powerSwitch(chooseTacticeId, 'pause')}
                        type="primary" shape="circle" icon={<PauseOutlined />} />
                </Tooltip>
                <Tooltip placement="bottom" title='停止实例'>
                    <Button disabled={disables[1]} onClick={() => powerSwitch(chooseTacticeId, 'stop')}
                        type="primary" shape="circle" icon={<PoweroffOutlined />} />
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
                paramter.filter(item => item.isNoAdv).map(item => <Popover
                    key={`popover-${item.key}`}
                    content={<div>
                        修改参数--{item.desc}:<br /><br />
                        {typeof (item.value) === 'number' ? <Search
                            type='number'
                            value={modal.value}
                            style={{ width: '15rem' }}
                            placeholder="请输入修改后的值"
                            enterButton="确认修改"
                            maxLength={10}
                            onSearch={value => updateParameter(item.key, +value)}
                            //disabled={disables[0]}
                            onChange={e => {
                                setModal(Object.assign({}, modal, { value: +e.target.value }))
                            }}
                        /> : <center><Switch
                            //disabled={disables[0]}
                            checked={item.value} onChange={checked => {
                                updateParameter(item.key, checked)
                            }} /></center>}
                    </div>}
                    title={item.title}
                    trigger="click"
                ><Tag onClick={() => {
                    openEditModal(item)
                }} key={item.key} color='#2E384E'>{item.desc}：{typeof (item.value) === 'number' ? item.value : (item.value ? '是' : '否')}</Tag><br /></Popover>)
            }
            <center>{chooseTacticeId && <>
                <Button onClick={() => { setModalVisible(true) }} type="link"><i className="iconfont_default">&#xe61f;</i>高级配置</Button>
                <Popover
                    title='策略管理'
                    trigger="click"
                    content={
                        <StrategyPanel
                            uid={uid}
                            strategyValue={strategyValue}
                            setStrategyValue={setStrategyValue}
                            setStrategys={setStrategys}
                            strategys={strategys}
                            targetTactice={targetTactice}
                            chooseTacticeId={chooseTacticeId}
                            sgetStrategyList={sgetStrategyList}
                        />
                    }>
                    <Tooltip placement="right" title={`应用策略：${(targetTactice && targetTactice.strategy.name) || '暂无'}`}>
                        <Button type="link"><i className="iconfont_default">&#xe611;</i>策略管理</Button>
                    </Tooltip>

                </Popover>
            </>}</center>
        </div>
        {<Modal
            title={`高级配置-${targetTactice && targetTactice.name}`}
            visible={modalVisible}
            width={800}
            footer={[
                <Button key="OK" type="primary" onClick={() => { setModalVisible(false) }}>关闭</Button>,
            ]}
            onOk={() => { setModalVisible(false) }}
            onCancel={() => { setModalVisible(false) }}
        >
            <AdvancedSetPanel
                modalVisible={modalVisible}
                tactice={targetTactice}
                paramter={paramter}
                updateParameter={updateParameter}
                //advancedOption={advancedOption}
                disables={disables} />
        </Modal>}
    </div>
}