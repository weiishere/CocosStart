import ViewComponent from '../Base/ViewComponent';
import { LoginData } from '../GameData/LoginData';
import { SpriteLoadUtil } from '../Other/SpriteLoadUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { GateProxy } from '../Proxy/GateProxy';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { HttpUtil } from '../Util/HttpUtil';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../MahjongConst/CommandDefine';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyCenter extends ViewComponent {

    @property(cc.Label)
    nicknameLabel: cc.Label = null;
    @property(cc.Label)
    phoneNoLabel: cc.Label = null;
    @property(cc.Label)
    inviteCodeLabel: cc.Label = null;
    @property(cc.Sprite)
    headSprite: cc.Sprite = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    copyBtn: cc.Node = null;
    @property(cc.Node)
    startEditBtn: cc.Node = null;
    @property(cc.Node)
    nicknameNode: cc.Node = null;
    @property(cc.Node)
    editNicknameNode: cc.Node = null;
    @property(cc.EditBox)
    nicknameEditBox: cc.EditBox = null;
    @property(cc.Node)
    cancelEditBtn: cc.Node = null;
    @property(cc.Node)
    confirmEidtBtn: cc.Node = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.copyBtn.on(cc.Node.EventType.TOUCH_END, (event) => {
            let inviteCode = this.inviteCodeLabel.string;
            if (!inviteCode) {
                return;
            }
            if (CC_JSB) {
                (<any>jsb).copyTextToClipboard(inviteCode);
                this.getGateProxy().toast("邀请码复制成功");
            }
        });
        this.startEditBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.updateNicknameStatus();
        });
        this.cancelEditBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.updateNicknameStatus();
        });
        this.confirmEidtBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.updateNickname(this.nicknameEditBox.string);
        });

    }

    updateNicknameStatus() {
        if (this.nicknameNode.active) {
            this.nicknameNode.active = false;
            this.editNicknameNode.active = true;
            this.nicknameEditBox.string = this.nicknameLabel.string;
        } else {
            this.nicknameNode.active = true;
            this.editNicknameNode.active = false;
            this.nicknameLabel.string = this.nicknameEditBox.string;
        }
    }

    loadData(loginData: LoginData, inviteCode: string) {
        this.nicknameLabel.string = loginData.nickname;
        this.phoneNoLabel.string = loginData.phoneNo;
        this.inviteCodeLabel.string = inviteCode;
        SpriteLoadUtil.loadSprite(this.headSprite, loginData.head);
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }


    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    updateNickname(newnickname: string) {
        if (!newnickname || newnickname.length === 0) {
            this.getGateProxy().toast("昵称不能为空");
            return;
        }

        if (this.nicknameLabel.string === this.nicknameEditBox.string) {
            this.updateNicknameStatus();
            return;
        }

        const loginData = this.getLocalCacheDataProxy().getLoginData();
        const url = this.getConfigProxy().facadeUrl + "/user/updateUserNickname";
        const param = {
            userName: loginData.userName,
            nickname: newnickname
        }

        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                loginData.nickname = response.bd;
                this.getLocalCacheDataProxy().setLoginData(loginData);
                this.getGateProxy().toast("修改成功！");
                this.updateNicknameStatus();
                this.sendUpdateNickname(loginData.nickname);
            } else {
                this.getGateProxy().toast("修改失败！");
            }
        }, (err) => {
            this.getGateProxy().toast("修改昵称失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    sendUpdateNickname(nickname: string) {
        Facade.Instance.sendNotification(CommandDefine.UpdateNickname, nickname, "");
    }

    start() {
    }
    // update (dt) {}
}
