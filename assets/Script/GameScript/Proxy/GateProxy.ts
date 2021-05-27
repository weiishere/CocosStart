import BaseProxy from "./BaseProxy";
import { GateRepository, UserInfo } from "../repositories/GateRepository";
import { ConfigProxy } from './ConfigProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { HttpUtil } from '../Util/HttpUtil';
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import { ServerCode } from '../GameConst/ServerCode';
import { WebSockerProxy } from './WebSocketProxy';
import { LoginData } from '../GameData/LoginData';
import { ClubProxy } from './ClubProxy';
import { TuiTongZiProxy } from '../TuiTongZi/TuiTongZiProxy';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";
import { UserOfflineData } from '../GameData/UserOfflineData';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import { ResponseCode } from "../GameConst/ResponseCode";
import Facade from "../../Framework/care/Facade";
import { SHA1 } from "../Util/Sha1";
import md5 from "../Util/MD5";
import { SecurityUtil } from "../Util/SecurityUtil";


export class GateProxy extends BaseProxy {
    private repository: GateRepository;
    /** 用户离线数据 */
    userOfflineData: UserOfflineData;
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

    public getTuiTongZiProxy(): TuiTongZiProxy {
        return <TuiTongZiProxy>this.facade.retrieveProxy(ProxyDefine.TuiTongZi);
    }

    public getFacadeUrl(): string {
        return this.getConfigProxy().facadeUrl;
    }

    public getVerifyCode(phoneNo: string, callBack: any) {
        let url = this.getFacadeUrl() + "/code/register";
        let secret = SecurityUtil.buildSecret();
        let param = {
            phoneNo: phoneNo,
            token: secret
        }
        HttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                // 验证码获取成功
                callBack();
            } else {
                // 返回错误码，提示用户
                this.toast("验证码获取失败！");
            }
        }, (err) => {
            this.toast("请求服务器失败！");
        }, HttpUtil.METHOD_POST, param)
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
                Facade.Instance.sendNotification(CommandDefine.closeLoginPanel, '', '')
            } else {
                // 返回错误码，提示用户
                let errorCode = parseInt(response.bd);

                cc.log("注册失败，错误码: ", errorCode);
                if (errorCode === ServerCode.USER_NOT_EXIST) {
                    this.toast("用户名或者密码错误！");
                } else if (errorCode === ServerCode.PHONE_NO_EXIST) {
                    this.toast("手机号已经注册了！");
                } else if (errorCode === ServerCode.SECURITY_CODE_ERROR) {
                    this.toast("验证码错误！");
                } else if (errorCode === ServerCode.INVITE_CODE_ERROR) {
                    this.toast("邀请码错误！");
                } else if (errorCode === ResponseCode.USER_NOT_EXIST) {
                    this.toast("账号不存在，请重新注册！");
                }
            }
        }, (err) => {
            this.toast("请求服务器失败！");
        }, HttpUtil.METHOD_POST, phoneRegisterOrLoginData);
    }

    /**
     * 微信登录或者注册
     * @param phoneRegisterOrLoginData 
     */
    public wxloginOrRegiter(code: string) {
        let url = this.getFacadeUrl() + "/register/wechat";
        HttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                //this.toast("请求完成，请稍后！" + response.bd);
                this.loginAfterHandle(response.bd);
                Facade.Instance.sendNotification(CommandDefine.closeLoginPanel, '', '')
            } else {
                // 返回错误码，提示用户
                let errorCode = parseInt(response.bd);
                cc.log("注册失败，错误码: ", errorCode);
                this.toast("抱歉，微信授权失败！");
            }
        }, (error, requestData, status) => {
            this.toast("请求服务器失败！-" + status);
        }, HttpUtil.METHOD_POST, { code });
    }

    /**
     * 本地缓存数据登录
     * @param loginData 
     */
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
                let errorCode = parseInt(response.bd.code);
                cc.log("注册失败，错误码: ", errorCode);
                if (errorCode === ServerCode.USER_NOT_EXIST) {
                    this.toast("用户名或者密码错误！");
                } else if (errorCode === ServerCode.PWD_ERROR) {
                    this.toast("用户名或者密码错误！");
                } else if (errorCode === ResponseCode.USER_DISABLE) {
                    this.toast(loginData.userName + " 你的账号被锁定，请联系客服或者上级代理！");
                } else if (errorCode === ResponseCode.USER_NOT_EXIST) {
                    this.toast("账号不存在，请重新注册！");

                    this.sendNotification(CommandDefine.OpenLoginPanel);
                }
            }
        }, (err) => {
            this.toast("请求服务器失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    public getInviteCode() {
        let param = {
            userName: this.getLocalCacheDataProxy().getLoginData().userName,
        }
        let url = this.getFacadeUrl() + "user/getInviteCode";
        LoginAfterHttpUtil.send(url, (response) => {
            if (response) {
                this.getLocalCacheDataProxy().setInviteCode(response);
            } else {
                this.getLocalCacheDataProxy().setInviteCode("");

                this.sendNotification(CommandDefine.OpenBindSuperior);
            }
        }, (err) => {
            this.toast("获取邀请码失败！");
            this.getLocalCacheDataProxy().setInviteCode("");
            this.sendNotification(CommandDefine.OpenBindSuperior);
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

        this.userOfflineData = resultData.userOfflineData;

        // 登录成功之后连接socket
        this.connectWebSocket();

        this.getSystemNotice();
        this.getIsSetExchangePwdStatus();
    }

    private getSystemNotice() {
        let param = {
        }
        let url = this.getFacadeUrl() + "notice/getSystemNotice";
        LoginAfterHttpUtil.send(url, (response) => {
            if (response && response.bd) {
                this.getConfigProxy().leessang = response.bd;
                this.sendNotification(CommandDefine.UpdateLeessang, { content: response.bd });
            } else {
                this.toast("获取系统公告失败！");
            }
        }, (err) => {
            this.toast("获取系统公告失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    private getIsSetExchangePwdStatus() {
        let param = {
        }

        let url = this.getFacadeUrl() + "exchange/isSetExchangePwd";
        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                this.getLocalCacheDataProxy().setIsSetExchangePwd(true);
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '获取是否设置兑换密码失败' + err, toastOverlay: true }, '');
        }, HttpUtil.METHOD_POST, param);
    }

    /**
     * 连接websocket
     */
    private connectWebSocket(): void {
        let ggwUrl = this.getConfigProxy().ggwUrl;
        this.getWebSocketProxy().connect(ggwUrl);
    }

    public joinTuiTongZi(): void {
        this.getTuiTongZiProxy().loginGame();
    }

    public joinClub(): void {
        this.getClubProxy().joinClub();
    }

    public toast(content: string): void {
        this.sendNotification(CommandDefine.OpenToast, { content: content });
    }
}