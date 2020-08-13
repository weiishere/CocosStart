/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-08-13 19:38:14
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import echarts from 'echarts';
import EventHub from '@client/EventHub'
import dateFormat from 'format-datetime'
import './style.less'


const data = [["00", 13], ["01", 15], ["02", 12], ["03", 2], ["04", 0], ["05", 7], ["06", 11], ["07", 17], ["08", 8], ["09", 6], ["10", 4], ["11", 11],
["12", 11], ["13", 15], ["14", 12], ["15", 6], ["16", 2], ["17", 11], ["18", 11], ["19", 14], ["20", 8], ["21", 21], ["10", 8], ["22", 4], ["23", 14]];

var dateList = data.map(function (item) {
    return item[0];
});
var valueList = data.map(function (item) {
    return item[1];
});

// const option = {

//     // Make gradient line here
//     visualMap: [{
//         show: false,
//         type: 'continuous',
//         seriesIndex: 0,
//         min: 0,
//         max: 30
//     }],
//     title: [{
//         text: '入场次数/小时'
//     }],
//     tooltip: {
//         trigger: 'axis'
//     },
//     xAxis: [{
//         data: dateList
//     }],
//     yAxis: [{
//         splitLine: {show: false}
//     }],
//     series: [{
//         type: 'line',
//         showSymbol: false,
//         data: valueList
//     }]
// };
let dataName = []
let data1 = [];
let data2 = [];
const option = (symbol, presentTradeInfo) => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    title: {
        text: `挂单(${symbol || localStorage.getItem("SymbleForBs")})`,
        subtext: presentTradeInfo && `最新成交：${dateFormat(new Date(presentTradeInfo.tradeTime), "HH:mm:ss")} 成交${Number(presentTradeInfo.quantity)}枚，均价：${Number(presentTradeInfo.price)}`
    },
    legend: {
        data: ['卖盘(枚)', '买盘(枚)']
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [
        {
            type: 'value',
            axisLabel: {
                formatter: (value, index) => value < 0 ? -value : value,
            }
        }
    ],
    yAxis: [
        {
            type: 'category',
            axisTick: {
                show: false
            },
            data: dataName
        }
    ],
    series: [
        {
            name: '卖盘(枚)',
            type: 'bar',
            stack: '总量',
            label: {
                position: 'right',
                show: true,
                formatter: params => -params.value,
            },
            data: data1
        },
        {
            name: '买盘(枚)',
            type: 'bar',
            stack: '总量',
            label: {
                position: 'left',
                show: true,
                formatter: params => params.value,
            },
            data: data2
        }
    ]
})

export default function Rate() {
    const [index] = React.useState(0);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("rate"), 'dark');
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target === true);
            if (target && target.depth) {
                //console.log(target.depth);
                const asks = target.depth.asks.reverse();
                const bids = target.depth.bids.reverse();
                dataName = asks.map((item, i) => `卖${Number(item.price)}U / 买${Number(bids[i].price)}U`)
                data1 = asks.map(item => -Number(item.quantity));
                data2 = bids.map(item => Number(item.quantity));
                const _data = option((target ? target.symbol : ''), target.presentTrade);
                localStorage.setItem("RateData", JSON.stringify(_data));
                myChart.setOption(_data);
            }
        });
        const _d = localStorage.getItem("RateData");
        if (_d) myChart.setOption(JSON.parse(_d));
    }, []);
    return <div id='rate'></div>
}