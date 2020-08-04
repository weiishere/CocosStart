/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:37:01
 * @LastEditTime: 2020-07-29 02:06:03
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */ 
import React from 'react';
import echarts from 'echarts';
import './style.less'


const data = [["00",13],["01",15],["02",12],["03",2],["04",0],["05",7],["06",11],["07",17],["08",8],["09",6],["10",4],["11",11],
["12",11],["13",15],["14",12],["15",6],["16",2],["17",11],["18",11],["19",14],["20",8],["21",21],["10",8],["22",4],["23",14]];

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
const option = {
    title: {
        text: '盈利/入场次数'
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985'
            }
        }
    },
    // legend: {
    //     data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
    // },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [
        {
            type: 'category',
            boundaryGap: false,
            data: ['7/22', '7/23', '7/24', '7/25', '7/26', '7/27', '7/28']
        }
    ],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: [
        {
            name: '入场次数',
            type: 'line',
            stack: '总量',
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            areaStyle: {color:'rgba(0,0,0,0.9)'},
            data: [20, 32, 1, 34, 9, 23, 20]
        },
        {
            name: '盈利次数',
            type: 'line',
            stack: '总量2',
            areaStyle: {color:'#21202D'},
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            data: [30, 32, 31, 34, 39, 30, 30]
        }
    ]
};

export default function Rate() {
    const [index] = React.useState(0);
    React.useEffect(() => {
        var myChart = echarts.init(document.getElementById("rate"), 'dark');
        myChart.setOption(option);
    }, []);
    return <div id='rate'></div>
}