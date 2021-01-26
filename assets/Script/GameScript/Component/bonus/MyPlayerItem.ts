// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import AllotSetting from "./AllotSetting";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyPlayerItem extends cc.Component {

    @property(cc.Node)
    AllotBtu: cc.Node = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private data = {};
    init(data) {
        this.data = data;
    }
    start() {
        const self = this;
        this.AllotBtu.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.AllotSettingAlert, cc.Prefab, (err, item) => {
                const node:cc.Node = cc.instantiate(item);
                (node.getComponent("AllotSetting") as AllotSetting).init(this.data);
                cc.find("Canvas").addChild(node);
            });
        }, this);
    }

    // update (dt) {}
}
