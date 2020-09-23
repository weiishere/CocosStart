/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-09-17 14:27:22
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
        title: '状态',
        dataIndex: 'status',
    },
    {
        title: '实时盈亏率',
        dataIndex: 'nowRiseRate',
    },
    {
        title: '投入/补仓(倍)',
        dataIndex: 'loadUp',
    },
    {
        title: '盈利/出场数',
        dataIndex: 'count',
    },
    {
        title: '总盈亏',
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
                const times = item.loadUpBuyHelper.loadUpList.filter(i => i.roundId === item.roundId).reduce((pre, cur) => pre + cur.times, 0);
                return {
                    key: i,
                    name: item.name + (item.imitateRun ? '(模拟)' : ''),
                    symbol: item.symbol,
                    status: `${item.runState ? '运行中/' + (item.buyState ? '场内' : '场外') : '未运行'}`,
                    nowRiseRate: item.buyState && lastHistoryForDeal.type === 'buy' ? Number((lastHistoryForDeal.content.profit / item.presentDeal.costing).toFixed(5)) : '-',
                    loadUp: item.parameter.usdtAmount * (times + 1) + 'U / ' + times,
                    //buyUsdtAmount: Number(item.presentDeal.amount.toFixed(2)),
                    count: item.historyForDeal.filter(item => item.type === 'sell' && item.content.profit > 0).length + ' / ' + item.historyForDeal.filter(item => item.type === 'sell').length,
                    //riseRate: Number(((rise / (item.parameter.usdtAmount)) * 100).toFixed(4)) + '%',
                    riseRate: Number(item.historyForDeal.filter(item => item.type === 'sell').reduce((pre, cur) => pre + cur.content.profit, 0).toFixed(5))
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