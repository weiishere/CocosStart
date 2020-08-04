/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 16:05:17
 * @LastEditTime: 2020-07-24 17:15:21
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const binancer = require('../lib/binancer')

const Post = async (ctx, next) => {
  ctx.body = {
    result: 'post',
    name: ctx.params.name,
    para: ctx.request.body
  }
  next()
}
const TestConnect = async (ctx, next) => {
  const result = await binancer.testConnect();
  ctx.body = {
    result
  }
  next()
}
module.exports = { Post, TestConnect };