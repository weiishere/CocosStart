/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 17:35:44
 * @LastEditTime: 2020-07-25 01:00:24
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const KoaRouter = require('koa-router');
const ScoketRoutes = require('./routes/scoket-router');
const JSONTransport = require('nodemailer/lib/json-transport');
const router = new KoaRouter();


module.exports = function serverScoket(app) {
    const server = require('http').createServer(app.callback());
    const io = require('socket.io')(server);
    io.on('connection', socket => {
        ScoketRoutes(socket);
    })
    return server;
}