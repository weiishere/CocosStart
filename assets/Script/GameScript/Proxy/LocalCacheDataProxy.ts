import { LoginData } from '../GameData/LoginData';
import Proxy from '../../Framework/patterns/proxy/Proxy';
export class LocalCacheDataProxy extends Proxy {
    static LOGIN_DATA: string = "LOGIN_DATA";
    static TOKEN: string = "TOKEN";

    private localStorage: any = null;
    private cache: Map<string, any> = null;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.localStorage = cc.sys.localStorage;
        this.cache = new Map();
    }

    /**
        * 获得登录缓存数据
        */
    getLoginData(): LoginData {
        return <LoginData>JSON.parse(this.localStorage.getItem(LocalCacheDataProxy.LOGIN_DATA));
    }

    /**
     * 保存登录缓存数据
     * @param {*} loginData 
     */
    setLoginData(loginData: any) {
        this.localStorage.setItem(LocalCacheDataProxy.LOGIN_DATA, JSON.stringify(loginData));
    }

    /**
     * 更新金额
     * @param newGold 
     */
    updateUserGold(newGold) {
        let loginData = this.getLoginData();
        loginData.gold = newGold;

        this.setLoginData(loginData);
    }

    /**
     * 获得用户TOKEN
     */
    getUserToken(): string {
        return this.getCache(LocalCacheDataProxy.TOKEN);
    }

    /**
     * 保存用户token
     * @param {*} userToken 
     */
    setUserToken(userToken): any {
        this.setCache(LocalCacheDataProxy.TOKEN, userToken);
    }

    getCache(key: string): any {
        return this.cache.get(key);
    }

    setCache(key: string, value: any) {
        this.cache.set(key, value);
    }
}