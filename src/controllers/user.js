/*
 * @Author: weishere.huang
 * @Date: 2020-08-12 17:04:46
 * @LastEditTime: 2020-08-12 18:35:48
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { TacticesLauncher } = require('../tacticsServer')
const { apiDateCode, System } = require('../config');

const userList = [
    {
        id: '12345',
        name: 'weishere',
        scokets: []//{tid,scoket}
    }
]
let userRooms = [];//{uid:12345,tids:[{scoketId,tid}]}
module.exports = {
    userList,
    userRooms,
    getUser: async (ctx, next) => {
        const { uid } = ctx.query;
        const _user = userList.find(item => item.id == uid);
        let resultData = {};
        if (!_user) {
            resultData = {
                msg: '未获取到用户Error',
                code: apiDateCode.nullError
            }
        } else {
            resultData = {
                code: apiDateCode.success,
                data: _user || {}
            }
        }
        ctx.body = resultData;
        next();
    }
    // initScoket: (uid, tid, scoketId) => {
    //     const _user = userList.find(item => item.id === uid);
    //     if (_user) {
    //         _user.scokets.push({ tid, scoketId });
    //     }
    // },
    // removeScoket: (uid, scoketId) => {
    //     const _user = userList.find(item => item.id === uid);
    //     if (_user) {
    //         _user.scokets = _user.scokets.filter(item => item.scoketId !== scoketId);
    //     }
    // }
}