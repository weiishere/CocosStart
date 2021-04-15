// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../../Framework/care/Facade";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import { LoginAfterHttpUtil } from "../../Util/LoginAfterHttpUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    headSprite: cc.Sprite = null;
    @property(cc.Label)
    userNameLabel: cc.Label = null;
    @property(cc.Label)
    nicknameLabel: cc.Label = null;
    @property(cc.EditBox)
    editbox: cc.EditBox = null;
    @property(cc.Node)
    superiorNode: cc.Node = null;

    onLoad() {
        this.editbox.node.on('editing-did-ended', (event) => {
            if (event.string.length === 7) {
                let param = {
                    userName: event.string,
                }
                let url = this.getConfigProxy().facadeUrl + "user/getUserInfo"
                LoginAfterHttpUtil.send(url, (res) => {
                    if (res.hd === "success") {
                        this.nicknameLabel.string = res.bd.nickname;
                        this.userNameLabel.string = `ID: ${res.bd.userName}`
                        this.superiorNode.active = true;
                        SpriteLoadUtil.loadSprite(this.headSprite, res.bd.head);
                    } else {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '邀请码不存在' }, '');
                    }
                }, (error) => {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '邀请码不存在' }, '');
                }, HttpUtil.METHOD_POST, param)
            } else {
                this.superiorNode.active = false;
            }
        });
    }

    start() {
    }

    bindHander() {
        let superior = this.editbox.string.trim();
        if (superior === '' || superior.length != 7) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入正确的邀请码' }, '');
            return;
        }

        if (!this.superiorNode.active) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入正确的邀请码' }, '');
            return;
        }

    }

    private getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }
    // update (dt) {}
}
