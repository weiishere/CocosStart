const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"

@ccclass
export class LoginPanel extends ViewComponent {

    private buttonWrap: cc.Node = null;
    private phoneButton: cc.Sprite = null;
    private weixinButton: cc.Sprite = null;

    @property(cc.Prefab)
    PhoneLoginAlert: cc.Prefab = null;

    public async bindUI() {
        this.buttonWrap = this.root.getChildByName("buttonWrap");
        this.phoneButton = this.buttonWrap.getChildByName("phone").getComponent(cc.Sprite);
        this.weixinButton = this.buttonWrap.getChildByName("weixin").getComponent(cc.Sprite);
        this.bindEvent();
    }
    public async bindEvent() {
        this.phoneButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this, true);

    }
    private onTouchEndCallback() {
        const node = cc.instantiate(this.PhoneLoginAlert);
        this.root.addChild(node);
        node.parent = cc.find("Canvas");
        node.setScale(1.5); 
        node.opacity = 0;
        this.buttonWrap.active = false;
        cc.tween(node)
            //.to(0.1, { position: cc.v3(100, 100) })
            .to(0.2, { scale: 1.0, opacity: 255 })
            .start()

        // let actionFadeIn = cc.sequence(
        //     cc.spawn(cc.fadeTo(0.3, 255), cc.scaleTo(0.3, 1.0)),
        //     cc.callFunc(() => { }, this)
        // );
        // node.runAction(actionFadeIn);
    }
    start() {

    }

}