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
            }
        },
        grid: {
            top: 80,
            bottom: 30
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
            data: showData.map(item => item.time ? dateFormat(new Date(item.time), "HH:mm") : '')//['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one','four', 'three', 'two', 'one']
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
                data:showData
            }
        ]
        // tooltip: {
        //     //trigger: 'axis',
        //     axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        //         type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        //     }
        // },
        // grid: {
        //     top: 80,
        //     bottom: 30
        // },
        // xAxis: {
        //     type: 'category',
        //     //position: 'left',
        //     splitLine: {
        //         lineStyle: {
        //             type: 'dashed'
        //         }
        //     }
        // },
        // yAxis: {
        //     type: 'value',

        //     //data: ['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one']
        // },
        // series: [
        //     {
        //         name: '盈亏',
        //         type: 'bar',
        //         stack: '总量',
        //         label: {
        //             show: false,
        //             formatter: '{b}'
        //         },
        //         data
        //     }
        // ]
    }
};


export default function PlusMinus() {
    const [index] = React.useState(0);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("plus-minus"), 'dark');
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target) {
                // data = target.historyForDeal.filter(item => item.type === 'sell').map(item => ({
                //     value: item.content.profit, name: Number(item.content.profit), label: {position: 'top'}, itemStyle: { color: item.content.profit < 0 ? 'green' : 'red' }
                // }));
                data = target.historyForDeal.filter(item => item.type === 'sell').map(item => ({
                    value: item.content.profit, 
                    name: Number(item.content.profit.toFixed(3)), 
                    label: { position: 'top' }, 
                    itemStyle: { color: item.content.profit < 0 ? 'green' : 'red' },
                    time: item.time
                }));
                //如果最后一个type=buy，就需要加入，用来记录当前的利润变化
                const lastHistoryForDeal = target.historyForDeal[target.historyForDeal.length - 1];
                if (lastHistoryForDeal && lastHistoryForDeal.type === 'buy') {
                    data.push({
                        value: lastHistoryForDeal.content.profit, name: Number(lastHistoryForDeal.content.profit.toFixed(3)),
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
            }
        });
        myChart.setOption(option());
    }, []);
    return <div id='plus-minus'></div>
}