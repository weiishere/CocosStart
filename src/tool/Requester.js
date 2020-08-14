/*
 * @Author: weishere.huang
 * @Date: 2020-07-25 17:00:53
 * @LastEditTime: 2020-08-14 11:32:27
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const axios = require('axios');
const {System } = require('../config');
//axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;
//const Binance = require('binance-node-api')
let api;

// const apiInstance = () => {
//     if (api) {
//         return api;
//     } else {
//         const { apiKey, secretKey } = System;
//         const config = { apiKey, secretKey };
//         api = Object.create(Binance)
//         api.init(config);
//         return api
//     }
// }

// export type optionType = {
//   requestTarget: string;
//   enableMsg: true;
//   successMsg: string;
//   enableLoad: true;
//   successRule:Function
// };

const axiosHandler = async (
    url,
    type,
    params,
    config,
    reject,
    resolve,
    successRule,
    failedBack
) => {
    // try {
    //     let accountInfo = await apiInstance().getAccountInfo({ timestamp: Date.now() })
    //     console.log(accountInfo.data)
    // } catch (err) {
    //     console.log(err)
    // }
    
    axios[type](url, type === "get" ? { params: params } : params, config || {})
        .then(res => {
            if (successRule(res)) {
                resolve({ res });
            } else {
                //message.error(`${res.statusText}(${res.status})`);
                reject({ error: { type: "faild", info: res.data } });
                failedBack && failedBack(res.data);
            }
        })
        .catch(error => {
            if (error && error.message && error.message.indexOf("timeout of") > -1) {
                //message.error(`请求超时,请重试：${error.message}`);
                console.error(`请求超时,请重试：${error.message}`);
                failedBack && failedBack(error.message);
                reject({ error: { type: "error", info: `请求超时,请重试：${error}` } });
            } else {
                console.error(`网络异常：${error}`);
                failedBack && failedBack(error);
                reject({ error: { type: "error", info: `网络异常：${error}` } });
                //message.error(`网络异常：${error}`);
            }
            reject({ error: { type: "error", info: error } });
            
        });
};

const requester = ({ url, params, type = "get", config = {}, option = {} }) => {
    //process.env.NODE_ENV === 'development' && url = `/api${url}`;
    const options = Object.assign(
        {
            requestTarget: "",
            enableMsg: true,
            successMsg: "数据请求完成~",
            enableLoad: true,
            baseUrl:'api_base_url',
            failedBack: req => { },
            successRule: successRule.base
        },
        option || {}
    );
    config = Object.assign({ withCredentials: true }, config);

    if (Object.prototype.toString.call(url) === "[object Array]") {
        //数组
        const runAsync = url.map((_url, index) => {
            _url = `${System[options.baseUrl]}${options.requestTarget}${_url}`;
            const _params =
                Object.prototype.toString.call(params) !== "[object Array]"
                    ? params || {}
                    : params[index];
            const _type =
                Object.prototype.toString.call(type) !== "[object Array]"
                    ? type || "post"
                    : type[index];
            return new Promise((resolve, reject) => {
                axiosHandler(
                    _url,
                    _type,
                    _params,
                    config,
                    reject,
                    resolve,
                    options.successRule,
                    options.failedBack
                );
            });
        });
        return new Promise((resolve, reject) => {
            Promise.all(runAsync).then(function (results) {
                //options.enableMsg && message.success(options.successMsg);
                
                resolve({ res: results });
            });
        });
    } else {
        url = `${System[options.baseUrl]}${options.requestTarget}${url}`;
        params = params || {};
        return new Promise((resolve, reject) => {
            //这里加一个通用的数据重置后门
            if (params.reset === true) {
                resolve({ code: 0, data: params.resetData });
                return;
            }
            axiosHandler(
                url,
                type,
                params,
                config,
                reject,
                resolve,
                options.successRule,
                options.failedBack
            );
        });
    }
};

const successRule = {
    base: (res) => {
        return res.status === 200 ? true : false;
    },
    default: (res) => {
        return res.status === 200 && res.data.code === "000" ? true : false;
    }
}

module.exports = { requester, successRule }