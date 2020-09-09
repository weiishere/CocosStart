/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-09-08 18:04:20
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import { Table, Button } from 'antd'
import './style.less'
import EventHub from '@client/EventHub'

const columns = [
    {
        title: '名称',
        dataIndex: 'name',
    },
    {
        title: '交易对',
        dataIndex: 'symbol',
    },
    {
        title: '运行/买入状态',
        dataIndex: 'status',
    },
    {
        title: '实时盈亏',
        dataIndex: 'nowRiseRate',
    },
    // {
    //     title: '场内U',
    //     dataIndex: 'buyUsdtAmount',
    // },
    {
        title: '盈利/出场数',
        dataIndex: 'count',
    },
    {
        title: '总盈利率',
        dataIndex: 'riseRate',
    },

];
//let data = [];
// for (let i = 1; i <= 10; i++) {
//     data.push({
//         key: i,
//         name: `Edward King ${i}`,
//         symbol: 'ETHUSDT',
//         status: `入场检测`,
//         nowRiseRate: `-0.00254`,
//         count: 24,
//         riseRate: '77%',

//     });
// }

export default function Statistics() {
    const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);
    const [data, setData] = React.useState([]);
    React.useEffect(() => {
        EventHub.getInstance().addEventListener('mapTacticsList', 'st_mapTacticsList', payload => {
            //const target = payload.find(item => item.target);
            let ckeckedKey = -1;
            const list = payload.map((item, i) => {
                if (item.target) ckeckedKey = i;
                const lastHistoryForDeal = item.historyForDeal[item.historyForDeal.length - 1];
                //const nowRiseRate = item.buyState && lastHistoryForDeal.type === 'buy' ? (lastHistoryForDeal.content.profit).toFixed(5) : '-';
                const rise = item.historyForDeal.filter(item => item.type === 'sell')
                    .map(item => ({ value: item.content.profit }))
                    .reduce((pre, cur) => pre + cur.value, 0) + (item.buyState ? lastHistoryForDeal.content.profit : 0);
                return {
                    key: i,
                    name: item.name,
                    symbol: item.symbol,
                    status: `${item.runState ? '运行中/' + (item.buyState ? '场内' : '场外') : '未运行'}${item.imitateRun ? '-模拟' : ''}`,
                    nowRiseRate: item.buyState && lastHistoryForDeal.type === 'buy' ? Number((lastHistoryForDeal.content.profit).toFixed(5)) : '-',
                    //buyUsdtAmount: Number(item.presentDeal.amount.toFixed(2)),
                    count: item.historyForDeal.filter(item => item.type === 'sell' && item.content.profit > 0).length + '/' + item.historyForDeal.filter(item => item.type === 'sell').length,
                    riseRate: Number(((rise / item.parameter.usdtAmount) * 100).toFixed(4)) + '%',
                }
            });
            setData(list);
            if (ckeckedKey !== -1 && selectedRowKeys.indexOf(ckeckedKey) === -1) {
                let _selectedRowKeys = [];
                _selectedRowKeys.push(ckeckedKey);
                _selectedRowKeys = Array.from(new Set(_selectedRowKeys))
                setSelectedRowKeys(_selectedRowKeys);
                EventHub.getInstance().dispatchEvent('rowSelection', _selectedRowKeys);
            }
        });
        EventHub.getInstance().addEventListener('switchTactics', 'st_switchTactics', payload => {
            
        });
        return () => {
            EventHub.getInstance().removeEventListener('mapTacticsList', 'st_mapTacticsList');
            EventHub.getInstance().removeEventListener('switchTactics', 'st_switchTactics');
        }
    }, [selectedRowKeys]);

    const onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        setSelectedRowKeys(selectedRowKeys);
        console.log(selectedRowKeys)
        EventHub.getInstance().dispatchEvent('rowSelection', selectedRowKeys);
    };
    
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    return <div id='statistics'>
        <Table pagination={false} size="small" rowSelection={rowSelection} columns={columns} dataSource={data} />
    </div>
}