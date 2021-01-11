import Proxy from "../../Framework/patterns/proxy/Proxy";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { GateRepository, UserInfo } from "../repositories/GateRepository";
import { LocalCacheDataProxy } from './LocalCacheDataProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';


export default class BaseProxy extends Proxy {
    protected keyMapToData = {}
    protected keyMapToSys = {}
    constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        //this.keyMapProduct();
    }
    protected keyMap: Array<{ sysKey: string, serverKey: string }>;
    private keyMapProduct() {
        this.keyMap.map(({ sysKey, serverKey }) => {
            this.keyMapToData[sysKey] = serverKey;
            this.keyMapToSys[serverKey] = sysKey;
        })
    }
    protected convertKey(data: any, keyMap: Object) {
        let tempString = JSON.stringify(data);
        for (var key in keyMap) {
            var reg = `/"${key}":/g`;
            tempString = tempString.replace(eval(reg), '"' + keyMap[key] + '":');
        }
        return JSON.parse(tempString);
    }
    protected traversal(obj, keyMapTo: Object) {
        let o = {};
        for (var i in obj) {
            if (obj[i] instanceof Array) {
                this.traversal(obj[i], keyMapTo);
            } else {
                //arr.push(obj[i]);
                o[i] = this.convertKey(obj[i], keyMapTo);
            }
        }
        return o;
    }

    protected getLocalCacheDataProxy():LocalCacheDataProxy{
        return <LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData);
    }
}