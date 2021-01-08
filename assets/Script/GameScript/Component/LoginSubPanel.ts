const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"

@ccclass
export class LoginSubPanel extends ViewComponent {

    private phoneInput: cc.EditBox = null;
    private verificationInput: cc.EditBox = null;
    private inviteInput: cc.EditBox = null;
    private verButton: cc.Button = null;
    private loginButton: cc.Button = null;
    private cancleButton: cc.Button = null;

    protected async bindUI() {
        this.phoneInput = this.root.getChildByName("PhoneInput").getComponent(cc.EditBox);
        this.verificationInput = this.root.getChildByName("VerificationInput").getComponent(cc.EditBox);
        this.inviteInput = this.root.getChildByName("InviteInput").getComponent(cc.EditBox);

        this.verButton = this.root.getChildByName("VerButton").getComponent(cc.Button);
        this.loginButton = this.root.getChildByName("LoginSubmit").getComponent(cc.Button);
        this.cancleButton = this.root.getChildByName("Cancle").getComponent(cc.Button);
    }
    protected bindEvent() {
        this.verButton.node.on(cc.Node.EventType.TOUCH_END, () => {

        }, this, true);

    }
    public bindCancleEvent(callback: Function) {
        
        this.node.getChildByName("Cancle").getComponent(cc.Button).node.on(cc.Node.EventType.TOUCH_END, callback, this, true);
    }
    private onTouchEndCallback() {
        // const node = cc.instantiate(this.PhoneLoginAlert);
        // this.root.addChild(node);
        // node.parent = cc.find("Canvas");
        // node.setScale(1.5); 
        // node.opacity = 0;
        // this.buttonWrap.active = false;
        // cc.tween(node)
        //     .to(0.2, { scale: 1.0, opacity: 255 })
        //     .start()
    }
    start() {

    }

}