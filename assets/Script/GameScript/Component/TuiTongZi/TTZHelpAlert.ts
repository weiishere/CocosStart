// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TTZHelpAlert extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        const panel_close = this.node.getChildByName("panel_close");
        panel_close.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(panel_close).to(0.1, { scale: 1.1 }).to(0.1, { scale:1 }).call(() => {
                this.node.destroy();
            }).start();
        }, this);
    }

    // update (dt) {}
}
