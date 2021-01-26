// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareAlert extends cc.Component {

    @property(cc.Label)
    inviteCodeLabel: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy()
        })
    }

    loadData(inviteCode){
        this.inviteCodeLabel.string = "邀请码：" + inviteCode;
    }
    // update (dt) {}
}
