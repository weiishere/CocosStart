/*
 * @Author: weishere.huang
 * @Date: 2020-07-28 17:13:05
 * @LastEditTime: 2020-08-01 13:15:14
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
import EventHub from '@client/EventHub'
import { requester } from '@src/tool/Requester'
import { message } from 'antd';
import api from '@client/api';

let lastTacticsId = '';
export const switchTactics = (id) => {
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
        //切换Tactics
        if (switchTactics === id) return;
        lastTacticsId = id;
        const key = 'loading';
        message.loading({ content: '交易实例数据请求中..', key, duration: 0 });
        requester({
            url: api.switchTactics,
            params: { id },
            option: {
                baseUrl: 'API_server_url',
                failedBack: (error) => {
                    //console.log(error);
                    message.error({ content: '请求错误', key, duration: 2 });
                }
            }
        }).then(({ res }) => {
            if (res.data.data.name) {
                message.success({ content: `实例成功切换为${res.data.data.name}`, key, duration: 2 });
                console.log(res.data.data)
                EventHub.getInstance().dispatchEvent('switchTactics', res.data.data);
            } else {
                message.warn({ content: `请求完成(无数据)`, key, duration: 2 });
            }
        })
        //EventHub.getInstance().dispatchEvent('loadSingleTactics', location.hash);
    } else {
        message.error('无效的ID');
    }
}

export const getQueryString = (name) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    var q = window.location.pathname.substr(1).match(reg_rewrite);
    if (r != null) {
        return (r[2]);
    } else if (q != null) {
        return (q[2]);
    } else {
        return null;
    }
}