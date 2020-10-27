import React from 'react';
import './style.less'

export default function LongShort() {

    return <>
        <div className='ls ls_left'>
            <h3>持仓-多<span>(11520)</span></h3>
            <ul>
                <li>
                    <span>持仓数(BTC)：</span>0.5
                </li>
                <li>
                    <span>保证金数：</span>0.5
                </li>
                <li>
                    <span>盈亏：</span>25.3(55%)
                </li>
                <li>
                    <span>手续费：</span>0.5
                </li>
            </ul>
        </div>
        <div className='md'>
            <div className='short' style={{ top: '1rem' }}><span>12687.09</span></div>
            <div className='price' style={{ top: '3rem' }}><span>12600.33</span></div>
            <div className='long' style={{ top: '6rem' }}><span>12500.45</span></div>
        </div>
        <div className='ls ls_right'>
            <h3><span>(11520)</span>持仓-空</h3>
            <ul>
                <li>
                    0.5<span>：持仓数(BTC)</span>
                </li>
                <li>
                    0.5<span>：保证金数</span>
                </li>
                <li>
                    25.3(55%) <span>：盈亏</span>
                </li>
                <li>
                    0.5<span>：手续费</span>
                </li>
            </ul>
        </div>
    </>
}