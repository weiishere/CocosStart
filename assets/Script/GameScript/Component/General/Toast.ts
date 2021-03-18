// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.opacity = 0;
        this.node.setScale(0.9);

        this.node.zIndex = 20;
    }

    start() {

    }
    show(content, callback) {
        this.node.getChildByName('toast').getComponent(cc.Label).string = content;
        cc.tween(this.node).to(0.2, { opacity: 255, scale: 1 }, { easing: 'sineIn' }).start();
        this.node.getComponent(cc.Sprite).schedule(() => {
            cc.tween(this.node).to(0.2, { opacity: 0, scale: 0.9 }, { easing: 'sineIn' }).call(() => {
                this.node.destroy();
                callback && callback();
            }).start();
        }, 2);
    }

    // update (dt) {}
}
