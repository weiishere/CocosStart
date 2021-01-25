const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { PrefabDefine } from "../MahjongConst/PrefabDefine"
import { GateEventDefine } from '../GameConst/Event/GateEventDefine';
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import Facade from "../../Framework/care/Facade";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";

@ccclass
export class LoginSubPanel extends ViewComponent {

    @property(cc.Node)
    verButton: cc.Node = null;

    private phoneInput: cc.EditBox = null;
    private verificationInput: cc.EditBox = null;
    private inviteInput: cc.EditBox = null;
    private loginButton: cc.Button = null;
    private cancleButton: cc.Button = null;

    protected async bindUI() {
        this.phoneInput = this.root.getChildByName("PhoneInput").getComponent(cc.EditBox);
        this.verificationInput = this.root.getChildByName("VerificationInput").getComponent(cc.EditBox);
        this.inviteInput = this.root.getChildByName("InviteInput").getComponent(cc.EditBox);

        this.loginButton = this.root.getChildByName("LoginSubmit").getComponent(cc.Button);
        this.cancleButton = this.root.getChildByName("Cancle").getComponent(cc.Button);
    }
    protected bindEvent() {
        this.loginButton.node.on(cc.Node.EventType.TOUCH_END, this.loginBtnEvent.bind(this))

        this.verifyClick();
    }

    private verifyClick() {
        //验证码倒计时
        this.verButton.on(cc.Node.EventType.TOUCH_END, () => {
            let phoneNo = this.phoneInput.string;
            if (phoneNo.length != 11) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入正确的手机号码', toastOverlay: true }, '');
                return;
            }

            let normalNode = this.verButton.getChildByName("NormalBtn");
            if (normalNode.active) {
                this.dispatchCustomEvent(GateEventDefine.GET_VERIFY_CODE, new PhoneRegisterOrLoginData(phoneNo, "", ""));
            }
        });
    }

    /**
     * 开始验证码倒计时
     */
    public startVerifyCountdown() {
        let normalNode = this.verButton.getChildByName("NormalBtn");

        let disableNode = this.verButton.getChildByName("DisableBtn");
        let label = this.verButton.getChildByName("Label").getComponent(cc.Label);
        normalNode.active = false;
        disableNode.active = true;
        let count = 60;
        label.string = count + "s";
        this.schedule(() => {
            if (normalNode.active) {
                return;
            }
            count--;

            if (count < 0) {
                normalNode.active = true;
                disableNode.active = false;
                label.string = "获取验证码";
            } else {
                label.string = count + "s";
            }
        }, 1, count);
    }

    public bindCancleEvent(callback: Function) {
        this.node.getChildByName("Cancle").getComponent(cc.Button).node.on(cc.Node.EventType.TOUCH_END, callback, this, true);
    }

    public loginBtnEvent(): void {
        let phoneNo = this.phoneInput.string;
        if (phoneNo.length != 11) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '您输入的手机格式有误', toastOverlay: false }, '');
            return;
        }

        let code = this.verificationInput.string;
        if (code.length != 6) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '您输入的验证码格式有误', toastOverlay: false }, '');
            return;
        }

        // 验证码可以为空，为空表示登录
        let inviteCode = this.inviteInput.string;

        if(inviteCode && inviteCode.length > 10){
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '邀请码太长了', toastOverlay: false }, '');
        }

        this.dispatchCustomEvent(GateEventDefine.LOGIN_BTN_EVENT, new PhoneRegisterOrLoginData(phoneNo, code, inviteCode));
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