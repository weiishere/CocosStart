/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 17:34:25
 * @LastEditTime: 2020-08-07 17:56:21
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
  .get('/api/getUser', controllers.user.getUser)
  .get('/api/getAdvancedRestran', controllers.api.getAdvancedRestran)
  .get('/api/refreshSymbol', controllers.api.refreshSymbol)
  .get('/api/getIndicatorLine', controllers.api.getIndicatorLine)
  .get('/api/roundResult/get', controllers.api.getRoundResultList)
  .get('/api/roundResult/getSimple', controllers.api.getSimpleRoundResultList)
  .post('/api/switchSymbol', controllers.api.switchSymbol)
  .post('/api/initTactics', controllers.api.initTactics)
  .post('/api/tacticsOrder', controllers.api.tacticsOrder)
  .post('/api/updateParameter', controllers.api.updateParameter)
  .post('/api/updateAdvancedRestran', controllers.api.updateAdvancedRestran)
  .post('/api/clearNormalInfo', controllers.api.clearNormalInfo)
  .post('/api/updateLoadUpBuy', controllers.api.updateLoadUpBuy)
  