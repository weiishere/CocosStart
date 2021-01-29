// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewComponent from "../Base/ViewComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends ViewComponent {

    @property(cc.Node)
    reloadBtu: cc.Node = null;

    @property(cc.Label)
    countDown: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    bindEvent() {
        this.reloadBtu.on(cc.Node.EventType.TOUCH_END, () => {
            //location.reload();
            
        }, true);
        let time = 10;
        window.setInterval(() => {
            time--;
            if (time === 0) {
                //location.reload();
            }
            this.countDown.string = `(${time})`;
        }, 1000);
    }
    bindUI() {

    }
    start() {

    }

    // update (dt) {}
}
