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
            },
            formatter: function (param) {
                return `${param[0].axisValue}<br/>开盘：${param[0].value[1]}<br/>收盘：${param[0].value[2]}<br/>
                最高：${param[0].value[4]}<br/>最低：${param[0].value[3]}<br/>涨跌：${((param[0].value[2] - param[0].value[1]) / param[0].value[2] * 100).toFixed(2)}`;
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
                start: 75,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                start: 75,
                end: 100
            },
            {
                textStyle: { color: '#8392A5' },
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                dataBackground: {
                    areaStyle: {
                        color: '#8392A5'
                    },
                    lineStyle: {
                        opacity: 0.8,
                        color: '#8392A5'
                    }
                },
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
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
                    itemStyle: {
                        opacity: 0.5
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
    let lastHour = now.setHours(now.getHours() - 3);
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
        setOptionForNoCover(myChart, symbol, result.res.data[result.res.data.length - 1][4])
    })
}

const setOptionForNoCover = (myChart, symbol, price) => {
    let _option = myChart.getOption();
    let oldOption = option(symbol, price);

    myChart.setOption(Object.assign({}, _option, {
        title: oldOption.title,
        xAxis: oldOption.xAxis,
        yAxis: oldOption.yAxis,
        series: oldOption.series,
        markPoint: oldOption.markPoint
    }));
    localStorage.setItem("klineDataForBs", JSON.stringify(rawData));
    localStorage.setItem("SymbleForBs", symbol);
}

export default function BSLine() {
    const [index] = React.useState(0);
    let symbol = '';
    let lastKlineDate;
    React.useEffect(() => {
        //let lastHour = now.setHours(now.getHours() - 1);
        let lastIsFinal = false;
        const myChart = echarts.init(document.getElementById("bs-line"), "dark");
        myChart.setOption(option('', 0));
        EventHub.getInstance().addEventListener('switchTactics', 'bs_switchTactics', payload => {
            markPointData = [];
            initKlineData(myChart, payload.symbol);
        });
        // EventHub.getInstance().addEventListener('klineData', payload => {
        //     if (payload.symbol === symbol) {
        //         const { startTime, isFinal, open, close, low, high } = payload;
        //         isFinal && console.log(dateFormat(new Date(startTime), "HH:mm"));
        //     }
        // });

        EventHub.getInstance().addEventListener('mapTacticsList', 'bs_mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            persentPrice = !target ? 0 : (target.buyState ? target.presentDeal.payPrice : 0);
            if (!target) return;
            if (symbol !== target.symbol) {
                symbol = target.symbol;
                initKlineData(myChart, symbol);
            } else {
                if (target.KLineItem1m.startTime) {
                    const { startTime, isFinal, open, close, low, high } = target.KLineItem1m;
                    const date = dateFormat(new Date(startTime), "HH:mm");
                    if (rawData[rawData.length - 1][0] !== date) {
                        rawData.push([date, close, close, close, close]);
                    } else {
                        rawData[rawData.length - 1] = [date, open, high, low, close];
                    }
                    setOptionForNoCover(myChart, target.symbol, close);
                    //myChart.setOption(option(target.symbol, close));
                }
            }
            // markPointData = target.historyForDeal.map((item, i) => ({
            //     name: '标点' + i,
            //     coord: [dateFormat(new Date(item.time), "HH:mm"), item.content.price],
            //     value: item.content.price,
            //     itemStyle: {
            //         color: item.type === 'buy' ? 'red' : 'green'//'rgb(41,60,85)'
            //     }
            // }));
        });
        EventHub.getInstance().addEventListener('historyRecord', 'bs_historyRecord', ({ historyForDeal }) => {
            markPointData = historyForDeal.map((item, i) => ({
                name: '标点' + i,
                coord: [dateFormat(new Date(item.time), "HH:mm"), item.content.price],
                value: item.content.price,
                itemStyle: {
                    color: item.type === 'buy' ? 'red' : 'green'//'rgb(41,60,85)'
                }
            }));
        });
        // window.setInterval(() => {
        //     initKlineData(myChart, symbol);
        // }, 60000);//1分钟矫正一次
    }, []);
    return <div id='bs-line'></div>
}