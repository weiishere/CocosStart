import React from 'react';
import { Input, Tooltip, Button, Select, InputNumber, Tag, Modal, Popover, Switch, message, Radio } from 'antd';
import { MinusCircleOutlined, CaretRightOutlined, PlusCircleOutlined, RiseOutlined, FallOutlined, CheckOutlined, UndoOutlined, SettingOutlined, PoweroffOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import './style.less'
const { Search } = Input;
const RadioItemStyle1 = { width: '8rem', color: '#fff', height: '2.5rem', lineHeight: '2.5rem', fontSize: '1.1rem' }

export default function ControlPanel() {

    return <>
        <div>
            <Popover
                key={`popover-0`}
                content={<div className="popover_botton">
                    <div style={{ marginBottom: 16 }}>
                        <Radio.Group onChange={() => { }} style={{ marginBottom: 8 }}>
                            <Radio.Button style={{ background: 'red', ...RadioItemStyle1 }} value="long"><RiseOutlined />多</Radio.Button>
                            <Radio.Button style={{ background: 'green', ...RadioItemStyle1 }} value="short"><FallOutlined />空</Radio.Button>
                        </Radio.Group>
                        <Input type='number' addonBefore="开/补仓数量" addonAfter="BTC" defaultValue="0.5" />
                        <Radio.Group onChange={() => { }} style={{ marginTop: 8 }}>
                            <Radio.Button style={{width:'4rem'}} value="25">25</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="50">50</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="75">75</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="100">100</Radio.Button>
                        </Radio.Group>
                    </div>

                    <Button type="primary" size='large' shape="round" >确认开/补仓</Button>
                </div>}
                title="请选择开/补仓方向"
                trigger="click"
            >
                <Button type="primary" shape="round" icon={<PlusCircleOutlined />} >开/补仓</Button>
            </Popover>
            &nbsp;&nbsp;<Button onClick={() => { }} type="primary" shape="circle" danger icon={<CaretRightOutlined />} />&nbsp;&nbsp;
            <Popover
                key={`popover-0`}
                content={<div className="popover_botton">
                    <div style={{ marginBottom: 16 }}>
                        <Input type='number' addonBefore="基准值" addonAfter="BTC" defaultValue="BTC" />
                        <div style={{ marginTop: 16 }}>
                            <Button type="primary" shape="round" icon={<CheckOutlined />} danger>确认</Button>
                            <Button type="primary" shape="round" icon={<UndoOutlined />} >重置</Button>
                        </div>
                    </div>
                </div>}
                title="参数配置"
                trigger="click"
            >
                <Button onClick={() => { }} type="primary" shape="circle" icon={<SettingOutlined />} />
            </Popover>
            &nbsp;&nbsp;
            <Popover
                key={`popover-0`}
                content={<div className="popover_botton">
                    <div style={{ marginBottom: 16 }}>
                        <Radio.Group onChange={() => { }} style={{ marginBottom: 8 }}>
                            <Radio.Button style={{ background: 'red', ...RadioItemStyle1 }} value="long"><RiseOutlined />多</Radio.Button>
                            <Radio.Button style={{ background: 'green', ...RadioItemStyle1 }} value="short"><FallOutlined />空</Radio.Button>
                        </Radio.Group>
                        <Input type='number' addonBefore="平/减仓数量" addonAfter="BTC" defaultValue="0.5" />
                        <Radio.Group onChange={() => { }} style={{ marginTop: 8 }}>
                            <Radio.Button style={{width:'4rem'}} value="25">25</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="50">50</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="75">75</Radio.Button>
                            <Radio.Button style={{width:'4rem'}} value="100">100</Radio.Button>
                        </Radio.Group>
                    </div>

                    <Button type="primary" size='large' shape="round" >确认平/减仓</Button>
                </div>}
                title="请选择平/减仓方向"
                trigger="click"
            >
                <Button type="primary" shape="round" icon={<MinusCircleOutlined />} >平/减仓</Button>
            </Popover>
        </div>
    </>
}