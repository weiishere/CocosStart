const { ccclass, property } = cc._decorator;
import ViewComponent from "../../Base/ViewComponent";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine"

@ccclass
export class LoginPanel extends ViewComponent {

    private phoneLoginNode: cc.Node = null;
    private buttonWrap: cc.Node = null;
    private phoneButton: cc.Sprite = null;
    private weixinButton: cc.Sprite = null;
    private appName: cc.Sprite = null;

    @property(cc.Prefab)
    PhoneLoginAlert: cc.Prefab = null;

    protected async bindUI() {
        this.buttonWrap = this.root.getChildByName("buttonWrap");
        this.phoneButton = this.buttonWrap.getChildByName("phone").getComponent(cc.Sprite);
        this.weixinButton = this.buttonWrap.getChildByName("weixin").getComponent(cc.Sprite);
        this.appName = cc.find("Canvas/Gate_bg/appName").getComponent(cc.Sprite);
        


    }
    protected async bindEvent() {
        // this.phoneButton.node.on(cc.Node.EventType.TOUCH_START, () => {
        //     this.phoneButton.node.setPosition(cc.v2(this.phoneButton.node.x, this.phoneButton.node.y - 10));
        // }, this, true);
        this.appName.node.active = true;
        this.phoneButton.node.on(cc.Node.EventType.TOUCH_END, this.onPhoneTouchEndCallback, this, true);
        this.weixinButton.node.on(cc.Node.EventType.TOUCH_END, this.onRegTouchEndCallback, this, true);
        // const script = this.phoneLoginNode.getComponent('LoginSubPanel');

        // script.bindCancleEvent(() => {
        //     //console.log('bindCancleEvent');
        //     this.appName.node.active = true;
        //     this.buttonWrap.active = true;
        //     cc.tween(this.phoneLoginNode).to(0.1, { scale: 1.1, opacity: 0 }, { easing: 'sineOut' }).call(() => { this.phoneLoginNode.active = false; }).start()
        // });
    }
    private onPhoneTouchEndCallback() {
        // this.appName.node.active = false;
        // this.phoneButton.node.setPosition(cc.v2(this.phoneButton.node.x, this.phoneButton.node.y + 10));
        // this.buttonWrap.active = false;
        // this.phoneLoginNode.active = true;
        // cc.tween(this.phoneLoginNode).to(0.2, { scale: 1.0, opacity: 255 }, { easing: 'sineOut' }).start()
        this.phoneLoginNode = cc.instantiate(this.PhoneLoginAlert);
        this.appName.node.active = true;
        cc.find("Canvas").addChild(this.phoneLoginNode);
        this.phoneLoginNode.setScale(1.1);
        this.phoneLoginNode.opacity = 0;
        cc.tween(this.phoneLoginNode).to(0.2, { scale: 1.0, opacity: 255 }, { easing: 'sineOut' }).start()
        const script = this.phoneLoginNode.getComponent('LoginSubPanel');
        script.show('login');
    }
    private onRegTouchEndCallback() {
        this.phoneLoginNode = cc.instantiate(this.PhoneLoginAlert);
        this.appName.node.active = true;
        cc.find("Canvas").addChild(this.phoneLoginNode);
        this.phoneLoginNode.setScale(1.1);
        this.phoneLoginNode.opacity = 0;
        cc.tween(this.phoneLoginNode).to(0.2, { scale: 1.0, opacity: 255 }, { easing: 'sineOut' }).start()
        const script = this.phoneLoginNode.getComponent('LoginSubPanel');
        script.show('reg')
    }


    /**
     * 开始验证码倒计时
     */
    public startVerifyCountdown() {
        let script = this.phoneLoginNode.getComponent("LoginSubPanel");
        script.startVerifyCountdown();
    }

    start() {
        // cc.loader.loadRes('textures/gate/gate_bg', cc.SpriteFrame, (error, img) => {
        //     (cc.find("Canvas/Gate_bg").getComponent(cc.Sprite) as cc.Sprite).spriteFrame = img;
        // });
    }

}