/*
 * @Author: weishere.huang
 * @Date: 2020-07-27 23:25:52
 * @LastEditTime: 2020-07-27 23:39:52
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */ 

const path = require('path');

module.exports = {
    '@': path.resolve(__dirname, './'),
    '@src': path.resolve(__dirname, './src'),
    '@client': path.resolve(__dirname, './src/client'),
    '@components': path.resolve(__dirname, './src/client/components')
}