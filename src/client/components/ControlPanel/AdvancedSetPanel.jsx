
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
    const [paramters, setParamters] = React.useState(paramter);
    const [advancedRestran, setAdvancedRestran] = React.useState(null);
    const [advancedOption, setAdvancedOption] = React.useState(tactice.advancedOption);
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
                        <div className='title_label'>{item.desc}</div>：&nbsp;
                        <div className='adv_content'>
                            {typeof (item.value) === 'number' ? <Search
                                type='number'
                                value={item.value}
                                style={{ width: '15rem' }}
                                placeholder="请输入修改后的值"
                                enterButton="确认修改"
                                maxLength={10}
                                disabled={disables[0]}
                                onSearch={value => updateParameter(item.key, +value)}
                                onChange={e => {
                                    setValue({ key: item.key, value: +e.target.value })
                                }}
                            /> : <center><Switch checked={item.value} onChange={checked => {
                                updateParameter(item.key, checked)
                            }} /></center>}
                        </div>
                    </div>
                </li>)
            }
        </ul>
        <h4>高级约束配置</h4>
        {advancedRestran && <li>
            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab={<div>入场约束&nbsp;<Tooltip title="入场优先级先于基础出场逻辑（符合条件还需进行基础判断）"><QuestionCircleOutlined /></Tooltip></div>} key="1">
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
                <TabPane tab={<div>出场约束&nbsp;<Tooltip title="出场优先级高于基础出场逻辑（符合条件立即卖出）"><QuestionCircleOutlined /></Tooltip></div>} key="2">
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
                <TabPane tab="动态参数" key="3">
                    {advancedRestran.dynamicParam.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.dynamicParam.some(key => key === item.key)}
                            onChange={(checked) => onChange('dynamicParam', item.key, checked)} />
                        &nbsp;{item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
                <TabPane tab="选币方案" key="4">
                    {advancedRestran.symbolElecter.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.symbolElecter.some(key => key === item.key)}
                            onChange={(checked) => onChange('symbolElecter', item.key, checked)} />
                        &nbsp;{item.label}</label>&nbsp;<Tooltip title={item.desc}><QuestionCircleOutlined /></Tooltip></div>)}
                </TabPane>
            </Tabs>
        </li>}
    </div>
}