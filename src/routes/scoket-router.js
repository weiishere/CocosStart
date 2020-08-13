
/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 17:34:40
 * @LastEditTime: 2020-08-13 22:52:45
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
const { userRooms } = require('../controllers/user')
let timer;

module.exports = (scoket, io) => {
    const _tacticesCommand = TacticesCommand.getInstance();
    let userId;
    let tacticsId;
    scoket.on('triggerWs', data => {
        connectStomp().then(stompClient => {
            stompClient.subscribe(data.wsUrl, (msg) => {
                console.log(msg);
                scoket.emit(WsRoute.MULTIPLE_PRICE_CHANGE, msg);
            })
        })
    });
    scoket.on('checkin', payload => {
        //console.log(uid);
        const { uid, tid } = payload;
        userId = uid;
        if (!uid) return;
        if (tacticsId) tacticsId = tid;
        const r = userRooms.find(item => item.uid === uid);
        if (r) {
            //tid中不能存在重复的scoketId，且tid必须有效（存在于tacticsList）
            if (!r.tids.some(item => item.scoketId === scoket.id) && _tacticesCommand.tacticsList.some(item => item.id === tid)) {
                r.tids.push({ tid, scoketId: scoket.id });
            }
        } else {
            if (_tacticesCommand.tacticsList.some(item => item.id === tid)) {
                userRooms.push({ uid, tids: [{ tid, scoketId: scoket.id }] });
            } else {
                userRooms.push({ uid, tids: [] });
            }
        }
        scoket.join(uid);//加入到用户群
    });
    scoket.on('regTid', tid => {
        const r = userRooms.find(item => item.uid === userId);
        if (r) {
            let tidObj = r.tids.find(item => (item.scoketId === scoket.id));
            if (tidObj) {
                tidObj.tid = tid;
            } else {
                if (!r.tids.some(item => item.scoketId === scoket.id) && _tacticesCommand.tacticsList.some(item => item.id === tid)) {
                    r.tids.push({ tid, scoketId: scoket.id });
                }
            }
            _tacticesCommand.mapTotacticsList(r.uid, tid, true);
        }
        tacticsId = tid;
    });
    scoket.on('leave', function () {
        socket.emit('disconnect');
    });
    //关闭ws连接
    scoket.on("disconnect", () => {
        const r = userRooms.find(item => item.uid === userId);
        if (r) {
            r.tids = r.tids.filter(item => item.scoketId !== scoket.id);
        }
        // if (r.tids.length === 0) {
        //     //如果tid都没了，就删掉room
        //     userRooms = userRooms.filter(ur => ur.uid !== userId);
        // }
    })
}