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
        '别走，大厅见，换桌再战一百回合',
        '看我这把牌，你这盘怕是要遭输光哦',
        '这局看你表演，我全力配合',
        '今天不赢一个亿，人活一生无意义'
    ]
    // onLoad () {}
    private order: ChatOrder = "face";
    private sendHandler: (msgObj: MsgObj) => void;
    bindUI() {
        this.switchChatPanel("face");
    }
    bindEvent() {
        this.closeBtu.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(this.node).to(0.1, { opacity: 0, scale: 0.9 }).call(() => {
                this.node.destroy();
            }).start();
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

        // var editboxEventHandler = new cc.Component.EventHandler();
        // editboxEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        // editboxEventHandler.component = "cc.MyComponent"
        // editboxEventHandler.handler = "onEditDidBegan";
        // editboxEventHandler.customEventData = "foobar";
        // this.editBox.editingReturn.push(editboxEventHandler);
        this.editBox.node.on('editing-return', (editbox) => {
            if (this.editBox.string !== '') {
                this.send(this.editBox.string, 'msg');
                this.editBox.string = '';
            }
        }, this);
        this.sendBtu.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.editBox.string !== '') {
                this.send(this.editBox.string, 'msg');
                this.editBox.string = '';
            }
        }, this);
    }
    bindSendHandler(sendHandler) {
        this.sendHandler = sendHandler;
    }
    private send(content: any, order?: ChatOrder) {
        const userInfo = (<LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();

        this.sendHandler && this.sendHandler({
            nickName: userInfo.nickname,
            type: order ? order : this.order,
            content: content + ''
        })
    }
    switchChatPanel(order: ChatOrder) {
        this.order = order;
        this.chatListWrap.removeAllChildren();

        if (order === 'face') {
            for (let i = 1; i <= 25; i++) {
                cc.loader.loadRes(`textures/desk/face/face(${i})`, cc.Texture2D, (err, item) => {
                    const nodeWrap = new cc.Node('faceWrap');
                    nodeWrap.width = nodeWrap.height = 60;
                    const layout = nodeWrap.addComponent(cc.Layout);
                    layout.type = cc.Layout.Type.HORIZONTAL;

                    const btu2 = nodeWrap.addComponent(cc.Button);
                    btu2.transition = cc.Button.Transition.COLOR;
                    btu2.pressedColor = new cc.Color(0, 255, 0);

                    const node = new cc.Node('face');
                    const face = node.addComponent(cc.Sprite);
                    face.spriteFrame = new cc.SpriteFrame(item);
                    node.scale = 0.15;

                    nodeWrap.addChild(node);

                    const btu = node.addComponent(cc.Button);
                    btu.transition = cc.Button.Transition.SCALE;
                    btu.zoomScale = 0.9;

                    this.chatListWrap.addChild(nodeWrap);
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
                label.fontSize = 24;
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
    show() {
        this.node.opacity = 0;
        this.node.scale = 0.9;
        cc.tween(this.node).to(0.1, { opacity: 255, scale: 1 }).call(() => {

        }).start();
    }
    start() {

    }

    // update (dt) {}
}
