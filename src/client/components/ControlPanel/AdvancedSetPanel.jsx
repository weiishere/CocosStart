
import React from 'react';
import { Input, message, Switch, Tabs, Tooltip, Radio } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'
const { Search } = Input;
import clone from 'clone';
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import EventHub from '@client/EventHub'
import './style.less'
const { TabPane } = Tabs;

export default function AdvancedSetPanel({ modalVisible, tactice, paramter, updateParameter, disables }) {
    //console.log(paramter.find(item => item.key === 'isAllowLoadUpBuy'))
    const [paramters, setParamters] = React.useState(paramter);
    const [advancedRestran, setAdvancedRestran] = React.useState(null);
    const [advancedOption, setAdvancedOption] = React.useState(tactice.advancedOption);
    const [loadUpBuyHelper, setLoadUpBuyHelper] = React.useState(tactice.loadUpBuyHelper);
    const setValue = ({ key, value }) => {
        const _paramters = clone(paramters)
        if (typeof (value) === 'number') value += 0;
        _paramters.find(item => item.key === key).value = value;
        setParamters(_paramters);
    }
    const getAdvancedRestranList = (callback) => {
        let key = 'loading';
        if (advancedRestran) {
            callback();
            return;
        };

        message.loading({ content: '加载配置规则数据..', key, duration: 0 });
        requester({
            url: api.getAdvancedRestran,
            params: {},
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            message.destroy();
            setAdvancedRestran(res.data.data);
            callback && callback()
        });
    }
    const updateAdvancedRestran = (item, callBack) => {
        let key = 'loading';
        message.loading({ content: '加载配置规则数据..', key, duration: 0 });
        requester({
            url: api.updateAdvancedRestran, type: 'post',
            params: { id: tactice.id, item, keys: item === 'premiseJoin' ? JSON.stringify(advancedOption[item]) : advancedOption[item].join(',') },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            message.destroy();
            callBack && callBack();
        });
    }
    const onChange = (item, key, value) => {
        if (typeof value === 'boolean') {
            if (value) {
                if (advancedOption[item].indexOf(key) === -1) {
                    advancedOption[item].push(key)
                }
            } else {
                if (advancedOption[item].indexOf(key) !== -1) {
                    advancedOption[item] = advancedOption[item].filter(item => item !== key);
                }
            }
        } else {
            //修改约束关系
            advancedOption.premiseJoin[key] = value;
        }
        updateAdvancedRestran(item, () => {
            setAdvancedOption({ ...advancedOption });
        })
    }
    const onChangeLoadUpBuy = (key, value, isRequest, callBack) => {
        let _loadUpBuyHelper = Object.assign({}, loadUpBuyHelper);
        _loadUpBuyHelper[key] = value;
        if (!isRequest) {
            setLoadUpBuyHelper(_loadUpBuyHelper);
        } else {
            const key = 'loading';
            message.loading({ content: '处理中..', key, duration: 0 });
            requester({
                url: api.updateLoadUpBuy, type: 'post',
                params: { tid: tactice.id, loadUpBuy: _loadUpBuyHelper },
                option: {
                    baseUrl: 'API_server_url',
                    faileBack: error => message.error({ content: error, key, duration: 2 })
                }
            }).then(({ res }) => {
                setLoadUpBuyHelper(_loadUpBuyHelper);
                message.destroy();
                callBack && callBack();
            });
        }
    }
    // const modChange = (e) => {
    //     let _loadUpBuyHelper = Object.assign({}, loadUpBuyHelper);
    //     _loadUpBuyHelper.mod = e.target.value;
    //     setLoadUpBuyHelper(_loadUpBuyHelper);
    // }
    const comitLoadUpBuy = () => {

    }
    React.useEffect(() => {
        modalVisible && getAdvancedRestranList(() => {
            modalVisible && setParamters(paramter);
            modalVisible && setAdvancedOption({ ...tactice.advancedOption });
        });

    }, [modalVisible]);

    return <div className='advanced_set_panel'>
        <h4>高级参数配置</h4>
        <ul>
            {
                paramters.filter(item => !item.isNoAdv).map(item => <li>
                    <div>
                        <div className='title_label nowrap'><Tooltip placement="left" title={item.desc}>{item.desc}:</Tooltip></div>&nbsp;
                        <div className='adv_content'>
                            {typeof (item.value) === 'number' ? <Search
                                type='number'
                                value={item.value}
                                style={{ width: '15rem' }}
                                enterButton="确认修改"
                                maxLength={10}
                                //disabled={disables[0]}
                                onSearch={value => updateParameter(item.key, +value)}
                                onChange={e => {
                                    setValue({ key: item.key, value: +e.target.value })
                                }}
                            /> : <center><Switch
                                //disabled={disables[0]}
                                checked={item.value} onChange={checked => {
                                    updateParameter(item.key, checked, () => {
                                        setValue({ key: item.key, value: checked })
                                    })
                                }} /></center>}
                        </div>
                    </div>
                </li>)
            }
        </ul>
        <h4>高级模型配置</h4>
        {advancedRestran && <li>
            <Tabs defaultActiveKey="1" type="card">
                {/* <TabPane tab={<div>基本约束&nbsp;<Tooltip title="在进行基本判断（入场和出场）前执行"><QuestionCircleOutlined /></Tooltip></div>} key="1">
                    约束关系：<Radio.Group name="radiogroup" defaultValue={advancedOption.premiseJoin.premiseForBase}
                        onChange={(e) => onChange('premiseJoin', 'premiseForBase', e.target.value)}>
                        <Radio value='and'>且</Radio>
                        <Radio value='or'>或</Radio>
                    </Radio.Group>
                    {advancedRestran.premiseForBase.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.premiseForBase.some(key => key === item.key)}
                            onChange={(checked) => onChange('premiseForBase', item.key, checked)} />
                        &nbsp; {item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane> */}
                <TabPane tab={<div>入场约束&nbsp;<Tooltip title="入场约束先于基础入场逻辑执行（即符合约束条件还需进行入场基础判断）"><QuestionCircleOutlined /></Tooltip></div>} key="2">
                    约束关系：<Radio.Group name="radiogroup" defaultValue={advancedOption.premiseJoin.premiseForBuy}
                        onChange={(e) => onChange('premiseJoin', 'premiseForBuy', e.target.value)}>
                        <Radio value='and'>且</Radio>
                        <Radio value='or'>或</Radio>
                    </Radio.Group>
                    {advancedRestran.premiseForBuy.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.premiseForBuy.some(key => key === item.key)}
                            onChange={(checked) => onChange('premiseForBuy', item.key, checked)} />
                        &nbsp; {item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
                <TabPane tab={<div>出场约束&nbsp;<Tooltip title="出场约束优先级高于基础出场逻辑（符合条件立即卖出，不再进行出场基础判断）"><QuestionCircleOutlined /></Tooltip></div>} key="3">
                    约束关系：<Radio.Group name="radiogroup" defaultValue={advancedOption.premiseJoin.premiseForSell}
                        onChange={(e) => onChange('premiseJoin', 'premiseForSell', e.target.value)}>
                        <Radio value='and'>且</Radio>
                        <Radio value='or'>或</Radio>
                    </Radio.Group>
                    {advancedRestran.premiseForSell.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.premiseForSell.some(key => key === item.key)}
                            onChange={(checked) => onChange('premiseForSell', item.key, checked)} />
                        &nbsp;{item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
                <TabPane tab="动态参数" key="4">
                    {advancedRestran.dynamicParam.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.dynamicParam.some(key => key === item.key)}
                            onChange={(checked) => onChange('dynamicParam', item.key, checked)} />
                        &nbsp;{item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
                <TabPane tab="选币方案" key="5">
                    {advancedRestran.symbolElecter.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.symbolElecter.some(key => key === item.key)}
                            onChange={(checked) => onChange('symbolElecter', item.key, checked)} />
                        &nbsp;{item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
                <TabPane tab={<div>补仓方案&nbsp;<Tooltip title="补仓开关需要打开，这里配置补仓的必备条件"><QuestionCircleOutlined /></Tooltip></div>} key="6">
                    <div>
                        <label><Switch checked={loadUpBuyHelper.dynamicGrids} onChange={checked => onChangeLoadUpBuy('dynamicGrids', checked, true)} />&nbsp;动态网格</label>&nbsp;&nbsp;&nbsp;&nbsp;
                        <label><Switch checked={loadUpBuyHelper.restrainEnable} onChange={checked => onChangeLoadUpBuy('restrainEnable', checked, true)} />&nbsp;补仓约束(按入场条件)</label>&nbsp;&nbsp;&nbsp;&nbsp;
                        <label><Switch checked={loadUpBuyHelper.isStopRise} onChange={checked => onChangeLoadUpBuy('isStopRise', checked, true)} />&nbsp;扭亏即尽快止盈</label>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        补仓模式：<Radio.Group name="radiogroup" defaultValue={loadUpBuyHelper.mod}
                            onChange={e => onChangeLoadUpBuy('mod', e.target.value, true)}>
                            <Radio value='step'>逐级补仓(step)&nbsp;<Tooltip title="根据跌幅进行动态逐级补仓"><QuestionCircleOutlined /></Tooltip></Radio>
                            <Radio value='target'>目标补仓(target)&nbsp;<Tooltip title="设定一个扭亏目标涨幅，假设实现此涨幅即可扭亏，此模式对资金量要求较高"><QuestionCircleOutlined /></Tooltip></Radio>
                        </Radio.Group>
                        扭亏目标涨幅：<Search
                            type='number'
                            size='small'
                            value={loadUpBuyHelper.target}
                            style={{ width: '10rem' }}
                            enterButton="确认修改"
                            maxLength={10}
                            disabled={loadUpBuyHelper.mod === 'step'}
                            onSearch={e => { onChangeLoadUpBuy('target', loadUpBuyHelper.target, true) }}
                            onChange={e => onChangeLoadUpBuy('target', +e.target.value, false)}
                        />
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        补仓最短间隔时间：<Search
                            type='number'
                            value={loadUpBuyHelper.intervalTime}
                            size='small'
                            style={{ width: '15rem' }}
                            enterButton="确认修改"
                            maxLength={3}
                            disabled={false}
                            onSearch={e => { onChangeLoadUpBuy('intervalTime', loadUpBuyHelper.intervalTime, true) }}
                            onChange={e => onChangeLoadUpBuy('intervalTime', +e.target.value, false)}
                        />
                    </div>
                </TabPane>
            </Tabs>
        </li>}
    </div>
}