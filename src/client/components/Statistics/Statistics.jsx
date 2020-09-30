/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-09-30 22:49:38
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
        title: '总投入/补仓(倍)',
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
            const runIcon = <i title='运行中' className="iconfont_default runStyle rotation">&#xe61e;</i>;
            const buyIcon = <i title='场内' className="iconfont_default runStyle">&#xe601;</i>;
            const stopIcon = <i title='未运行' className="iconfont_default">&#xe65e;</i>;
            const sellIcon = <i title='场外' className="iconfont_default">&#xe60a;</i>;
            const imitateRunIcon = <i title='模拟运行' className="iconfont_default">&#xe69f;</i>
            const list = payload.map((item, i) => {
                if (item.target) ckeckedKey = i;
                //const lastHistoryForDeal = item.historyForDeal[item.historyForDeal.length - 1];
                //const nowRiseRate = item.buyState && lastHistoryForDeal.type === 'buy' ? (lastHistoryForDeal.content.profit).toFixed(5) : '-';
                // const rise = item.historyForDeal.filter(item => item.type === 'sell')
                //     .map(item => ({ value: item.content.profit }))
                //     .reduce((pre, cur) => pre + cur.value, 0) + (item.buyState ? lastHistoryForDeal.content.profit : 0);
                const times = item.loadUpBuyHelper.loadUpList.filter(i => i.roundId === item.roundId).reduce((pre, cur) => pre + cur.times, 0);
                const iconArr = [item.runState ? runIcon : stopIcon, ' / ', item.buyState ? buyIcon : sellIcon]
                return {
                    key: i,
                    name: [<span style={{ color: item.imitateRun ? '#3c93bd' : '#ddd' }}>{item.name}</span>],//[item.name, (item.imitateRun ? imitateRunIcon : '')],
                    symbol: item.symbol,
                    status: iconArr,//`${item.runState ? '运行中/' + (item.buyState ? '场内' : '场外') : '未运行'}`,
                    nowRiseRate: item.buyState ? Number((item.presentDeal.rtProfit / item.presentDeal.inCosting).toFixed(4)) : '-',
                    loadUp: item.buyState ? (Number(item.presentDeal.inCosting.toFixed(4)) + 'U / ' + times) : '-',
                    //buyUsdtAmount: Number(item.presentDeal.amount.toFixed(2)),
                    count: (item.historyStatistics.winRoundCount || 0) + ' / ' + (item.historyStatistics.roundCount || 0),
                    //riseRate: Number(((rise / (item.parameter.usdtAmount)) * 100).toFixed(4)) + '%',
                    riseRate: Number(((item.historyStatistics.totalProfit || 0) + (item.buyState ? item.presentDeal.rtProfit : 0)).toFixed(4))
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