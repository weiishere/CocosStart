import React from 'react';
import echarts from 'echarts';
import EventHub from '@client/EventHub'
import dateFormat from 'format-datetime'
import './style.less'




let data = [];
// [
//     { "value": 0.024698000000000775, "name": 0.024698000000000775.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": -0.01451600000000397, "name": -0.01451600000000397.toFixed(3), "label": { position: 'bottom' }, "itemStyle": { "color": "green" } },
//     { "value": 0.009473000000003395, "name": 0.009473000000003395.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.034328000000002135, "name": 0.034328000000002135.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.024698000000000775, "name": 0.024698000000000775.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": -0.01451600000000397, "name": -0.01451600000000397.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "green" } },
//     { "value": 0.009473000000003395, "name": 0.009473000000003395.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.034328000000002135, "name": 0.034328000000002135.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.040037000000001655, "name": 0.040037000000001655.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.004804000000003583, "name": 0.004804000000003583.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.024698000000000775, "name": 0.024698000000000775.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": -0.01451600000000397, "name": -0.01451600000000397.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "green" } },
//     { "value": 0.009473000000003395, "name": 0.009473000000003395.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": 0.034328000000002135, "name": 0.034328000000002135.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "red" } },
//     { "value": -0.054328000000002135, "name": -0.054328000000002135.toFixed(3), "label": { position: 'top' }, "itemStyle": { "color": "green" } }
// ]
const option = () => {
    const showData = data.slice(data.length > 15 ? data.length - 15 : 0, data.length)
    return {
        title: {
            text: `出场盈亏`,
            subtext: `当前合计：${data.reduce((pre, cur) => pre + cur.value, 0)} U`
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (param) {
                const { data, axisValue } = param[0];
                return axisValue ? `${axisValue}<br/>交易对：${data.symbol}
                ${data.inCosting ? '<br/>入场成本：' + data.inCosting : ''}
                ${data.outCosting ? '<br/>出场成本：' + data.outCosting : ''}<br/>盈亏：${data.value}` : ''
            }
        },
        grid: {
            top: '27%',
            bottom: 30,
            right:20,
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


export default function PlusMinus() {
    const [index] = React.useState(0);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("plus-minus"), 'dark');
        // EventHub.getInstance().addEventListener('mapTacticsList', payload => {
        //     const target = payload.find(item => item.target);
        //     if (target) {
        //         // data = target.historyForDeal.filter(item => item.type === 'sell').map(item => ({
        //         //     value: item.content.profit, name: Number(item.content.profit), label: {position: 'top'}, itemStyle: { color: item.content.profit < 0 ? 'green' : 'red' }
        //         // }));
        //         data = target.historyForDeal.filter(item => item.type === 'sell').map(item => ({
        //             value: item.content.profit,
        //             name: Number(item.content.profit.toFixed(3)),
        //             label: { position: 'top' },
        //             itemStyle: { color: item.content.profit < 0 ? 'green' : 'red' },
        //             time: item.time,
        //             symbol: item.content.symbol,
        //             inCosting: item.content.inCosting,
        //             outCosting: item.content.outCosting
        //         }));
        //         //如果最后一个type=buy，就需要加入，用来记录当前的利润变化
        //         const lastHistoryForDeal = target.historyForDeal[target.historyForDeal.length - 1];
        //         if (lastHistoryForDeal && lastHistoryForDeal.type === 'buy') {
        //             data.push({
        //                 value: lastHistoryForDeal.content.profit,
        //                 symbol: lastHistoryForDeal.content.symbol,
        //                 inCosting: lastHistoryForDeal.content.inCosting,
        //                 name: Number(lastHistoryForDeal.content.profit.toFixed(3)),
        //                 label: { position: 'top' },
        //                 itemStyle: { color: lastHistoryForDeal.content.profit < 0 ? 'green' : 'red' },
        //                 time: lastHistoryForDeal.time || lastHistoryForDeal.changeTime || 0
        //             });
        //         }
        //         const l = data.length;
        //         for (let i = l; i < 15; i++) {
        //             data.push({ value: 0, name: '', time: 0 });
        //         }
        //         myChart.setOption(option());
        //     }
        // });
        EventHub.getInstance().addEventListener('historyRecord','pm_historyRecord', ({historyForDeal}) => {
            //console.log(historyForDeal)
            
            data = historyForDeal.filter(item => item.type === 'sell').map(item => {
                if(!item.content.profit) console.log(item);
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
        });
        myChart.setOption(option());
    }, []);
    return <div id='plus-minus'></div>
}