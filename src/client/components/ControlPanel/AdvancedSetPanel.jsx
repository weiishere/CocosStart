
import React from 'react';
import { Input, message, Switch, Tabs } from 'antd';
const { Search } = Input;
import clone from 'clone';
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import EventHub from '@client/EventHub'
import './style.less'
const { TabPane } = Tabs;

export default function AdvancedSetPanel({ tactice, paramter, updateParameter, disables }) {
    const [paramters, setParamters] = React.useState(paramter);
    const [advancedRestran, setAdvancedRestran] = React.useState(null);
    const [advancedOption, setAdvancedOption] = React.useState(tactice.advancedOption);
    const setValue = ({ key, value }) => {
        const _paramters = clone(paramters)
        if (typeof (value) === 'number') value += 0;
        _paramters.find(item => item.key === key).value = value;
        setParamters(_paramters);
    }
    const getAdvancedRestranList = () => {
        let key = 'loading';
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
        });
    }
    const updateAdvancedRestran = (item, callBack) => {
        let key = 'loading';
        message.loading({ content: '加载配置规则数据..', key, duration: 0 });
        requester({
            url: api.updateAdvancedRestran, type: 'post',
            params: { id: tactice.id, item, keys: advancedOption[item].join(',') },
            option: {
                baseUrl: 'API_server_url',
                faileBack: error => message.error({ content: error, key, duration: 2 })
            }
        }).then(({ res }) => {
            message.destroy();
            callBack && callBack();
        });
    }
    const onChange = (item, key, checked) => {
        if (checked) {
            if (advancedOption[item].indexOf(key) === -1) {
                advancedOption[item].push(key)
            }
        } else {
            if (advancedOption[item].indexOf(key) !== -1) {
                advancedOption[item] = advancedOption[item].filter(item => item !== key);
            }
        }
        updateAdvancedRestran(item, () => {
            setAdvancedOption({ ...advancedOption });
        })
    }
    React.useEffect(() => {
        getAdvancedRestranList();
    }, []);
    return <div className='advanced_set_panel'>
        <h4>参数配置</h4>
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
        <h4>约束和动态参数</h4>
        {advancedRestran && <li>
            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="入场约束" key="1">
                    {advancedRestran.premiseForBuy.map(item => <div className='adv_content'><label>
                        <Switch checked={advancedOption.premiseForBuy.some(key => key === item.key)}
                            onChange={(checked) => onChange('premiseForBuy', item.key, checked)} />
                        &nbsp; {item.desc}</label></div>)}
                </TabPane>
                <TabPane tab="出场约束" key="2">
                    {advancedRestran.premiseForSell.map(item => <div className='adv_content'><label><Switch />&nbsp;{item.desc}</label></div>)}
                </TabPane>
                <TabPane tab="动态调整" key="3">
                    {advancedRestran.dynamicParam.map(item => <div className='adv_content'><label><Switch />&nbsp;{item.desc}</label></div>)}
                </TabPane>
                <TabPane tab="选币方案" key="4">
                    {advancedRestran.symbolElecter.map(item => <div className='adv_content'><label><Switch />&nbsp;{item.desc}</label></div>)}
                </TabPane>
            </Tabs>
        </li>}
    </div>
}