
/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 17:34:40
 * @LastEditTime: 2020-08-12 18:31:33
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
//const client = require('binance-api-node').default()
//const Stomp = require('stompjs')
const { connectStomp, disConnectStomp } = require('../tool/StompInstance')
const { WsConfig, WsRoute } = require('../config')
const { price_change_url } = WsConfig;
const { TacticesCommand } = require('../tacticsServer')
const { userList, initScoket } = require('../controllers/user')
let timer;

const onHandler = (scoket) => {
    // scoket.on('send', data => {
    //     console.log('客户端发送的内容：', data);
    //     scoket.emit('getMsg', '我是返回的消息... ...');
    // });

    scoket.on('triggerWs', data => {
        connectStomp().then(stompClient => {
            stompClient.subscribe(data.wsUrl, (msg) => {
                console.log(msg);
                scoket.emit(WsRoute.MULTIPLE_PRICE_CHANGE, msg);
            })
        })
    });
    scoket.on('checkin', (data) => {
        console.log(data.uid + "--" + data.tid);
        if (data.uid) initScoket(data.uid + '', data.tid, scoket.id);
    });
    scoket.on('bindTid', (data) => {
        console.log(data.scoketId + "--" + data.tid);
    });
    //关闭ws连接
    scoket.on("disconnect", () => {

    })
}
const emitHandler = (scoket) => {
    const _tacticesCommand = TacticesCommand.getInstance();
    //_tacticesCommand.setScoket(scoket);
    timer && clearInterval(timer);
    timer = setInterval(() => {
        if (_tacticesCommand.isRateDone) {
            userList.forEach(user => {
                user.scokets.forEach(item => {
                    //_tacticesCommand.setScoket(item.scoket);
                    _tacticesCommand.mapTotacticsList(user.id, item.tid, true);
                });
            });
            //_tacticesCommand.mapTotacticsList(_tacticesCommand.presentSymbleId, true)
        } else {
            //如果手动调取过mapTotacticsList方法
            _tacticesCommand.isRateDone = true;
        }
    }, 5000);

    // client.ws.trades(['ETHBTC', 'BNBBTC'], trade => {

    // });
    // client.ws.allTickers(tickers => {
    //     //scoket.emit('allTickers', tickers);
    // });
}


module.exports = (scoket) => {
    onHandler(scoket);
    emitHandler(scoket);
}
