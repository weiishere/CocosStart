/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 16:37:38
 * @LastEditTime: 2020-10-21 16:36:41
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Spot from './Spot.jsx'
import HedgeMargin from './HedgeMargin.jsx'
import MacdMargin from './MacdMargin.jsx'
import { BrowserRouter, Route } from 'react-router-dom'

ReactDOM.render(
	<BrowserRouter>
		<Route path="/dist/index.html" exact component={Spot}></Route>
		<Route path="/dist/hedgeMargin.html" component={HedgeMargin}></Route>
		<Route path="/dist/macdMargin.html" component={MacdMargin}></Route>
	</BrowserRouter>,
	document.getElementById('root')
);