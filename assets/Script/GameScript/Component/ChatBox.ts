// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../Framework/care/Facade";
import ViewComponent from "../Base/ViewComponent";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy";

const { ccclass, property } = cc._decorator;

export type ChatOrder = "face" | "msg";
export type MsgObj = {
    nickName: string,
    type: ChatOrder,
    content: string
}
@ccclass
export default class ChatBox extends ViewComponent {

    @property(cc.Node)
    closeBtu: cc.Node = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Node)
    sendBtu: cc.Node = null;

    @property(cc.Node)
    faceBtu: cc.Node = null;

    @property(cc.Node)
    msgBtu: cc.Node = null;

    @property(cc.Node)
    chatListWrap: cc.Node = null;

    @property(cc.SpriteFrame)
    faceBtuSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    faceBtuActiveSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    msgBtuSf: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    msgBtuActiveSf: cc.SpriteFrame = null;
    // LIFE-CYCLE CALLBACKS:

    private msgList = [
        '你的牌打的也太好了吧！',
        '快点吧，都等到我花儿都谢了',
        '鸡不叫不睡觉，决战到天亮',
        '别走，换桌再战一百回合',
        '我这把牌看来，你怕是要遭输光哦',
        '这盘投降输一半可以不，看你表演咯',
        '今天输了一个亿，我不急...'
    ]
    // onLoad () {}
    private order: ChatOrder = "face";
    private sendHandler: (msgObj: MsgObj) => void;
    bindUI() {
        this.switchChatPanel("face");
    }
    bindEvent() {
        this.closeBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        }, this);
        this.faceBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.faceBtu.getComponent(cc.Sprite).spriteFrame = this.faceBtuActiveSf;
            this.msgBtu.getComponent(cc.Sprite).spriteFrame = this.msgBtuSf;
            this.switchChatPanel("face");
        }, this);
        this.msgBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.faceBtu.getComponent(cc.Sprite).spriteFrame = this.faceBtuSf;
            this.msgBtu.getComponent(cc.Sprite).spriteFrame = this.msgBtuActiveSf;
            this.switchChatPanel("msg");
        }, this);
        this.sendBtu.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.editBox.string !== '') {
                this.send(this.editBox.string, 'msg');
            }
        }, this);
    }
    bindSendHandler(sendHandler) {
        this.sendHandler = sendHandler;
    }
    private send(content: any, order?: ChatOrder) {
        const userInfo = (<LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();
        if (order) {
            this.sendHandler({
                nickName: userInfo.nickname,
                type: order,
                content: content + ''
            })
        } else {
            this.sendHandler({
                nickName: userInfo.nickname,
                type: this.order,
                content: content
            })
        }
    }
    switchChatPanel(order: ChatOrder) {
        this.order = order;
        this.chatListWrap.removeAllChildren();

        if (order === 'face') {
            for (let i = 1; i <= 25; i++) {
                cc.loader.loadRes(`textures/desk/face/face(${i})`, cc.Texture2D, (err, item) => {
                    const node = new cc.Node('face');
                    const face = node.addComponent(cc.Sprite)
                    face.spriteFrame = new cc.SpriteFrame(item);
                    node.scale = 0.15;
                    const btu = node.addComponent(cc.Button);
                    btu.transition = cc.Button.Transition.COLOR;
                    btu.pressedColor = new cc.Color(0, 255, 0);
                    this.chatListWrap.addChild(node);
                    node.on(cc.Node.EventType.TOUCH_END, () => {
                        this.send(i);
                    }, this);
                });
            }
        } else {
            this.msgList.forEach(item => {
                const node = new cc.Node('face');
                const label = node.addComponent(cc.Label)
                label.string = item;
                label.fontSize = 22;
                label.lineHeight = 26;
                const btu = node.addComponent(cc.Button);
                btu.transition = cc.Button.Transition.COLOR;
                btu.pressedColor = new cc.Color(0, 255, 0);
                this.chatListWrap.addChild(node);
                node.on(cc.Node.EventType.TOUCH_END, () => {
                    this.send(item);
                }, this);
            });
        }
    }
    start() {

    }

    // update (dt) {}
}
