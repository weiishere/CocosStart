import BaseProxy from "./BaseProxy";
import { CommandDefine } from "../GameConst/CommandDefine";
import { GateRepository, UserInfo } from "../repositories/GateRepository";
import { ConfigProxy } from './ConfigProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { HttpUtil } from '../Util/HttpUtil';


export class GateProxy extends BaseProxy {
    private repository: GateRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new GateRepository();
    }

    public getConfigProxy(): ConfigProxy {
        return <ConfigProxy>this.facade.retrieveProxy(ProxyDefine.Config);
    }

    public getFacadeUrl(): string {
        return this.getConfigProxy().facadeUrl;
    }

    public getVerifyCode(phoneNo: string, callBack: any) {
        let url = this.getFacadeUrl() + "/code/register";
        let param = {
            phoneNo: phoneNo,
        }
        HttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                // 验证码获取成功
            } else {
                // 返回错误码，提示用户
            }
        }, (err) => { }, HttpUtil.METHOD_GET, param)
    }

    public loginOrRegiter(phoneNo, verifyCode, invitationCode) {

        let url = this.getFacadeUrl() + "/register/phoneNo";
        let param = {
            phoneNo: phoneNo,
            code: verifyCode,
            invitationCode: invitationCode
        }
        HttpUtil.send(this.getFacadeUrl(), (response) => {
            if (response.hd === "success") {
                // 缓存登录数据和token
                this.getLocalCacheDataProxy().setLoginData(response.bd.userData);
                this.getLocalCacheDataProxy().setUserToken(response.bd.token);
            } else {
                // 返回错误码，提示用户
            }
        }, (err) => {

        }, HttpUtil.METHOD_POST, param)
    }
}