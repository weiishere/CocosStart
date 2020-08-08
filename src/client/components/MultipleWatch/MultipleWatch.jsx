import React from 'react';
import echarts from 'echarts';
import './style.less'
import { connectScoket } from '@client/webscoketInstance'
import { WsConfig, WsRoute } from '@src/config'
import EventHub from '@client/EventHub'
import dateFormat from 'format-datetime'


let barData = [
    // [89.3, 58212, 'BTC'],
    // [57.1, 78254, 'ETH'],
    // [74.4, 41032, 'EOS'],
    // [50.1, 12755, 'HNS'],
    // [89.7, 20145, 'ADA'],
    // [68.1, 79146, 'ETC'],
    // [19.6, 91852, 'FIL'],
    // [10.6, 101852, 'STORJ'],
    // [32.7, 20112, 'LAMB'],
    // [16.7, 27002, 'ZEC']
]

const option = () => {
    const _batData = (barData.length === 0 ? JSON.parse(localStorage.getItem("nultipleData") || '[]') : barData);
    return {
        title: {
            text: `交易对实时涨幅（${localStorage.getItem("nultipleDataLastUpdate")}）`
        },
        backgroundColor: '#21202D',
        dataset: {
            source: [
                ['score', 'amount', 'symbol', 'product'],
                ..._batData
                //...barData
            ]
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: (params) => `交易对:${params[0].name}<br />分线涨幅:${params[0].value[1]}<br />5分线涨幅:${params[0].value[0]}<br />24小时:${params[0].value[2]}`
        },
        grid: { containLabel: true },
        xAxis: { name: '涨幅(指数)' },
        yAxis: {
            name: '交易对', type: 'category',
            data: _batData.map(item => item[3])
        },
        visualMap: {
            orient: 'horizontal',
            left: 'center',
            min: 0,
            max: _batData.length > 0 ? _batData.sort((a, b) => a[0] - b[0]).pop()[1] : 100,
            text: ['>100%', '<0%'],
            dimension: 0,
            inRange: {
                color: ['#D7DA8B', '#E15457']
            }
        },
        series: [
            {
                type: 'bar',
                encode: {
                    // Map the "amount" column to X axis.
                    x: 'amount',
                    // Map the "product" column to Y axis
                    y: 'product'
                }
            }
        ]
    }
}

export default class MultipleWatch extends React.PureComponent {
    componentDidMount() {
        //alert(document.querySelector("#multiple_watch"))
        let myChart = echarts.init(document.getElementById("multiple_watch"), 'dark');
        const { price_change_url } = WsConfig;
        connectScoket().then(scoket => {
            scoket.emit('triggerWs', { wsUrl: price_change_url });
            // scoket.on('allTickers', data => {
            //     console.log(data);
            // });
            // scoket.on('getData', data => {
            //     console.log(data);
            // });
            scoket.on(WsRoute.MULTIPLE_PRICE_CHANGE, data => {
                console.log('接收到最新行情信息');
                let arr = JSON.parse(data.body).slice(0);
                if (arr.length !== 0) {
                    arr = arr.sort((a, b) => b.m1ChangeRate - a.m1ChangeRate).slice(0, 10);
                    barData = arr.map(
                        item => [//item.changeRate > 0 ? item.m5ChangeRate * 100 : 0,
                            item.m5ChangeRate * 100000,
                            item.m1ChangeRate * 100000,
                            item.h24QuoteQty, item.symbol,
                            item.symbol.replace('USDT', '/USDT')]);
                    const l = barData.length;
                    for (let i = l; i < 10; i++) { barData.push([0, 0, '', '']); }
                    barData = barData.reverse();
                    localStorage.setItem("nultipleData", JSON.stringify(barData));
                    localStorage.setItem("nultipleDataLastUpdate", dateFormat(new Date(), "MM-dd HH:mm:ss"));
                    const _option = option();
                    myChart.setOption(_option);
                }
            });
        });


        myChart.setOption(option());
        const nultipleData = JSON.parse(localStorage.getItem("nultipleData") || '[]');
        //EventHub.getInstance().dispatchEvent('chooseSymbol', nultipleData.length === 0 ? '' : nultipleData[0]);
        myChart.on('click', function (params) {
            console.log(params.name);
            EventHub.getInstance().dispatchEvent('chooseSymbol', { symbol: params.name, name: params.name.replace('USDT', '/USDT') });
        });
    }
    render() {
        return <div id='multiple_watch'></div>
    }
}