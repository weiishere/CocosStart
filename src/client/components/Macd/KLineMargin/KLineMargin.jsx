/*
 * @Author: weishere.huang
 * @Date: 2020-07-23 22:33:14
 * @LastEditTime: 2020-10-23 16:46:29
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react'
import * as echarts from 'echarts';
import { requester } from '@src/tool/Requester'
import api from '@client/api';
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'
//import message from 'antd/lib/message'
import { message } from 'antd';
import * as talib from 'ta-lib';
import './style.less'

let symbolTicker = null;
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
let macdData = [];
// for (let i = 0; i < 150; i++) {
//     const t = Math.random() < 0.5 ? 1 : -1;
//     macdData.push({ value: parseInt(Math.random() * 100) * t, itemStyle: { color: t == -1 ? 'red' : 'green' } });
// }
let markPointData = [];
let dates = [];
let data = [];

const option = (symbol) => {
    //const _rewData =rawData.length===0?[]: JSON.parse(localStorage.getItem("klineData")) || [];
    dates = rawData.map(function (item) {
        return item[0];
    });
    data = rawData.map(function (item) {
        return [+item[1], +item[4], +item[3], +item[2]];
    });
    // markPointData = [{
    //     "name": "标点",
    //     "coord": ["00:15", 59816.06],
    //     "value": 59816.06,
    //     "itemStyle": {
    //         "color": "green",
    //         "borderColor": "#cccccc",
    //         "borderWidth": 1
    //     }
    // }];
    return {
        // title: {
        //     text: `BTC`,
        //     subtext: symbolTicker ? `${symbol}-tiker H:${+symbolTicker.high} / L:${+symbolTicker.low} / O:${+symbolTicker.open} / C:${+symbolTicker.curDayClose} 日幅:${symbolTicker.priceChangePercent}%` : ''
        // },
        backgroundColor: '#21202D',
        // legend: {
        //     data: [symbol, 'MA5', 'MA10', 'MA20', 'MA30'],
        //     inactiveColor: '#777',
        //     textStyle: {
        //         color: '#fff'
        //     }
        // },

        // tooltip: {
        //     trigger: 'axis',
        //     axisPointer: {
        //         animation: false,
        //         type: 'cross',
        //         lineStyle: {
        //             color: '#376df4',
        //             width: 2,
        //             opacity: 1
        //         }
        //     },
        //     formatter: function (param, index) {
        //         return `${param[0].axisValue}<br/>开盘：${param[0].value[1]}<br/>MACD：${macdData[+param[0].value[0]]}<br/>收盘：${param[0].value[2]}<br/>
        //         最高：${param[0].value[4]}<br/>最低：${param[0].value[3]}<br/>涨跌：${((param[0].value[2] - param[0].value[1]) / param[0].value[2] * 100).toFixed(2)}`;
        //     }
        // },

        tooltip: {
            trigger: 'axis',
            // triggerOn: 'none',
            transitionDuration: 0,
            confine: true,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#333',
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
                fontSize: 12,
                color: '#333'
            },
            position: function (pos, params, el, elRect, size) {
                const obj = {
                    top: 60
                };
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
                return obj;
            }
        },

        // legend: {
        //     data: ['UP', 'MB', 'DN'],
        //     top: "1%"
        // },
        xAxis: [{
            type: 'category',
            data: dates,
            axisLine: { show: true, lineStyle: { color: '#8392A5' } },
            axisTick: {
                alignWithLabel: true
            },
            axisPointer: {
                type: 'shadow',
                show: true
            },
            axisLabel: {
                fontSize: 8
            }
        }, {
            type: 'category',
            gridIndex: 1,
            data: dates,
            axisLine: { show: true, lineStyle: { color: '#8392A5' } },
            axisTick: {
                alignWithLabel: true
            },
            axisLabel: {
                fontSize: 8
            },
            axisPointer: {
                type: 'shadow',
                label: { show: false },
                triggerTooltip: true,
                handle: {
                    show: true,
                    margin: 10,
                    shadowBlur: 0,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    color: '#B80C00'
                }
            }
        }],
        yAxis: [{
            scale: true,
            axisLine: { lineStyle: { color: '#8392A5' } },
            splitLine: { show: true, lineStyle: { color: '#666' } }

        },
        {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLine: { lineStyle: { color: '#8392A5' } },
            splitLine: { show: true, lineStyle: { color: '#333' } }
        }],
        grid: [{
            bottom: 140,
            left: 50,
            right: '3%',
            top: 70
        }, {
            bottom: 30,
            left: 50,
            right: '3%',
            top: 250,
            tooltip: {
                show: false
            }
        }],
        axisPointer: {
            link: [
                {
                    xAxisIndex: [0, 1]
                }
            ]
        },
        dataZoom: [{
            show: true,
            height: 25,
            type: 'inside',
            start: 40,
            end: 100,
            top: 10,
            xAxisIndex: [0, 1]
        },
        {
            show: true,
            height: 25,
            type: 'slider',
            start: 40,
            end: 100,
            top: 10,
            xAxisIndex: [0, 1]
        }, {
            textStyle: { color: '#8392A5' },
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%', height: 25, top: 10,
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
                shadowBlur: 3, height: 25, top: 10,
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
                        opacity: 0.7
                    },
                    data: markPointData
                }
            },
            {
                name: 'macd',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    color: '#7fbe9e'
                },
                emphasis: {
                    itemStyle: {
                        color: '#140'
                    }
                },
                data: macdData
            }
        ]
    };
}
const hoursInterval = 24;

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
    // const myChartKdj = echarts.init(document.getElementById("kdj-line"), 'dark');
    // myChartKdj.setOption(optionForKdj());
}

const initKlineData = (myChart, symbol, callback) => {
    if (!symbol) return;
    let now = new Date();
    let lastHour = now.setHours(now.getHours() - hoursInterval);

    // requester({
    //     url: '/fapi/v1/klines',
    //     params: {
    //         symbol: 'BTCUSDT',
    //         interval: "5m",
    //         startTime: lastHour
    //     },
    //     option: {
    //         baseUrl: 'fapi_base_url',
    //         failedBack: (error) => { }
    //     }
    // }).then(rssult => {
    //     debugger
    // })

    // requester({
    //     url: api.getKlineAndMacd,
    //     params: {
    //         symbol: symbol,
    //         interval: "5m",
    //         startTime: lastHour
    //     },
    //     option: {
    //         baseUrl: 'API_server_url',
    //         failedBack: (error) => { message.error({ content: error, duration: 2 }) }
    //     }
    // }).then(({ res }) => {
    //     const { klines, macd } = res.data.data;
    //     rawData = klines;
    //     localStorage.setItem("klineData", JSON.stringify(klines));
    //     macdData = macd.map(item => ({
    //         value: item, itemStyle: { color: item < 0 ? 'red' : 'green' }
    //     }));
    //     setOptionForNoCover(myChart, symbol);
    // });

    requester({
        url: api.backTestMacd,
        params: {
            symbol: symbol,
            interval: "5m",
            startTime: lastHour,
            diffKvalue:300
        },
        option: {
            baseUrl: 'API_server_url',
            failedBack: (error) => { message.error({ content: error, duration: 2 }) }
        }
    }).then(({ res }) => {
        const { statistics, topIndex, klines, macd } = res.data.data;
        console.log("statistics", statistics);
        rawData = klines;
        localStorage.setItem("klineData", JSON.stringify(klines));
        macdData = macd.map(item => ({
            value: item, itemStyle: { color: item < 0 ? 'red' : 'green' }
        }));
        markPointData = 
        topIndex.map(({ index, topValue }) => ({
            name: '峰顶',
            coord: [dates[index], data[index][1]],
            value: data[index][1],
            itemStyle: {
                color: 'black',
                borderColor: '#ffffff',
                borderWidth: 0
            }
        }))

        markPointData = markPointData.concat(statistics.map(({ index, type }) => ({
            name: '事件点',
            //coord: [dateFormat(new Date(+dates[index]), "HH:mm"), data[index][0]],
            coord: [dates[index], data[index][0]],
            value: data[index][0],
            itemStyle: {
                color: type === 'short' ? 'green' : 'red',
                borderColor: '#cccccc',
                borderWidth: 1
            }
        })));
        setOptionForNoCover(myChart, symbol);
    });

    // requester({
    //     url: api.klines,
    //     params: {
    //         symbol: symbol,
    //         interval: "5m",
    //         startTime: lastHour
    //     },
    //     option: {
    //         failedBack: (error) => { message.error({ content: error, duration: 2 }) }
    //     }
    // }).then(result => {
    //     let arr = [];
    //     let closeList = [];
    //     for (let i = 0; i < result.res.data.length; i++) {
    //         arr.push(result.res.data[i].slice(0));
    //         arr[i][0] = dateFormat(new Date(+result.res.data[i][0]), "HH:mm");
    //         arr[i][arr[i].length - 1] = +result.res.data[i][0];
    //         closeList.push(+result.res.data[i][4]);
    //     }
    //     rawData = arr;
    //     localStorage.setItem("klineData", JSON.stringify(arr));

    //     // let closeList = [];
    //     // if (exchange.has.fetchOHLCV) {
    //     //     let ohlcv = await exchange.fetchOHLCV(symbol, '5m');
    //     //     closeList = ohlcv.map(item => item[4]);
    //     // }
    //     const re = talib.MACD(closeList.reverse(), 12, 26, 9);
    //     macdData = re.histogram.reverse().map(item => ({
    //         value: item, itemStyle: { color: item < 0 ? 'red' : 'green' }
    //     }));
    //     // console.log(re);
    //     setOptionForNoCover(myChart, symbol);
    //     callback && callback();
    // });

    /*
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
    });*/

}

export default function KLineMargin() {
    const [index] = React.useState(0);
    let theSymbol = '';
    let lastKlineDate;
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("k-line-mobile"), 'dark');
        myChart.setOption(option(localStorage.getItem("klineSymbol") || ''));
        let timer;
        // const change = (symbol) => {

        //     localStorage.setItem("klineSymbol", symbol);
        //     const key = 'loading';
        //     message.loading({ content: 'K线数据请求中..', key, duration: 0, style: { marginTop: '-3.2rem' } });
        // initKlineData(myChart, localStorage.getItem("klineSymbol"), () => {
        //     message.success({ content: `K线成功切换为${symbol}`, key, duration: 2, style: { marginTop: '-3.2rem' } });
        //     theSymbol = symbol;
        // });
        // }
        // EventHub.getInstance().addEventListener('chooseSymbol', 'kl_chooseSymbol', payload => {
        //     change(payload.symbol);
        // });
        // EventHub.getInstance().addEventListener('switchTactics', 'kl_switchTactics', payload => {
        //     change(payload.symbol);
        // });
        EventHub.getInstance().addEventListener('mapTacticsList', 'kl_mapTacticsList', payload => {
            const target = payload.find(item => item.target);
            //console.log(target.symbol)
            // if (target && target.symbol !== theSymbol && !timer) {
            //     //change(target.symbol);
            //     timer = window.setTimeout(() => {
            //         timer && window.clearTimeout(timer);
            //         timer = undefined;
            //         change(target.symbol);
            //     }, 10000);
            // }
            if (target && target.KLineItem5m.present.startTime && target.symbol === theSymbol) {
                symbolTicker = target.ticker;
                const { startTime, isFinal, open, close, low, high } = target.KLineItem5m.present;
                const date = dateFormat(new Date(startTime), "dd-HH:mm");
                if (rawData[rawData.length - 1][0] !== date) {
                    console.log(target.KLineItem5m.present)
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
        initKlineData(myChart, localStorage.getItem("klineSymbol"), () => { });
        window.setInterval(() => {
            if (localStorage.getItem("klineSymbol")) initKlineData(myChart, localStorage.getItem("klineSymbol"), () => { });
        }, 60000);
    }, []);
    return <><div id='k-line-mobile'></div></>
}