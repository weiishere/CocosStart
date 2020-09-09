/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-09-08 14:53:31
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import React from 'react';
import echarts from 'echarts';
import './style.less'
import dateFormat from 'format-datetime'
import EventHub from '@client/EventHub'

let dataList = [];


const option = () => {
    var dateList = []
    dataList.forEach(item => {
        dateList = dateList.concat(item.data.map(i => ([i[0], i[2]])))
    })
    dateList = dateList.sort((a, b) => a[1] - b[1]).map(item => item[0]);
    dateList = Array.from(new Set(dateList));
    return {
        // Make gradient line here
        visualMap: [{
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 0.2
        }],
        grid: {
            left: '10%',
            right: '5%',
            bottom: '15%'
        },
        title: [{
            text: '收益趋势图'
        }],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [{
            data: dateList
        }],
        yAxis: [{
            splitLine: { show: false }
        }],
        legend: {
            data: dataList.map(item => item.name),
            top: "1%"
        },
        series: dataList.map(item => ({
            name: item.name,
            type: 'line',
            showSymbol: true,
            label: { show: false },
            //smooth: true,
            //symbol: 'none',
            lineStyle: { width: 1, },
            data: item.data
        }))
    }
};

export default function Income() {
    const [showKeys, setShowKeys] = React.useState([]);
    const [payloadBackUp, setPayloadBackUp] = React.useState([]);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("income"), 'dark');
        const render = (payload) => {
            dataList = [];
            if (showKeys.length === 0) {
                payload.forEach((item, i) => {
                    if (item.target) setShowKeys([i]);
                });
            }
            payload.forEach((tactics, i) => {
                showKeys.some(item => item === i) && dataList.push({
                    name: payload[i].name,
                    data: tactics.historyForDeal.filter(item => item.type === 'sell').map(item => ([dateFormat(new Date(item.time), "MM/dd HH:mm:ss"), Number(item.content.profit.toFixed(4)), item.time]))
                });
            });
            myChart.setOption(option());
        }
        render(payloadBackUp);
        EventHub.getInstance().addEventListener('rowSelection', 'ic_rowSelection', payload => {
            setShowKeys(payload);
        });
        EventHub.getInstance().addEventListener('mapTacticsList', 'ic_mapTacticsList', payload => {
            setPayloadBackUp(payload);
            render(payload);
        })
        return () => {
            EventHub.getInstance().removeEventListener('rowSelection', 'ic_rowSelection');
            EventHub.getInstance().removeEventListener('mapTacticsList', 'ic_mapTacticsList');
        }
    }, [showKeys, payloadBackUp]);
    return <div id='income'></div>
}