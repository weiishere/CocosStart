/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 16:47:54
 * @LastEditTime: 2020-08-19 18:57:28
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const body = require('koa-bodyparser');
const Koa = require('koa');
const staticServer = require('koa-static');
const serverScoket = require('./server-scoket');
const childProcess = require('child_process')
const { System } = require('./config')
const { connectDB } = require('./db/mongoMaster');
const StrategyRoutes = require('./routes/strategy-routes.js');
const ApiRoutes = require('./routes/api-routes.js');
const EventHub = require('./tool/EventHub');
const config = require('../webpack.config.js');
const app = new Koa();
//const { Symbol } = require('./db');

const compiler = webpack(config);

// 由于webpack-dev-middleware是一个标准的express中间件，在Koa中不能直接使用它，因此需要将webpack-dev-middleware封装一下，以便Koa能够直接使用。
const devMiddleware = (compiler, opts) => {
    const middleware = webpackDevMiddleware(compiler, opts);
    return async (ctx, next) => {
        await middleware(ctx.req, {
            // @ts-ignore
            end: (content) => {
                ctx.body = content
            },
            setHeader: (name, value) => {
                ctx.set(name, value)
            }
        }, next)
    }
};
app.use(body());
app.use(devMiddleware(compiler, {
    publicPath: config.output.publicPath
}));
// app.use(require("webpack-dev-middleware")(compiler, {
//     noInfo: true, publicPath: config.output.publicPath
// }));
// app.use(require('webpack-hot-middleware')(compiler, {
//     log: console.log,
//     path: '/__webpack_hmr',
//     heartbeat: 10 * 1000
// }));

// 服务的静态文件地址
app.use(staticServer(__dirname + System.Public_path))
    .use(ApiRoutes.routes())
    .use(StrategyRoutes.routes())
    .use(ApiRoutes.allowedMethods());
//启动数据库
connectDB(async () => {
    if (process.env.CHILD_PROCESS === '1') {
        //再开一个进程，初始化symbolk线数据
        const cp = childProcess.fork('./src/symbolServer/index.js');
        cp.on("message", function ({ type, data }) {
            EventHub.getInstance().dispatchEvent(type, data);
        });
    }
    //启动scoket
    serverScoket(app).listen(System.Server_port, () => {
        console.log(`Service listening on port ${System.Server_port}!\n`);
    });
}, 'master进程');




//Symbol.create({ name: 'ETHUSDT' }, () => { });