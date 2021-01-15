import { HttpUtil } from './HttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
export class LoginAfterHttpUtil {
    static send(url: string, resultCb: Function, failCb: Function, method: any, requestData: any) {

        let u = '';
        let t = '';
        let localCache = this.getLocalCacheDataProxy();
        if (localCache) {
            let loginData = localCache.getLoginData();
            if (loginData) {
                u = loginData.userName;
            }

            t = localCache.getUserToken();
        }
        if ('object' === typeof requestData) {
            requestData.u = u;
            requestData.t = t;
        } else {
            requestData.u = u;
            requestData.t = t;
        }

        HttpUtil.send(url, resultCb, failCb, method, requestData);
    }

    static getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }
}