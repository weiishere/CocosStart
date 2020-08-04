/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 02:53:38
 * @LastEditTime: 2020-07-24 03:06:16
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */ 
import React from 'react';
import echarts from 'echarts';
import './style.less'


const option = {
    title: {
        text: '币种收益比例',
        subtext: '仅统计具有收益的币种',
        left: 'center'
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        //data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
    },
    series: [
        {
            name: '币种',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
                {value: 335, name: 'BTC'},
                {value: 310, name: 'ETH'},
                {value: 234, name: 'ADA'},
                {value: 135, name: 'EOS'},
                {value: 1548, name: 'LAMB'}
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};


export default class IncomeUnit extends React.PureComponent{
    componentDidMount(){
        //alert(document.querySelector("#multiple_watch"))
        
        var myChart =echarts.init(document.getElementById("income-unit"),'dark');
        myChart.setOption(option);
    }
    render(){
        return <div id='income-unit'></div>
    }
}