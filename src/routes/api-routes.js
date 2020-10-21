/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 17:34:25
 * @LastEditTime: 2020-10-21 16:23:41
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
// import KoaRouter from 'koa-router'
// import controllers from '../controllers/index.js'
//const KoaRouter = require('koa-router');
const router = require('koa-router')();
const controllers = require('../controllers');
const path = require('path');
const fs = require('fs');
//const router = new KoaRouter()

module.exports = router
  .get('/public/get', function (ctx, next) {
    ctx.body = '禁止访问！'
  })
  // .get('/dist/*', async ctx => {
  //   //ctx.body = 'aaa';
  //   // const indexHtml = (await fs.readFile(path.resolve(__dirname, './dist/index.html'))).toString();
  //   // ctx.body = indexHtml;
  //   //router.redirect('', './dist/index.html');
  //   //await ctx.render('/dist/index', { title: '合约' })
  // })
  .get('/bian-api/test-connect', controllers.bian_api.TestConnect)
  .get('/api/switchTactics', controllers.api.switchTactics)
  .get('/api/getUser', controllers.user.getUser)
  .get('/api/getAdvancedRestran', controllers.api.getAdvancedRestran)
  .get('/api/refreshSymbol', controllers.api.refreshSymbol)
  .get('/api/getIndicatorLine', controllers.api.getIndicatorLine)
  .get('/api/roundResult/get', controllers.api.getRoundResultList)
  .get('/api/roundResult/getSimple', controllers.api.getSimpleRoundResultList)
  .get('/api/getParameterDesc', controllers.api.getParameterDesc)
  .post('/api/switchSymbol', controllers.api.switchSymbol)
  .post('/api/initTactics', controllers.api.initTactics)
  .post('/api/tacticsOrder', controllers.api.tacticsOrder)
  .post('/api/updateParameter', controllers.api.updateParameter)
  .post('/api/updateAdvancedRestran', controllers.api.updateAdvancedRestran)
  .post('/api/clearNormalInfo', controllers.api.clearNormalInfo)
  .post('/api/updateLoadUpBuy', controllers.api.updateLoadUpBuy)
