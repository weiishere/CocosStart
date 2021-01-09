import BaseProxy from "./BaseProxy";
import { CommandDefine } from "../GameConst/CommandDefine";
import { GateRepository, UserInfo } from "../repositories/GateRepository";
import { ConfigProxy } from './ConfigProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { HttpUtil } from '../Util/HttpUtil';
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import { ServerCode } from '../GameConst/ServerCode';
import { WebSockerProxy } from './WebSocketProxy';
import { LoginData } from '../GameData/LoginData';
import { OperationDefine } from '../GameConst/OperationDefine';
import { ClubProtocol } from "../Protocol/ClubProtocol";
import { ClubC2SLogin } from '../GameData/Club/c2s/ClubC2SLogin';
import { ClubProxy } from './ClubProxy';


export class GateProxy extends BaseProxy {
    private repository: GateRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new GateRepository();
    }

    public getConfigProxy(): ConfigProxy {
        return <ConfigProxy>this.facade.retrieveProxy(ProxyDefine.Config);
    }

    public getWebSocketProxy(): WebSockerProxy {
        return <WebSockerProxy>this.facade.retrieveProxy(ProxyDefine.WebSocket);
    }

    public getClubProxy(): ClubProxy {
        return <ClubProxy>this.facade.retrieveProxy(ProxyDefine.Club);
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
        }, (err) => { }, HttpUtil.METHOD_POST, param)
    }

    /**
     * 登录或者注册
     * @param phoneRegisterOrLoginData 
     */
    public loginOrRegiter(phoneRegisterOrLoginData: PhoneRegisterOrLoginData) {
        let url = this.getFacadeUrl() + "/register/phoneNo";
        HttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                this.loginAfterHandle(response.bd);
            } else {
                // 返回错误码，提示用户
                let errorCode = parseInt(response.bd);
                cc.log("注册失败，错误码: ", errorCode);
                if (errorCode === ServerCode.USER_NOT_EXIST) {

                } else if (errorCode === ServerCode.PHONE_NO_EXIST) {

                } else if (errorCode === ServerCode.SECURITY_CODE_ERROR) {

                }
            }
        }, (err) => {

        }, HttpUtil.METHOD_POST, phoneRegisterOrLoginData);
    }

    public localCahceLogin(loginData: LoginData): void {
        let param = {
            p: loginData.password
        }
        let url = this.getFacadeUrl() + "/login/" + loginData.userName;
        HttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                this.loginAfterHandle(response.bd);
            } else {
                // 返回错误码，提示用户
                let errorCode = parseInt(response.bd);
                cc.log("注册失败，错误码: ", errorCode);
                if (errorCode === ServerCode.USER_NOT_EXIST) {

                } else if (errorCode === ServerCode.PWD_ERROR) {

                }
            }
        }, (err) => {

        }, HttpUtil.METHOD_POST, param);
    }


    /**
     * 登录成功之后的处理
     * @param resultData 
     */
    private loginAfterHandle(resultData: any): void {
        // 缓存登录数据和token
        this.getLocalCacheDataProxy().setLoginData(resultData.userData);
        this.getLocalCacheDataProxy().setUserToken(resultData.token);

        // 登录成功之后连接socket
        this.connectWebSocket();
    }

    /**
     * 连接websocket
     */
    private connectWebSocket() {
        let ggwUrl = this.getConfigProxy().ggwUrl;
        this.getWebSocketProxy().connect(ggwUrl);
    }

    public joinClub(): void {
        this.getClubProxy().joinClub();
    }
}