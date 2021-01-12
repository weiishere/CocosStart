// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import Facade from "../../Framework/care/Facade";
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine"
import { GateProxy } from "../Proxy/GateProxy";

@ccclass
export default class GateStartPanel extends ViewComponent {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    private mahjongEntrance: cc.Node;
    private pdkEntrance: cc.Node;
    private exchangeEntrance: cc.Node;

    protected async bindUI() {
        this.mahjongEntrance = this.root.getChildByName("gameBg1");
        this.pdkEntrance = this.root.getChildByName("gameBg2");
        this.exchangeEntrance = this.root.getChildByName("gameBg3");
        this.initEffect();
    }

    private initEffect(): void {
        const mahjongNode = this.root.getChildByName("gameBg1").getChildByName("gameItem1");
        const _action = cc.repeatForever(cc.sequence(cc.moveBy(1, cc.v2(0, 10)), cc.moveBy(1, cc.v2(0, -10)), cc.callFunc(() => { })));
        mahjongNode.runAction(_action);
    }

    protected async bindEvent() {
        this.mahjongEntrance.on(cc.Node.EventType.TOUCH_END, () => {
            (Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy).joinClub();
        }, this, true);
        this.pdkEntrance.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '游戏开发中，敬请期待...', toastOverlay: true }, '');
        }, this, true);
        this.exchangeEntrance.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '充值界面', toastOverlay: true }, '')
        }, this, true);
    }
    // onLoad () {


    // }

    start() {

    }

    // update (dt) {}
}
