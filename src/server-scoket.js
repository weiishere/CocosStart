/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 17:35:44
 * @LastEditTime: 2020-09-07 16:56:28
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
//const KoaRouter = require('koa-router');
const ScoketRoutes = require('./routes/scoket-router');
// const JSONTransport = require('nodemailer/lib/json-transport');
// const router = new KoaRouter();
const { userRooms } = require('./controllers/user');
const { TacticesCommand } = require('./tacticsServer');
const _tacticesCommand = TacticesCommand.getInstance();
let timer;

module.exports = function serverScoket(app) {
    const server = require('http').createServer(app.callback());
    const io = require('socket.io')(server);
    io.on('connection', socket => {
        ScoketRoutes(socket);
    })
    _tacticesCommand.setScoket(io);
    timer = setInterval(() => {
        if (_tacticesCommand.isRateDone) {
            userRooms.forEach(room => _tacticesCommand.mapTotacticsList(room.uid, true)
            );
        } else {
            //如果手动调取过mapTotacticsList方法
            _tacticesCommand.isRateDone = true;
        }
    }, 5000);
    return server;
}