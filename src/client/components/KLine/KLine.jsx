/*
 * @Author: weishere.huang
 * @Date: 2020-07-23 22:33:14
 * @LastEditTime: 2020-09-17 14:40:44
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

let symbolTicker = {};
let rawData = JSON.parse(localStorage.getItem("klineData")) || [];//[['2015/12/31', '3570.47', '3539.18', '-33.69', '-0.94%', '3538.35', '3580.6', '176963664', '25403106', '-']].reverse();
let bollData = {
    UP: [],
    MB: [],
    DN: []
};
let KDJData = {
    K: [],
    D: [],
    J: []
};
const optionForKdj = () => ({
    title: {
        text: ''
    },
    backgroundColor: '#21202D',
    tooltip: {
        trigger: 'axis'
    },
    color: ['#4472C5', '#ED7C30', '#80FF80'],
    legend: {
        data: ['K', 'D', 'J']
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: KDJData.K.map(item => item.formartStartTime.split(' ')[1])
    },
    yAxis: {
        type: 'value',
        interval: 38,
        splitLine: { show: false }
    },
    dataZoom: [{
        type: 'inside',
        start: 35,
        end: 100
    },
    {
        show: true,
        height: 15,
        type: 'slider',
        start: 35,
        end: 100,
        bottom: 2
    }],
    grid: {
        bottom: 17,
        left: 1,
        right:'4%',
        top: 10,
        containLabel: true
    },
    series: [
        {
            name: 'K',
            type: 'line',
            lineStyle: { width: 1, }, symbol: 'none',
            data: KDJData.K.map(item => item.K),
        },
        {
            name: 'D',
            type: 'line',
            lineStyle: { width: 1, }, symbol: 'none',
            data: KDJData.D.map(item => item.D)
        },
        {
            name: 'J',
            type: 'line',
            lineStyle: { width: 1, }, symbol: 'none',
            data: KDJData.J.map(item => item.J)
        },
        {
            type: 'line',
            markLine: {
                symbol: "none",
                label: { position: "end" },
                data: [{
                    silent: true,
                    lineStyle: {
                        type: "dotted",
                        color: "#666",
                    },
                    yAxis: [20]          // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
                },
                {
                    silent: true,
                    lineStyle: {
                        type: "dotted",
                        color: "#666",
                    },
                    yAxis: [50]          // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
                },
                {
                    silent: true,
                    lineStyle: {
                        type: "dotted",
                        color: "#666",
                    },
                    yAxis: [80]          // 警戒线的标注值，可以有多个yAxis,多条警示线   或者采用   {type : 'average', name: '平均值'}，type值有  max  min  average，分为最大，最小，平均值
                }]
            }
        }
    ]
});
const option = (symbol) => {
    //const _rewData =rawData.length===0?[]: JSON.parse(localStorage.getItem("klineData")) || [];
    const dates = rawData.map(function (item) {
        return item[0];
    });
    const _default = '';//rawData[rawData.length - 1][1];
    let bollLineData = { UP: [], MB: [], DN: [] };
    rawData.forEach(function (item, i) {
        let dn, mb, up;
        up = bollData.UP.find(bd => item[0] === (bd.formartStartTime ? bd.formartStartTime.split(' ')[1] : '17:10'));
        mb = bollData.MB.find(bd => item[0] === (bd.formartStartTime ? bd.formartStartTime.split(' ')[1] : '17:10'));
        dn = bollData.DN.find(bd => item[0] === (bd.formartStartTime ? bd.formartStartTime.split(' ')[1] : '17:10'));

        bollLineData.UP.push(up ? up.UP : _default);
        bollLineData.MB.push(mb ? mb.MB : _default);
        bollLineData.DN.push(dn ? dn.DN : _default);
    });
    const data = rawData.map(function (item) {
        return [+item[1], +item[4], +item[3], +item[2]];
    });
    return {
        title: {
            text: `5分线(${symbol})`,
            subtext: symbolTicker ? `H:${+symbolTicker.high} / L:${+symbolTicker.low} / O:${+symbolTicker.open} / C:${+symbolTicker.curDayClose} 日幅:${symbolTicker.priceChangePercent}%` : ''
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
        legend: {
            data: ['UP', 'MB', 'DN'],
            top: "1%"
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
            bottom: 60,
            left: 50,
            right:'3%'
        },

        dataZoom: [{
            type: 'inside',
            start: 50,
            end: 100
        },
        {
            show: true,
            height: 25,
            type: 'slider',
            start: 50,
            end: 100
        }, {
            textStyle: { color: '#8392A5' },
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%', height: 25,
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
                shadowBlur: 3, height: 25,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2
            },
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
            },
            {
                name: 'UP',
                data: bollLineData.UP,
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 1, }
            },
            {
                name: 'MB',
                data: bollLineData.MB,
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 1, }
            },
            {
                name: 'DN',
                data: bollLineData.DN,
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 1, }
            }
        ]
    };
}
const hoursInterval = 12;

const setOptionForNoCover = (myChart, symbol) => {
    let _option = myChart.getOption();
    let oldOption = option(symbol);
    localStorage.setItem("klineSymbol", symbol);
    myChart.setOption(Object.assign({}, _option, {
        title: oldOption.title,
        xAxis: oldOption.xAxis,
        yAxis: oldOption.yAxis,
        series: oldOption.series
    }));
    const myChartKdj = echarts.init(document.getElementById("kdj-line"), 'dark');
    myChartKdj.setOption(optionForKdj());
}

const initKlineData = (myChart, symbol, callback) => {
    if (!symbol) return;
    let now = new Date();
    let lastHour = now.setHours(now.getHours() - hoursInterval);
    requester({
        url: api.klines,
        params: {
            symbol: symbol,
            interval: "5m",
            startTime: lastHour
        },
        option: {
            failedBack: (error) => { message.error({ content: error, duration: 2 }) }
        }
    }).then(result => {
        let arr = [];
        for (let i = 0; i < result.res.data.length; i++) {
            arr.push(result.res.data[i].slice(0));
            arr[i][0] = dateFormat(new Date(+result.res.data[i][0]), "HH:mm");
            arr[i][arr[i].length - 1] = +result.res.data[i][0];
        }
        rawData = arr;
        localStorage.setItem("klineData", JSON.stringify(arr));
        setOptionForNoCover(myChart, symbol);
        callback && callback();
    });

    requester({
        url: api.getIndicatorLine,
        params: { symbol: symbol },
        option: { baseUrl: 'API_server_url', failedBack: (error) => message.error({ content: error, duration: 2 }) }
    }).then(({ res }) => {
        bollData = { UP: [], MB: [], DN: [] };
        KDJData = { K: [], D: [], J: [] };
        res.data.data.boll5m.forEach(({ formartStartTime, UP, MB, DN }) => {
            bollData.UP.push({ formartStartTime, UP });
            bollData.MB.push({ formartStartTime, MB });
            bollData.DN.push({ formartStartTime, DN });
        });
        res.data.data.KDJ5m.forEach(({ formartStartTime, K, D, J }) => {
            KDJData.K.push({ formartStartTime, K: (K ? parseInt(K) : '') });
            KDJData.D.push({ formartStartTime, D: (D ? parseInt(D) : '') });
            KDJData.J.push({ formartStartTime, J: (J ? parseInt(J) : '') });
        });
        setOptionForNoCover(myChart, symbol);
    });
}

export default function KLine() {
    const [index] = React.useState(0);
    let theSymbol = '';
    let lastKlineDate;
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("k-line"), 'dark');
        myChart.setOption(option(localStorage.getItem("klineSymbol") || ''));
        let timer;
        const change = (symbol) => {
            theSymbol = symbol;
            localStorage.setItem("klineSymbol", symbol);
            const key = 'loading';
            message.loading({ content: 'K线数据请求中..', key, duration: 0, style: { marginTop: '-3.2rem' } });
            initKlineData(myChart, localStorage.getItem("klineSymbol"), () => {
                message.success({ content: `K线成功切换为${symbol}`, key, duration: 2, style: { marginTop: '-3.2rem' } });
            });
        }
        EventHub.getInstance().addEventListener('chooseSymbol', 'kl_chooseSymbol', payload => {
            change(payload.symbol);
        });
        EventHub.getInstance().addEventListener('switchTactics', 'kl_switchTactics', payload => {
            change(payload.symbol);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', 'kl_mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            if (target && target.symbol !== theSymbol && !timer) {
                //change(target.symbol);
                timer = window.setTimeout(() => {
                    timer && window.clearTimeout(timer);
                    timer = undefined;
                    change(target.symbol);
                }, 10000);
            }
            if (target && target.KLineItem1m.startTime && target.symbol === theSymbol) {
                symbolTicker = target.ticker;
                const { startTime, isFinal, open, close, low, high } = target.KLineItem5m.present;
                const date = dateFormat(new Date(startTime), "HH:mm");
                if (rawData[rawData.length - 1][0] !== date) {
                    rawData.push([date, close, close, close, close, startTime]);
                    if (rawData.length === hoursInterval * 60 / 5) {
                        rawData.shift();
                    }
                } else {
                    rawData[rawData.length - 1] = [date, open, high, low, close, startTime];
                }
                setOptionForNoCover(myChart, target.symbol);
                //myChart.setOption(option(target.symbol));
            }
        });
        window.setInterval(() => {
            if (localStorage.getItem("klineSymbol")) initKlineData(myChart, localStorage.getItem("klineSymbol"), () => { });
        }, 60000);
    }, []);
    return <><div id='k-line'></div><div id='kdj-line'></div></>
}