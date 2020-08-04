/*
 * @Author: weishere.huang
 * @Date: 2020-07-25 13:14:17
 * @LastEditTime: 2020-07-25 16:21:48
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const Stomp = require('stompjs')
const { System, WsConfig } = require('../config');
const { disConnect } = require('echarts');
const { WS_server_url, WS_server_user, WS_server_pass } = WsConfig;
let stompClient;


module.exports = {
    connectStomp: function () {
        if (!stompClient) {
            return new Promise(resolve => {
                stompClient = Stomp.overWS(WS_server_url)
                stompClient.connect(WS_server_user, WS_server_pass, result => {
                    resolve(stompClient);
                });
                stompClient.heartbeat.outgoing = 10000;
                stompClient.heartbeat.incoming = 0;
            })
        } else {
            //console.log(stompClient);
            return new Promise(resolve => {
                //console.log('The webscoket is connected--2');
                if (!stompClient.connected) {
                    stompClient.connect(WS_server_user, WS_server_pass, result => {
                        resolve(stompClient);
                    });
                } else {
                    resolve(stompClient);
                }

            })
        }
    },
    disConnectStomp: function () {
        return new Promise(resolve => {
            if (stompClient) {
                stompClient.disconnect(() => {
                    resolve();
                });
            } else {
                resolve()
            }
        });
    }
}

