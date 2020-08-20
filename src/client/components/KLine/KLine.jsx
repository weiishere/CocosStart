/*
 * @Author: weishere.huang
 * @Date: 2020-07-23 22:33:14
 * @LastEditTime: 2020-08-20 17:39:15
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react'
import echarts from 'echarts';
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'
//import message from 'antd/lib/message'
import { message } from 'antd';
import './style.less'

let rawData = JSON.parse(localStorage.getItem("klineData")) || [];//[['2015/12/31', '3570.47', '3539.18', '-33.69', '-0.94%', '3538.35', '3580.6', '176963664', '25403106', '-']].reverse();


const option = (symbol) => {
    //const _rewData =rawData.length===0?[]: JSON.parse(localStorage.getItem("klineData")) || [];
    const dates = rawData.map(function (item) {
        return item[0];
    });

    const data = rawData.map(function (item) {
        return [+item[1], +item[4], +item[3], +item[2]];
    });
    return {
        title: {
            text: `K线行情（${symbol}）`
        },
        backgroundColor: '#21202D',
        // legend: {
        //     data: [symbol, 'MA5', 'MA10', 'MA20', 'MA30'],
        //     inactiveColor: '#777',
        //     textStyle: {
        //         color: '#fff'
        //     }
        // },
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
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { show: true, lineStyle: { color: '#8392A5' } }
        },
        yAxis: {
            scale: true,
            axisLine: { lineStyle: { color: '#8392A5' } },
            splitLine: { show: true, lineStyle: { color: '#666' } }

        },
        grid: {
            bottom: 80
        },
        dataZoom: [{
            textStyle: {
                color: '#8392A5'
            },
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
            }
        }, {
            type: 'inside'
        }],
        animation: false,
        series: [
            {
                type: 'candlestick',
                name: symbol,//'STX/USDT',
                data: data,
                itemStyle: {
                    color: '#0CF49B',
                    color0: '#FD1050',
                    borderColor: '#0CF49B',
                    borderColor0: '#FD1050'
                }
            }
        ]
    };
}

const initKlineData = (myChart, symbol, callback) => {
    let now = new Date();
    let lastHour = now.setHours(now.getHours() - 4);
    requester({
        url: api.klines,
        params: {
            symbol: symbol,
            interval: "5m",
            startTime: lastHour,
            //endTime:lastHour
        },
        option: {
            failedBack: (error) => {
                //message.error(error);
                message.error({ content: error, duration: 2 });
            }
        }
    }).then(result => {
        let arr = [];
        for (let i = 0; i < result.res.data.length; i++) {
            arr.push(result.res.data[i].slice(0));
            arr[i][0] = dateFormat(new Date(+result.res.data[i][0]), "HH:mm")
        }
        rawData = arr;
        myChart.setOption(option(symbol));
        //localStorage.setItem("klineSymbol", symbol);
        localStorage.setItem("klineData", JSON.stringify(arr));
        callback && callback();
    })
}

export default function KLine() {
    const [index] = React.useState(0);
    let theSymbol = '';
    let lastKlineDate;
    let isTimer = true;
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("k-line"), 'dark');
        myChart.setOption(option(localStorage.getItem("klineSymbol") || ''));

        const change = (symbol) => {
            theSymbol = symbol;
            localStorage.setItem("klineSymbol", symbol);
            const key = 'loading';
            message.loading({ content: 'K线数据请求中..', key, duration: 0 });
            initKlineData(myChart, localStorage.getItem("klineSymbol"), () => {
                message.success({ content: `K线成功切换为${symbol}`, key, duration: 2 });
            });
        }
        EventHub.getInstance().addEventListener('chooseSymbol', payload => {
            change(payload.symbol);
        });
        EventHub.getInstance().addEventListener('switchTactics', payload => {
            change(payload.symbol);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target && target.KLineItem1m.startTime && target.symbol === theSymbol) {
                isTimer = true;
                const { startTime, isFinal, open, close, low, high } = target.KLineItem5m.present;
                const date = dateFormat(new Date(startTime), "HH:mm");
                if (rawData[rawData.length - 1][0] !== date) {
                    rawData.push([date, close, close, close, close]);
                } else {
                    rawData[rawData.length - 1] = [date, open, high, low, close];
                }
                myChart.setOption(option(target.symbol));
            } else {
                isTimer = false;
            }
        });
        window.setInterval(() => {
            if (localStorage.getItem("klineSymbol")) initKlineData(myChart, localStorage.getItem("klineSymbol"), () => { });
        }, 60000);
    }, []);
    return <div id='k-line'></div>
}