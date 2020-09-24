import React from 'react';
import { Input, message, Button, Popconfirm, Select } from 'antd';
const { Option } = Select;
import { requester } from '@src/tool/Requester'
import { apiDateCode } from '@src/config'
import api from '@client/api';

export default function StrategyPanel({ uid, strategyValue, setStrategys, chooseTacticeId, setStrategyValue, strategys, targetTactice, sgetStrategyList }) {
    const [newStrategyName, setNewStrategyName] = React.useState('');
    const key = 'loading';
    const strategyCommond = {
        find: () => {
            sgetStrategyList();
        },
        update: () => {
            message.loading({ content: 'loading..', key, duration: 0 });
            requester({
                url: api.updateStrategy, type: 'post',
                params: {
                    _id: strategyValue,
                    tid: chooseTacticeId,
                    strategy: {
                        uid
                    }
                },
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                if (res.data.code !== apiDateCode.success) {
                    message.error({ content: res.data.msg, key, duration: 2 });
                } else {
                    message.success({ content: `操作已完成`, key, duration: 2 });
                    //strategyCommond.find();
                }
            });
        },
        create: () => {
            if (!newStrategyName) {
                message.warn('请输入策略名称');
                return false;
            }
            message.loading({ content: 'loading..', key, duration: 0 });
            requester({
                url: api.createStrategy, type: 'post',
                params: {
                    tid: chooseTacticeId,
                    strategy: {
                        name: newStrategyName, uid
                    }
                },
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                if (res.data.code !== apiDateCode.success) {
                    message.error({ content: res.data.msg, key, duration: 2 });
                } else {
                    message.success({ content: `操作已完成`, key, duration: 2 });
                    strategyCommond.find();
                    setStrategyValue(res.data.data._id);
                }
            });
        },
        set: () => {
            if (!strategyValue) { message.warn('请选择策略'); return; }
            message.loading({ content: 'loading..', key, duration: 0 });
            requester({
                url: api.setStrategy, type: 'post',
                params: { tid: chooseTacticeId, strategyId: strategyValue, version: strategys.find(item => item._id === strategyValue).version },//tid, strategyId, version
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                if (res.data.code !== apiDateCode.success) {
                    message.error({ content: res.data.msg, key, duration: 2 });
                } else {
                    message.success({ content: `操作已完成`, key, duration: 2 });
                }
            });
        },
        remove: () => {
            message.loading({ content: 'loading..', key, duration: 0 });
            requester({
                url: api.removeStrategy, type: 'post',
                params: { id: strategyValue },
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                if (res.data.code !== apiDateCode.success) {
                    message.error({ content: res.data.msg, key, duration: 2 });
                } else {
                    message.success({ content: `删除操作已完成`, key, duration: 2 });
                    setStrategyValue('');
                    strategyCommond.find();
                }
            });
        },
        unbind: () => {

            message.loading({ content: 'loading..', key, duration: 0 });
            requester({
                url: api.unbindStrategy, type: 'post',
                params: { tid: chooseTacticeId },
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                if (res.data.code !== apiDateCode.success) {
                    message.error({ content: res.data.msg, key, duration: 2 });
                } else {
                    message.success({ content: `解除操作已完成`, key, duration: 2 });
                    setStrategyValue('');
                }
            });
        }
    }
    return <div>
        <div>
            当前已应用策略：<Select value={strategyValue} style={{ width: '10rem' }} onChange={e => { setStrategyValue(e) }}>
                {strategys.map((item, i) => <Option key={`key_${i}`} value={item._id}>
                    <div style={{ color: item._id === targetTactice.strategy.id ? 'red' : '#666' }}>{`${item.name}(v${item.version})`}</div>
                </Option>)}
            </Select>
            {/* <Tooltip placement="bottom" title="删除此策略">
            &nbsp;<Button disabled={strategyValue ? false : true} onClick={() => { }}
                type="primary" shape="circle" icon={<DeleteOutlined />} />
        </Tooltip> */}
        </div>
        <div style={{ marginTop: '0.5rem' }}>
            <center>
                <Button disabled={!strategyValue ? true : false} type="primary" onClick={strategyCommond.set}><i className="iconfont_default">&#xe630;</i>&nbsp;应用</Button>&nbsp;&nbsp;
                <Button disabled={!strategyValue ? true : false} type="primary" onClick={strategyCommond.update}><i className="iconfont_default">&#xe640;</i>&nbsp;覆写</Button>&nbsp;&nbsp;
                <Button disabled={(targetTactice && targetTactice.strategy.id) ? false : true} type="primary" onClick={strategyCommond.unbind}><i className="iconfont_default">&#xe648;</i>&nbsp;解除</Button>&nbsp;&nbsp;
                <Popconfirm
                    title="是否确认删除此策略?"
                    onConfirm={strategyCommond.remove}
                    okText="确认"
                    cancelText="取消"
                >
                    <Button disabled={!strategyValue ? true : false} type="primary"><i className="iconfont_default">&#xe7aa;</i>&nbsp;删除</Button>
                </Popconfirm>
            </center>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
            <center>
                <Input style={{ width: '10rem' }} value={newStrategyName} placeholder="新的策略名称" onChange={e => setNewStrategyName(e.target.value)} />&nbsp;
                <Button type="primary" onClick={strategyCommond.create}><i className="iconfont_default">&#xe666;</i>&nbsp;新增并应用</Button>
            </center>
        </div>
    </div>
}