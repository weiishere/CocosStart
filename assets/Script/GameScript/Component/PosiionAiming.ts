// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class PosiionAiming extends cc.Component {

    onLoad() {
        this.node.runAction(cc.repeatForever(
            cc.sequence(
                cc.fadeTo(0.4, 100),
                cc.fadeTo(0.4, 255),
                cc.callFunc(() => { }))))
    }
    start() {

    }

    // update (dt) {}
}
