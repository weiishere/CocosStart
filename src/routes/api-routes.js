/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 17:34:25
 * @LastEditTime: 2020-07-28 00:57:09
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
// import KoaRouter from 'koa-router'
// import controllers from '../controllers/index.js'
//const KoaRouter = require('koa-router');
const router = require('koa-router')();
const controllers = require('../controllers');

//const router = new KoaRouter()

module.exports = router
  .get('/public/get', function (ctx, next) {
    ctx.body = '禁止访问！'
  })
  .get('/bian-api/test-connect', controllers.bian_api.TestConnect)
  .get('/api/switchTactics', controllers.api.switchTactics)
  .post('/api/initTactics', controllers.api.initTactics)
  .post('/api/tacticsOrder', controllers.api.tacticsOrder)
  