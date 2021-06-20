import Facade from "../../../Framework/care/Facade";
import { ServerCode } from "../../GameConst/ServerCode";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import ExtendSprite from "../../Util/ExtendSprite";
import { HttpUtil } from "../../Util/HttpUtil";
import { LoginAfterHttpUtil } from "../../Util/LoginAfterHttpUtil";
import md5 from "../../Util/MD5";
import { StringUtil } from "../../Util/StringUtil";
import ExchangePanel from "./ExchangePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    newPwdEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    confirmPwdEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    phoenEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    verifyEditBox: cc.EditBox = null;
    @property(cc.Label)
    phoneLabel: cc.Label = null;
    @property(cc.Node)
    getVerifyBtn: cc.Node = null;

    onLoad() {
        this.node.getChildByName("closeBtn").on(cc.Node.EventType.TOUCH_END, () => {
            this.close();
        });

        let loginData = this.getLocalCacheDataProxy().getLoginData();
        if (loginData.phoneNo) {
            this.phoneLabel.node.active = true;
            this.phoenEditBox.node.active = false;
            this.phoneLabel.string = StringUtil.hidePhoneNo(loginData.phoneNo);
        }

        this.getVerifyClick();
    }

    start() {
    }

    close() {
        this.node.destroy();
    }

    private getVerifyClick() {
        this.getVerifyBtn.on(cc.Node.EventType.TOUCH_END, () => {
            let extendsSprite = this.getVerifyBtn.getComponent(ExtendSprite);
            let index = extendsSprite.index;

            if (index === 0) {
                let phoneNo = this.phoenEditBox.string.trim();
                let loginData = this.getLocalCacheDataProxy().getLoginData();
                if (loginData.phoneNo) {
                    phoneNo = loginData.phoneNo;
                }

                if (phoneNo === '' || phoneNo.length !== 11) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '手机号码不正确' }, '');
                    return;
                }

                let param = {
                    phoneNo: phoneNo
                }

                let url = this.getConfigProxy().facadeUrl + "code/updateExchangePwd"
                LoginAfterHttpUtil.send(url, (res) => {
                    if (res.hd === "success") {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '验证码获取成功' }, '');
                        this.startCountdown();
                    } else {
                        if (res.bd === ServerCode.PHONE_NO_EXIST) {
                            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '手机号码存在了' }, '');
                        } else {
                            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '验证码获取失败' }, '');
                        }
                    }
                }, (error) => {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '验证码获取失败' }, '');
                }, HttpUtil.METHOD_POST, param)
            }
        });
    }

    private startCountdown() {
        let extendsSprite = this.getVerifyBtn.getComponent(ExtendSprite);
        let index = extendsSprite.index;
        extendsSprite.index = 1;
        let label = this.getVerifyBtn.getChildByName("Label").getComponent(cc.Label);
        let count = 60;
        label.string = count + "s";
        this.schedule(() => {
            if (extendsSprite.index === 0) {
                return;
            }

            count--;
            if (count < 0) {
                extendsSprite.index = 0;
                label.string = "获取验证码";
            } else {
                label.string = count + "s";
            }
        }, 1, count);
    }

    bindHander() {
        let newPwd = this.newPwdEditBox.string.trim();
        if (newPwd === '' || newPwd.length !== 6) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入6位密码' }, '');
            return;
        }

        let confirmPwd = this.confirmPwdEditBox.string.trim();
        if (confirmPwd === '' || newPwd !== confirmPwd) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '确认密码与新密码不一致' }, '');
            return;
        }

        let phoneNo = this.phoenEditBox.string.trim();
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        if (loginData.phoneNo) {
            phoneNo = loginData.phoneNo;
        }

        if (phoneNo === '' || phoneNo.length !== 11) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '手机号码不正确' }, '');
            return;
        }

        let verifyCode = this.verifyEditBox.string.trim();
        if (verifyCode === '' || verifyCode.length !== 6) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入6位验证码' }, '');
            return;
        }

        let param = {
            userName: loginData.userName,
            pwd: md5(newPwd),
            code: verifyCode,
            phoneNo: phoneNo
        }
        let url = this.getConfigProxy().facadeUrl + "user/updateExchangePwd"
        LoginAfterHttpUtil.send(url, (res) => {
            if (res.hd === "success") {
                this.close();

                loginData.phoneNo = phoneNo;
                this.getLocalCacheDataProxy().setLoginData(loginData);
                this.getLocalCacheDataProxy().setIsSetExchangePwd(true);

                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '兑换密码设置成功' }, '');
            } else {
                if (res.bd === ServerCode.SECURITY_CODE_ERROR) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '验证码不正确' }, '');
                } else if (res.bd === ServerCode.PHONE_NO_EXIST) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '手机号码存在了' }, '');
                } else {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '兑换密码修改失败' }, '');
                }
            }
        }, (error) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '兑换密码修改失败' }, '');
        }, HttpUtil.METHOD_POST, param)
    }

    private getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    // update (dt) {}
}
