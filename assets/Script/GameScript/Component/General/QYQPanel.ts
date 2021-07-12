// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import Facade from "../../../Framework/care/Facade";
import ViewComponent from "../../Base/ViewComponent";
import { CommandDefine } from "../../MahjongConst/CommandDefine";

@ccclass
export default class QYQPanel extends ViewComponent {

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    Btu_cj: cc.Node = null;

    @property(cc.Node)
    Btu_jr: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    bindEvent(){
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.Btu_cj.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请联系上级代理...', toastOverlay: false }, '');
        });
        this.Btu_jr.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请联系上级代理...', toastOverlay: false }, '');
        });
    }
    bindUI(){

    }

    start () {

    }

    // update (dt) {}
}
