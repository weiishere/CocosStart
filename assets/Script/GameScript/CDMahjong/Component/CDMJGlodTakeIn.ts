// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from '../../Base/ViewComponent';

@ccclass
export default class CDMJGlodTakeIn extends ViewComponent {

    @property(cc.Node)
    trueBtuuon: cc.Node = null;

    @property(cc.Slider)
    slider: cc.Slider = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    private doneHandler: (resultGlod: number) => void;

    bindEvent() {

    }

    bindUI() {
        this.trueBtuuon.on(cc.Node.EventType.TOUCH_END, (touchEvent) => {
            this.node.destroy();
            this.doneHandler(+this.editBox.string);
        })
    }

    bindDone(doneHandler: (resultGlod: number) => void) {
        this.doneHandler = doneHandler;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
