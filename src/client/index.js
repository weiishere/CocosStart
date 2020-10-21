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
import App from './App.jsx'
import Margin from './Margin.jsx'
import { BrowserRouter, Route } from 'react-router-dom'

ReactDOM.render(
	<BrowserRouter>
		<Route path="/dist/index.html" exact component={App}></Route>
		<Route path="/dist/margin.html" component={Margin}></Route>
	</BrowserRouter>,
	document.getElementById('root')
);