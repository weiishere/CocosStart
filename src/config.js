/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-10-13 13:09:56
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
//import path from 'path'
const path = require('path');

// 系统配置
const System = {
  Server_port: '3000',
  API_server_url: 'http://localhost:3000',
  API_server_port: '3000',
  Public_path: '/public/',
  api_base_url: 'https://api.binance.com/api/v3/',
  fapi_base_url: 'https://fapi.binance.com',
  user_4620:{
    apiKey: 'tcvljRQuIZhQundkZhDTEiqUInTYzJqmqC0gTUTqnusUVKrbRmC0tYNIBDOqeAKj',
    apiSecret: 'MECvMJFQu3yXLgvaHBimrUIi5GOQzdo0I1W9C1Jh09bjL5igfCFGhjbUmuDkK4fh',
  },
  user_0722:{
    apiKey: 'N0TxBgVpvpPZFoGPaJ901Bdi2w7dtn0aozqP1MIXQ5EY51nDYtqUzAQgSRKKfeaM',
    apiSecret: '5f6BRKXLIRBG89nfKtcRg33jbAaMELQ3q2zi3PFLGXH0G7S6166inHtJ82SfGRe8',
  },
  version: '2.1'
}

const WsConfig = {
  WS_server_url: 'http://8.210.244.193:8080/stomp',//'ws://8.210.27.48:8080/stomp',
  WS_server_user: "",
  WS_server_pass: "",
  price_change_url: "/recommend-symbols"//"/price-change"
}

const WsRoute = {
  MULTIPLE_PRICE_CHANGE: 'multiple_price_change',
  EXCHANGE_LIST: 'exchange_list',
  TACTICS_LIST: 'tacticsList',
  KLINE_DATA: 'kline_data',
  HISTORY_LIST: 'history_list',
  ROUND_RESULT_INFORM: 'round_result_inform'
}

const apiDateCode = {
  success: 'A000',
  nullError: 'A001',
  serverError: 'A002',
  logicError: 'A003'
}

const DB = {
  //host: '118.114.242.126', // 服务器地址
  host: '127.0.0.1',
  port: 27017, // 数据库端口号
  username: 'admin', // 数据库用户名
  password: 'admin888', // 数据库密码
  database: 'quantitative-db', // 数据库名称
}

const SendEmail = {
  smtp: 'smtp.qq.com', // SMTP服务提供商域名
  mailFrom: '279012130@qq.com', // 用户名/用户邮箱
  pop3_authorization: 'hvrhrxilbmgccaba', // 邮箱密码
  imap_authorization:'chbyartxhifgbjjd'
}

module.exports = {
  System, WsConfig, DB, SendEmail, WsRoute, apiDateCode
}