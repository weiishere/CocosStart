// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../Framework/care/Facade";
import ViewComponent from "../Base/ViewComponent";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { SpriteLoadUtil } from "../Other/SpriteLoadUtil";
import { ConfigProxy } from "../Proxy/ConfigProxy";
import { GateProxy } from "../Proxy/GateProxy";
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../Util/HttpUtil";
import { LoginAfterHttpUtil } from "../Util/LoginAfterHttpUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeadList extends ViewComponent {

    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    headContainer: cc.Node = null;
    @property(cc.Node)
    headListNode: cc.Node = null;
    @property(cc.Node)
    updateBtn: cc.Node = null;

    selectHeadName: string = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    protected bindUI(): void {
        let headUrl = "http://139.9.242.13/static/userHead/";

        for (let index = 0; index < 24; index++) {
            let headName = "r" + index + ".png";
            let head = headUrl + headName;
            this.createHead(head, headName);
        }
    }

    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.updateBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.updateHead();
        });
    }

    private cancelSelectHead() {
        for (const headNode of this.headContainer.children) {
            let headList = headNode.getChildByName("headList");
            headList.active = false;
        }
    }

    private createHead(head: string, headName: string) {
        let headNode: cc.Node = new cc.Node();
        let sprite = headNode.addComponent(cc.Sprite);
        this.headContainer.addChild(headNode);

        headNode.name = headName;

        let headList = cc.instantiate(this.headListNode);
        headList.name = "headList";
        headList.x = 0;
        headList.y = 0;
        headNode.addChild(headList);

        let texture = cc.loader.getRes(head, cc.Texture2D);
        if (texture) {
            sprite.spriteFrame = new cc.SpriteFrame(texture);

            headNode.width = 100;
            headNode.height = 100;
        } else {
            cc.loader.load(head, (error, item) => {
                sprite.spriteFrame = new cc.SpriteFrame(item)

                headNode.width = 100;
                headNode.height = 100;
            });
        }

        headNode.on(cc.Node.EventType.TOUCH_END, () => {
            this.cancelSelectHead();
            headList.active = true;

            this.selectHeadName = headNode.name;
        })
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

    private updateHead() {
        if (!this.selectHeadName) {
            this.node.destroy();
            return;
        }

        let loginData = this.getLocalCacheDataProxy().getLoginData()
        const url = this.getConfigProxy().facadeUrl + "/user/updateUserHead";
        const param = {
            head: this.selectHeadName,
        }

        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                loginData.head = response.bd;
                this.getLocalCacheDataProxy().setLoginData(loginData);
                this.getGateProxy().toast("修改成功！");
                this.dispatchCustomEvent("update_head", loginData.head);
                this.sendUpdateHead(loginData.head);
                this.node.destroy();
            } else {
                this.getGateProxy().toast("修改失败！");
            }
        }, (err) => {
            this.getGateProxy().toast("修改头像失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    sendUpdateHead(head: string) {
        Facade.Instance.sendNotification(CommandDefine.UpdateHead, head, "");
    }

    // update (dt) {}
}
