// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import ViewComponent from "../../Base/ViewComponent";
const { ccclass, property } = cc._decorator;

@ccclass
export default class TTZDeskView extends ViewComponent {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    bindUI() {

    }
    bindEvent() {

    }
    start() {

    }

    // update (dt) {}
}
