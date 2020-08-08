import React from 'react';
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'
import { message } from 'antd';
import echarts from 'echarts';
import './style.less'


var upColor = '#ec0000';
var upBorderColor = '#8A0000';
var downColor = '#00da3c';
var downBorderColor = '#008F28';


// 数据意义：开盘(open)，收盘(close)，最低(lowest)，最高(highest)
/*var data0 = splitData([
    ['2013/1/24', 2320.26, 2320.26, 2287.3, 2362.94],
    ['2013/1/25', 2300, 2291.3, 2288.26, 2308.38],
    ['2013/1/28', 2295.35, 2346.5, 2295.35, 2346.92],
    ['2013/1/29', 2347.22, 2358.98, 2337.35, 2363.8]
]);*/

let rawData = JSON.parse(localStorage.getItem("klineDataForBs")) || []
let markPointData = [];
let persentPrice = 0;

// function splitData(rawData) {
//     var categoryData = [];
//     var values = []
//     for (var i = 0; i < rawData.length; i++) {
//         categoryData.push(rawData[i].splice(0, 1)[0]);
//         values.push(rawData[i])
//     }
//     return {
//         categoryData: categoryData,
//         values: values
//     };
// }

const option = (symbol, price) => {
    const dates = rawData.map(function (item) {
        return item[0];
    });

    const data = rawData.map(function (item) {
        return [+item[1], +item[4], +item[3], +item[2]];
    });
    return {
        title: {
            text: `BS线(${symbol || localStorage.getItem("SymbleForBs")})`,
            left: 0,
            subtext: `当前价格：${Number(price)}U${persentPrice ? '/入场价：' + Number(persentPrice) + 'U' : ''}`
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'cross',
                lineStyle: {
                    color: '#376df4',
                    width: 2,
                    opacity: 1
                }
            }
        },
        // legend: {
        //     data: ['日K', 'MA5', 'MA10', 'MA20', 'MA30']
        // },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
        },
        xAxis: {
            type: 'category',
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        },
        yAxis: {
            scale: true,
            axisLine: { lineStyle: { color: '#8392A5' } },
        },
        dataZoom: [
            {
                type: 'inside',
                start: 85,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                top: '90%',
                start: 85,
                end: 100
            }
        ],
        series: [
            {
                name: '',
                type: 'candlestick',
                data: data,
                itemStyle: {
                    color: downColor,
                    color0: upColor,
                    borderColor: downBorderColor,
                    borderColor0: upBorderColor
                },
                markPoint: {
                    label: {
                        normal: {
                            formatter: function (param) {
                                return param != null ? Number(param.value) : '';
                            }
                        }
                    },
                    data: markPointData
                    // [
                    //     {
                    //         name: 'XX标点',
                    //         coord: ['01:43', 1.0872],
                    //         value: 1.0872,
                    //         itemStyle: {
                    //             color: 'rgb(41,60,85)'
                    //         }
                    //     }
                    // ]
                }
            }

        ]
    };
}


const initKlineData = (myChart, symbol) => {
    let now = new Date();
    let lastHour = now.setHours(now.getHours() - 4);
    requester({
        url: api.klines,
        params: {
            symbol: symbol,
            interval: "1m",
            startTime: lastHour,
            //endTime:lastHour
        },
        option: {
            failedBack: (error) => {
                //message.error(error);
                message.error({ content: error, key, duration: 2 });
            }
        }
    }).then(result => {
        let arr = [];
        for (let i = 0; i < result.res.data.length; i++) {
            arr.push(result.res.data[i].slice(0));
            arr[i][0] = dateFormat(new Date(+result.res.data[i][0]), "HH:mm")
        }
        rawData = arr;
        let _option = myChart.getOption();
        let oldOption = option(symbol, result.res.data[result.res.data.length - 1][4]);

        myChart.setOption(Object.assign({}, _option, {
            title: oldOption.title,
            xAxis: oldOption.xAxis,
            yAxis: oldOption.yAxis,
            series: oldOption.series,
            markPoint: oldOption.markPoint
        }));
        //myChart.setOption(option(symbol, result.res.data[result.res.data.length - 1][4]));
        localStorage.setItem("klineDataForBs", JSON.stringify(arr));
        localStorage.setItem("SymbleForBs", symbol);
    })
}

export default function BSLine() {
    const [index] = React.useState(0);
    let symbol = '';
    let updateCount = 0;
    React.useEffect(() => {

        //let lastHour = now.setHours(now.getHours() - 1);
        let lastIsFinal = false;
        const myChart = echarts.init(document.getElementById("bs-line"), "dark");
        myChart.setOption(option('', 0));
        EventHub.getInstance().addEventListener('switchTactics', payload => {
            const key = 'loading';
            symbol = payload.symbol;
            markPointData = [];
            //message.loading({ content: 'K线数据请求中2..', key, duration: 0 });
            initKlineData(myChart, payload.symbol);
        });
        EventHub.getInstance().addEventListener('klineData', payload => {
            if (payload.symbol === symbol) {
                const { startTime, isFinal, open, close, low, high } = payload;
                initKlineData(myChart, payload.symbol);
                // const arr = [dateFormat(new Date(+startTime), "HH:mm"), open, high, low, close];
                // if (isFinal) {
                //     if (!lastIsFinal) {
                //         rawData = rawData.concat([[dateFormat(new Date(+startTime), "HH:mm"), close, close, close, close]]);
                //         lastIsFinal = true;
                //     }
                // } else {
                //     lastIsFinal = false;
                //     rawData[rawData.length - 1] = arr;
                // }
                // myChart.setOption(option(symbol, close));
                // localStorage.setItem("klineDataForBs", JSON.stringify(rawData));
            }
        });
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            persentPrice = !target ? 0 : (target.buyState ? target.presentDeal.payPrice : 0);
            if (!target) return;
            if (target.historyForDeal.length === markPointData.length) return;
            markPointData = target.historyForDeal.map((item, i) => ({
                name: '标点' + i,
                coord: [dateFormat(new Date(item.time), "HH:mm"), item.content.price],
                value: item.content.price,
                itemStyle: {
                    color: item.type === 'buy' ? 'red' : 'green'//'rgb(41,60,85)'
                }
            }));
            initKlineData(myChart, symbol);
        });
    }, []);
    return <div id='bs-line'></div>
}