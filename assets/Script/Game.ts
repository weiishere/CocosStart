// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { MahjongFacade } from "./MahjongFacade";
import { ApplicationGlobal } from "./GameScript/MahjongConst/ApplicationGlobal";

@ccclass
export default class Game extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.Prefab)
    gateView: cc.Prefab = null;


    onLoad() {
        ApplicationGlobal.GatePanel = this.node;
    }

    start() {
        new MahjongFacade().startup();
    }

    // update (dt) {}
}
