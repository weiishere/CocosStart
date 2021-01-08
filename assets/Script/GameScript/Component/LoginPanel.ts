const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"

@ccclass
export class LoginPanel extends ViewComponent {

    private phoneLoginNode: cc.Node = null;
    private buttonWrap: cc.Node = null;
    private phoneButton: cc.Sprite = null;
    private weixinButton: cc.Sprite = null;

    @property(cc.Prefab)
    PhoneLoginAlert: cc.Prefab = null;

    protected async bindUI() {
        this.buttonWrap = this.root.getChildByName("buttonWrap");
        this.phoneButton = this.buttonWrap.getChildByName("phone").getComponent(cc.Sprite);
        this.weixinButton = this.buttonWrap.getChildByName("weixin").getComponent(cc.Sprite);
        this.phoneLoginNode = cc.instantiate(this.PhoneLoginAlert);

        this.root.addChild(this.phoneLoginNode);
        this.phoneLoginNode.parent = cc.find("Canvas");
        this.phoneLoginNode.setScale(1.3);
        this.phoneLoginNode.opacity = 0;
        this.phoneLoginNode.active = false;
    }
    protected async bindEvent() {
        this.phoneButton.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEndCallback, this, true);
        const script = this.phoneLoginNode.getComponent('LoginSubPanel');
        script.bindCancleEvent(() => {
            console.log('bindCancleEvent');
            this.buttonWrap.active = true;
            cc.tween(this.phoneLoginNode)
                .to(0.1, { scale: 1.3, opacity: 0 }, { easing: 'sineOut' })
                .call(() => { this.phoneLoginNode.active = false; })
                .start()

        });
    }
    private onTouchEndCallback() {
        this.buttonWrap.active = false;
        this.phoneLoginNode.active = true;
        cc.tween(this.phoneLoginNode)
            .to(0.2, { scale: 1.0, opacity: 255 }, { easing: 'sineOut' })
            .start()
    }
    start() {

    }

}