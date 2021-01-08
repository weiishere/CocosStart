import BaseProxy from "./BaseProxy";
import { CommandDefine } from "../GameConst/CommandDefine";
import { GateRepository, UserInfo } from "../repositories/GateRepository";


export class GateProxy extends BaseProxy {
    private repository: GateRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new GateRepository();
    }
    // protected keyMap = [
    //     { sysKey: '', serverKey: '' },
    //     { sysKey: '', serverKey: '' },
    //     { sysKey: '', serverKey: '' },
    //     { sysKey: '', serverKey: '' },
    //     { sysKey: '', serverKey: '' },
    //     { sysKey: '', serverKey: '' },
    // ]
    /**检查登录状态 */
    public checkLogin(): boolean {
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        return loginData != null ? true : false;
    }
    public getUserInfo(): UserInfo {
        return this.repository.userInfo;
    }
    public login(userInfoData): void {
        //需要对userInfoData进行转义，或者拆分，因为服务器的数据和客户端的数据结构不一致
        this.repository.userInfo = userInfoData;
    }
    // public dataTranslate(data, type, directionTo: 'sys' | 'server',) {
    //     let result;
    //     switch (directionTo) {
    //         case 'server':

    //             break;
    //         case 'sys':
                
    //             break;
    //     }
    //     return result;
    // }
}