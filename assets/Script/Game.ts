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
        // 让屏幕不息屏，一直常亮，虽然找到Device，但是打包之后运行是没有问题的
        if(CC_JSB){
            jsb.Device.setKeepScreenOn(true);
        }
    }

    start() {
        new MahjongFacade().startup();
    }

    // update (dt) {}
}
