/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-08-04 14:43:15
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
  apiKey: 'N0TxBgVpvpPZFoGPaJ901Bdi2w7dtn0aozqP1MIXQ5EY51nDYtqUzAQgSRKKfeaM',
  secretKey: '5f6BRKXLIRBG89nfKtcRg33jbAaMELQ3q2zi3PFLGXH0G7S6166inHtJ82SfGRe8'
}

const WsConfig = {
  WS_server_url: 'http://8.210.244.193:8080/stomp',//'ws://8.210.27.48:8080/stomp',
  WS_server_user: "",
  WS_server_pass: "",
  price_change_url: "/recommend-symbols"//"/price-change"
}

const WsRoute = {
  MULTIPLE_PRICE_CHANGE: 'multiple_price_change',
  TACTICS_LIST: 'tacticsList',
  KLINE_DATA:'kline_data'
}

const apiDateCode = {
  success: 'A000',
  nullError: 'A001',
  serverError: 'A002'
}

const DB = {
  host: 'localhost', // 服务器地址
  port: 3306, // 数据库端口号
  username: 'admin', // 数据库用户名
  password: 'admin888', // 数据库密码
  database: 'development', // 数据库名称
  prefix: 'api_' // 默认"api_"
}

const SendEmail = {
  service: 'smtp.abcd.com', // SMTP服务提供商域名
  username: 'postmaster%40abcd.com', // 用户名/用户邮箱
  password: 'password', // 邮箱密码
  sender_address: '"XX平台 👥" <postmaster@abcd.com>'
}

module.exports = {
  System, WsConfig, DB, SendEmail, WsRoute,apiDateCode
}
