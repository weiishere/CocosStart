const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"
import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';

@ccclass
export class GatePanelView extends ViewComponent {

    // private loginButton: cc.Button = null;
    // private tipsLabel: cc.Label = null;

    //public gatePanel: cc.Node = null;
    @property(cc.Prefab)
    LoginView: cc.Prefab = null;

    @property(cc.Prefab)
    AccountPanel: cc.Prefab = null;

    @property(cc.Prefab)
    GateStartPanel: cc.Prefab = null;

    @property(cc.SpriteFrame)
    MainBG_2: cc.SpriteFrame = null;

    @property(cc.Prefab)
    GameList: cc.Prefab = null;

    protected async bindUI() {
        this.node.getChildByName("appName").active = false;
        // this.loginButton = this.root.getChildByName("login").getComponent(cc.Button);
        // this.tipsLabel = this.root.getChildByName("label").getComponent(cc.Label);

        // let prefab: cc.Node = await this.createPrefab(PrefabDefine.GatePanel);

        // this.root.addChild(prefab);
        // return prefab;
        // this.createPrefab(PrefabDefine.GatePanel).then((prefab) => {
        //     this.root.addChild(prefab);
        // })

        // const b = cc.instantiate(this.LoginView);
        // this.root.addChild(b);

    }
    protected async bindEvent() {
    }
    removePhoneLoginNode(): void {
        //removeLoginPanel
        //this.root.removeChild(this.node);
        //this.root.removeChild(this.LoginView);
        this.LoginView.destroy();
    }
    start() {

    }
    // public setLoginEvent(callback: Function): void {
    //     this.loginButton.node.on(cc.Node.EventType.TOUCH_END, callback, this);
    // }

    // public setTips(text: string) {
    //     this.tipsLabel.string = text;
    // }

}