
export class HttpUtil {
    static METHOD_POST: string = 'POST';
    static METHOD_GET: string = 'GET';

    /**
    * 全局默认 http 请求超时时间
    */
    static DEFAULT_HTTP_TIMEOUT: number = 10000;

    /**
     * 通信错误。请求 url 为空
     */
    static ERROR_URL_NULL: number = -999;
    /**
     * 获取数据异常 (DataError)
     */
    static ERROR_REQUEST_FAIL: number = 50001;
    /**
     * 连接超时 (TimeOut)
     */
    static ERROR_REQUEST_TIMEOUT: number = 50002;

    /**
     * 获取当前页面URL中的参数(web版本使用)
     * @param name：URL中携带的数据参数名
     * @param fullUrl：URL
     * @returns {*}
     */
    static getQueryString(name: string, fullUrl: string): any {
        if (!fullUrl) {
            fullUrl = window.location.search;
        }

        let reg = new RegExp(`(^|&|\\?)${name}=([^&]*)(&|$)`, 'i');
        let r = fullUrl.substr(1).match(reg);

        if (r !== null) {
            return unescape(r[2]);
        }
        return null;
    };

    /**
     * 从字符串中提取 http 图片地址
     * @param str
     */
    static getImageUrlFromStr(str: string): string {
        let reg = /https?:\/\/.+(\.png|\.jpg)/i;

        let r = str.match(reg);

        if (r !== null) {
            return unescape(r[0]);
        }
        return null;
    };

    /**
     * JS对象转Http参数字符串
     * @param obj       传入对象
     * @param strOut    递归调用时使用。保持解析结果
     */
    static obj2HttpParam(obj, strOut?) {
        let strRes = '';

        // 遍历传入对象
        for (const key in obj) {

            // 有嵌套对象
            if ("object" === obj[key]) {

                // 递归调用
                strRes = this.obj2HttpParam(obj[key], strRes);
            } else {
                let strTemp = '';

                if (0 === strRes.length) {

                    // 第一个参数不用加 & 分隔符
                    strTemp = key + "=" + obj[key];
                } else {

                    // 不是第一个参数都要加 & 分隔符
                    strTemp = "&" + key + "=" + obj[key];
                }

                // 将对象键值对拼装进结果字符串
                strRes += strTemp;
            }
        }
        return strRes;
    };


    /**
     * 发送 http(s) 请求
     * @param {string} url               请求的 URL 地址
     * @param { (response, request, url) => {} } resultCb          成功时回调函数 (response, request, url) => {}
     * @param { (errorCode, request, state, url) => {} } failCb            调用失败时回调函数 (errorCode, request, state, url) => {}
     * @param { GET | POST} method            http(s) 请求方法. GET POST
     * @param requestData              要发送的数据
     * @param acctName          用户名。 默认空字符串
     * @param acctToken         用户授权 token 。默认空字符串
     * @param isAsync           是否异步请求
     * @constructor
     */
    static send(url:string, resultCb:Function, failCb:Function, method, requestData=undefined, acctName='', acctToken='', isAsync = true) {
        if (!url) {
            cc.log('HTTP URL is null');

            if (failCb && "function" === typeof failCb) {
                failCb(this.ERROR_URL_NULL, requestData);
            }
            return;
        }

        cc.log("http send ", url)

        // 创建XHR对象
        let pXHR = new XMLHttpRequest();

        // 设置超时时间
        pXHR.timeout = this.DEFAULT_HTTP_TIMEOUT;

        // 监听连接状态
        pXHR.onreadystatechange = () => {

            // 获取数据状态
            if (pXHR.readyState === 4) {
                // 获取数据成功
                if (200 <= pXHR.status && 400 > pXHR.status) {
                    let responseData = pXHR.responseText;
                    let responseObject;
                    try {
                        responseObject = JSON.parse(responseData);
                    } catch (e) {
                        cc.log(`http data: ${responseData}`);
                    }

                    //输出响应日志true
                    cc.log(`http response>>>\nurl:${pXHR.responseURL}\nhttp status code:${pXHR.status}\ndata: ${responseData}`);

                    //返回数据是json
                    if (responseObject) {
                        // CommonServerErrorCode.SUCCEED
                        if (!responseObject.errorCode || responseObject.errorCode === 1) {
                            if (typeof resultCb === 'function') {
                                resultCb(responseObject, requestData, url);
                                resultCb = null;
                            }
                        } else if (typeof failCb === 'function') {
                            // responseObject.errorMsg = CommonServerErrorCode.getDescByServerErrorCode(responseObject.errorCode);
                            // if (responseObject && responseObject.errorCode !== null && responseObject.errorCode !== undefined) {
                            // 获取到的只是 key, 未转化
                            //     responseObject.errorMsg += `(${responseObject.errorCode})`;
                            // }
                            failCb(responseObject, requestData, 200, url);
                            failCb = null;
                        }
                    } else if (typeof resultCb === 'function') {
                        //返回数据为原始字符串
                        resultCb(responseData, requestData, url);
                        resultCb = null;
                    }
                } else {
                    // 失败
                    // 调用错误回调
                    if (typeof failCb === 'function') {
                        if (pXHR.status === 504) {
                            setTimeout(() => {
                                let error = {
                                    errorCode: this.ERROR_REQUEST_FAIL,
                                    errorMsg: 'core.comm_netError'
                                };
                                failCb(error, requestData, pXHR.status, url);
                                failCb = null;

                            }, 5000);
                            return;
                        }

                        let error = {
                            errorCode: this.ERROR_REQUEST_FAIL,
                            errorMsg: 'core.comm_netError'
                        };
                        failCb(error, requestData, pXHR.status, url);
                        failCb = null;
                    }
                }// end of if
            }// end of if
        };

        // 监听超时
        pXHR.ontimeout = () => {
            // 调用错误回调
            if (failCb && typeof failCb === 'function') {
                let error = {
                    errorCode: this.ERROR_REQUEST_TIMEOUT,
                    errorMsg: 'core.comm_timeout'
                };
                failCb(error, requestData, pXHR.status, url);
                failCb = null;
            }
        };

        // 与服务器连接错误回调
        pXHR.onerror = () => {
            if (failCb && typeof failCb === 'function') {
                let error = {
                    errorCode: this.ERROR_REQUEST_FAIL,
                    errorMsg: 'core.comm_netError'
                };
                failCb(error, requestData, pXHR.status, url);
                failCb = null;
            }
        };

        // 处理控制参数
        if ('boolean' !== typeof isAsync) {
            isAsync = true;
        }

        if ('string' !== typeof method) {
            method = 'POST';
        }

        if ('string' !== typeof acctName) {
            acctName = '';
        }

        if ('string' !== typeof acctToken) {
            acctToken = '';
        }

        pXHR.open(method, url, isAsync, acctName, acctToken);

        //输出请求日志
        /*
        if (projectConfig.HTTP_LOG) {
            let param = requestData ? HttpUtil.obj2HttpParam(requestData) : '';
            cc.log(`http request>>>\nmethod:${method}\nurl:${url}\naccName:${acctName}\naccToken:${acctToken}\nparam:${param}`);
        }
        */

        pXHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        if (!requestData) {
            pXHR.send();
        } else {
            if ('string' === typeof requestData) {
                // do nothing filter.
                pXHR.send(requestData);
            } else if ('object' === typeof requestData) {
                pXHR.send(this.obj2HttpParam(requestData));
            } else {
                // do nothing filter.
                pXHR.send(requestData);
            }
        }
    };

    static loadImageBytes(url, resultCb, failCb) {
        if (!url) {
            cc.log('HTTP URL is null');

            if (failCb && 'function' === typeof failCb) {
                failCb(this.ERROR_URL_NULL);
            }
            return;
        }

        // 创建XHR对象
        let pXHR = new XMLHttpRequest();

        // 设置超时时间
        pXHR.timeout = this.DEFAULT_HTTP_TIMEOUT;

        // 监听连接状态
        pXHR.onreadystatechange = () => {
            // 获取数据状态
            if (pXHR.readyState === 4) {
                // 获取数据成功
                if (200 <= pXHR.status && 400 > pXHR.status) {
                    let responseData = pXHR.response;

                    if (typeof resultCb === 'function') {
                        //返回数据为原始字符串
                        resultCb(responseData, url);
                        resultCb = null;
                    }
                } else if (typeof failCb === 'function') {
                    // 失败
                    // 调用错误回调
                    if (pXHR.status === 504) {
                        setTimeout(() => {
                            let error = {
                                errorCode: this.ERROR_REQUEST_FAIL,
                                errorMsg: 'core.comm_netError'
                            };
                            failCb(error, pXHR.status, url);
                            failCb = null;

                        }, 1000);
                        return;
                    }

                    let error = {
                        errorCode: this.ERROR_REQUEST_FAIL,
                        errorMsg: 'core.comm_netError'
                    };
                    failCb(error, pXHR.status, url);
                    failCb = null;
                }// end of if
            }// end of if
        };

        // 监听超时
        pXHR.ontimeout = () => {
            // 调用错误回调
            if (failCb && typeof failCb === 'function') {
                let error = {
                    errorCode: this.ERROR_REQUEST_TIMEOUT,
                    errorMsg: 'core.comm_timeout'
                };
                failCb(error, pXHR.status, url);
                failCb = null;
            }
        };

        // 与服务器连接错误回调
        pXHR.onerror = () => {
            if (failCb && typeof failCb === 'function') {
                let error = {
                    errorCode: this.ERROR_REQUEST_FAIL,
                    errorMsg: 'core.comm_netError'
                };
                failCb(error, pXHR.status, url);
                failCb = null;
            }
        };

        // 处理控制参数
        let isAsync = true;
        let method = 'GET';
        let acctName = '';
        let acctToken = '';

        pXHR.open(method, url, isAsync, acctName, acctToken);

        // pXHR.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        pXHR.responseType = 'arraybuffer';

        pXHR.send();
    };
}
