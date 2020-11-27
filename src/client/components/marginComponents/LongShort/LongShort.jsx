import React from 'react';
import './style.less'

export default function LongShort() {

    return <>
        <div className='longShortWrapper'>
            <div className='ls ls_left'>
                <h3>持仓-多<span>(11520)</span></h3>
                <ul>
                    <li>
                        <span>持仓数(BTC):</span>0.5
                    </li>
                    <li>
                        <span>保证金数:</span>0.5
                    </li>
                    <li>
                        <span>持仓盈亏:</span>25.3(55%)
                    </li>
                    <li>
                        <span>已实现盈亏:</span>423U
                    </li>
                    <li>
                        <span>手续费:</span>5.5U
                    </li>
                    <li>
                        <span>平仓次数:</span>4
                    </li>
                    <li>
                        <span>价差:</span>143 U
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
                        0.5<span>:持仓数(BTC)</span>
                    </li>
                    <li>
                        0.5<span>:保证金数</span>
                    </li>
                    <li>
                        25.3(55%)<span>:持仓盈亏</span>
                    </li>
                    <li>
                        423U<span>:已实现盈亏</span>
                    </li>
                    <li>
                        5.5U<span>:手续费</span>
                    </li>
                    <li>
                        4<span>:平仓次数</span>
                    </li>
                    <li>
                        143 U<span>:价差</span>
                    </li>
                </ul>
            </div>
        </div>
        {/* <section>
            <table>
                <tr>
                    <td>逆差260</td>
                    <td>逆差260</td>
                    <td>逆差260</td>
                </tr>
            </table>
        </section> */}
    </>
}