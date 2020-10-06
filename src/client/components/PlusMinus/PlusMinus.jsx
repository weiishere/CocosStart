import React from 'react';
import echarts from 'echarts';
import EventHub from '@client/EventHub'
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import dateFormat from 'format-datetime'
import { message } from 'antd';
import './style.less'




let data = [];
// [
//     { "value": 0.024698000000000775, symbol: 'ADAUSDT', "name": 0.024698000000000775.toFixed(3), time: 1601283338000, "label": { position: 'top' }, "itemStyle": { "color": "red" } },
// ]
const option = () => {
    const showData = data.slice(data.length > 15 ? data.length - 15 : 0, data.length)
    return {
        title: {
            text: `出场盈亏`,
            subtext: `当前合计：${data.reduce((pre, cur) => pre + cur.value, 0)} U`
        },
        animation: false,
        backgroundColor: '#000000',
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (param) {
                const { data, axisValue } = param[0];
                return axisValue ? `${axisValue}<br/>交易对：${data.symbol}<br>入场时间：${data.startTime}
                ${data.inCosting ? '<br/>入场总量：' + data.inCosting : ''}${data.outCosting ? '<br/>出场总量：' + data.outCosting : ''}
                <br/>盈亏：${data.value}<br/>耗时：${parseInt(data.elapsedTime / 60)}时${parseInt(data.elapsedTime % 60)}分` : ''
            }
        },
        grid: {
            top: '27%',
            bottom: 30,
            right: 20,
        },
        yAxis: {
            type: 'value',
            position: 'top',
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        xAxis: {
            type: 'category',
            axisLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            data: showData.map(item => item.time ? dateFormat(new Date(item.time), "MM-dd HH:mm") : '')//['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one','four', 'three', 'two', 'one']
        },
        series: [
            {
                name: '盈亏',
                type: 'bar',
                stack: '总量',
                label: {
                    show: true,
                    formatter: '{b}'
                },
                data: showData
            }
        ]
    }
};
const getRoundResult = (myChart, statics) => {
    requester({
        url: api.getSimpleRoundResult,
        params: { tid: statics.id, uid: statics.uid, count: 15 },
        option: { baseUrl: 'API_server_url', failedBack: (error) => message.error({ content: error, duration: 2 }) }
    }).then(({ res }) => {
        data = res.data.data.map(item => {
            return {
                value: item.profit,
                name: Number(item.profit.toFixed(3)) + '',
                label: { position: 'top' },
                itemStyle: { color: item.profit < 0 ? 'green' : 'red' },
                time: +item.endTime,
                symbol: item.symbol,
                startTime: dateFormat(new Date(+item.startTime), "MM-dd HH:mm"),
                elapsedTime: (item.endTime - item.startTime) / 60000,
                inCosting: item.inCosting,
                outCosting: item.outCosting
            }
        });
        const l = data.length;
        for (let i = l; i < 15; i++) data.push({ value: 0, name: '', time: 0 });
        myChart.setOption(option());
        statics.buyState && realTimeRoundResult(myChart, statics);
    });
}
const realTimeRoundResult = (myChart, target) => {
    //const target = Object.prototype.toString.call(statistics) === "[object Array]" ? statistics.find(item => item.target) : statistics;
    //const target = statistics.find(item => item.target);
    if (target.buyState) {
        const _data = {
            value: target.presentDeal.rtProfit,
            name: Number(target.presentDeal.rtProfit.toFixed(3)) + '',
            label: { position: 'top' },
            itemStyle: { color: target.presentDeal.rtProfit < 0 ? 'green' : 'red' },
            time: +target.roundRunStartTime,
            startTime: dateFormat(new Date(+target.roundRunStartTime), "MM-dd HH:mm"),
            elapsedTime: (Date.parse(new Date()) - target.roundRunStartTime) / 60000,
            symbol: target.symbol,
            inCosting: target.presentDeal.inCosting,
            tag: 'realTime'
        }
        let isAdd = false;
        for (let i = 0; i < data.length; i++) {
            if (data[i].time === 0) {
                data[i] = _data;
                isAdd = true;
                break;
            }
        }
        if (!isAdd) {
            data.shift();
            data.push(_data);
        }
        const l = data.length;
        for (let i = l; i < 15; i++) data.push({ value: 0, name: '', time: 0 });
        myChart.setOption(option());
        for (let i = 0; i < data.length; i++) {
            if (data[i].tag) {
                data[i] = { value: 0, name: '', time: 0 }
                break;
            }
        }
    }
}
export default function PlusMinus() {
    const [index] = React.useState(0);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("plus-minus"), 'dark');
        EventHub.getInstance().addEventListener('switchTactics', 'pm_switchTactics', payload => {
            getRoundResult(myChart, payload);
            //realTimeRoundResult(myChart, payload);
        });
        EventHub.getInstance().addEventListener('roundResultInform', 'pm_roundResultInform', ({ order, tactices }) => {
            getRoundResult(myChart, tactices);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', 'pm_mapTacticsList', payload => {
            const target = payload.find(item => item.target)
            target && target.buyState && realTimeRoundResult(myChart, target);
        });
        /*EventHub.getInstance().addEventListener('historyRecord', 'pm_historyRecord', ({ historyForDeal }) => {
            data = historyForDeal.filter(item => item.type === 'sell').map(item => {
                if (!item.content.profit) console.log(item);
                return {
                    value: item.content.profit,
                    name: Number(item.content.profit.toFixed(3)),
                    label: { position: 'top' },
                    itemStyle: { color: item.content.profit < 0 ? 'green' : 'red' },
                    time: item.time,
                    symbol: item.content.symbol,
                    inCosting: item.content.inCosting,
                    outCosting: item.content.outCosting
                }
            });
            //如果最后一个type=buy，就需要加入，用来记录当前的利润变化
            const lastHistoryForDeal = historyForDeal[historyForDeal.length - 1];
            if (lastHistoryForDeal && lastHistoryForDeal.type === 'buy') {
                data.push({
                    value: lastHistoryForDeal.content.profit,
                    symbol: lastHistoryForDeal.content.symbol,
                    inCosting: lastHistoryForDeal.content.inCosting,
                    name: Number(lastHistoryForDeal.content.profit.toFixed(3)),
                    label: { position: 'top' },
                    itemStyle: { color: lastHistoryForDeal.content.profit < 0 ? 'green' : 'red' },
                    time: lastHistoryForDeal.time || lastHistoryForDeal.changeTime || 0
                });
            }
            const l = data.length;
            for (let i = l; i < 15; i++) {
                data.push({ value: 0, name: '', time: 0 });
            }
            myChart.setOption(option());
        });*/
        myChart.setOption(option());
    }, []);
    return <div id='plus-minus'></div>
}