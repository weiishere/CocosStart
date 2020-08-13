/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 23:22:02
 * @LastEditTime: 2020-07-25 00:17:03
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

import io from 'socket.io-client';

const ScoketListener = [];
let scoket;

export const connectScoket = function (uid, tid) {
    if (!scoket) {
        return new Promise(resolve => {
            scoket = io();
            scoket.on('connect', function () {
                console.log('The webscoket is connected');
                ScoketListener.forEach(item => {
                    item(scoket);
                });
                scoket.emit('checkin', { uid, tid });
                resolve(scoket);
            });
        })
    } else {
        return new Promise(resolve => {
            //console.log('The webscoket is connected--2');
            if (!scoket.connected) {
                scoket.on('connect', function () {
                    scoket.emit('checkin', { uid, tid });
                    resolve(scoket);
                });
            } else {
                resolve(scoket);
            }
        })
    }

    // scoket.on('connect', function () {
    //     console.log('The webscoket is connected');
    //     ScoketListener.forEach(item => {
    //         item(scoket);
    //     });
    //     return scoket;
    // });
}

export const addScoketListener = (listener) => {
    if (!scoket.connected) {
        ScoketListener.push(listener);
    } else {
        listener(scoket);
    }
}
