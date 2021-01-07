import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"

export class GatePanelView extends ViewComponent {

    // private loginButton: cc.Button = null;
    // private tipsLabel: cc.Label = null;


    public async bindUI() {
        // this.loginButton = this.root.getChildByName("login").getComponent(cc.Button);
        // this.tipsLabel = this.root.getChildByName("label").getComponent(cc.Label);
        
        let prefab: cc.Node = await this.createPrefab(PrefabDefine.GatePanel);
        this.root.addChild(prefab);
        return prefab;
        // this.createPrefab(PrefabDefine.GatePanel).then((prefab) => {
        //     this.root.addChild(prefab);
        // })
    }

    // public setLoginEvent(callback: Function): void {
    //     this.loginButton.node.on(cc.Node.EventType.TOUCH_END, callback, this);
    // }

    // public setTips(text: string) {
    //     this.tipsLabel.string = text;
    // }

}