// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewComponent from "../../Base/ViewComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NoticeAlert extends ViewComponent {

    @property(cc.Node)
    contentWrap: cc.Node = null;

    @property(cc.Node)
    closeBtu: cc.Node = null;

    private content: string = '';

    bindUI() {
        this.node.active = false;
    }
    bindEvent() {
        this.closeBtu.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(this.node).to(0.1, { opacity: 0, scale: 0.9 }).call(() => {
                this.node.destroy();
            }).start();
        }, this);
    }
    show(content?: string, closeCallBack?: () => void) {
        this.node.active = true;
        this.node.opacity = 0;
        this.node.scale = 0.9;
        if (content) this.content = content;
        this.contentWrap.getComponent(cc.Label).string = content || this.content;
        cc.tween(this.node).to(0.1, { opacity: 255, scale: 1 }).call(() => { closeCallBack && closeCallBack(); }).start();
    }
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
