const { ccclass, property } = cc._decorator;
import ViewComponent from "../../Base/ViewComponent";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine"
import { GateEventDefine } from '../../GameConst/Event/GateEventDefine';
import { PhoneRegisterOrLoginData } from '../../GameData/PhoneRegisterOrLoginData';
import Facade from "../../../Framework/care/Facade";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../../MahjongConst/NotificationTypeDefine";

@ccclass
export class LoginSubPanel extends ViewComponent {

    @property(cc.Node)
    verButton: cc.Node = null;

    private phoneInput: cc.EditBox = null;
    private verificationInput: cc.EditBox = null;
    private inviteInput: cc.EditBox = null;
    private nicknameEditBox: cc.EditBox = null;
    private loginButton: cc.Node = null;
    private cancleButton: cc.Node = null;
    private order: "reg" | "login";
    protected async bindUI() {
        this.phoneInput = this.root.getChildByName("bg").getChildByName("PhoneInput").getComponent(cc.EditBox);
        this.verificationInput = this.root.getChildByName("bg").getChildByName("VerificationInput").getComponent(cc.EditBox);
        this.inviteInput = this.root.getChildByName("bg").getChildByName("InviteInput").getComponent(cc.EditBox);
        this.nicknameEditBox = this.root.getChildByName("bg").getChildByName("nickname").getComponent(cc.EditBox);

        this.loginButton = this.root.getChildByName("bg").getChildByName("btuWrap").getChildByName("LoginSubmit");
        this.cancleButton = this.root.getChildByName("bg").getChildByName("btuWrap").getChildByName("Cancle");
    }
    protected bindEvent() {
        this.loginButton.on(cc.Node.EventType.TOUCH_END, this.loginBtnEvent.bind(this));
        this.cancleButton.on(cc.Node.EventType.TOUCH_END, this.cancle.bind(this));
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
                this.dispatchCustomEvent(GateEventDefine.GET_VERIFY_CODE, new PhoneRegisterOrLoginData(phoneNo, "", "", ""));
            }
        });
    }
    show(order: "reg" | "login") {
        this.order = order;
        cc.tween(this.root).to(0.2, { scale: 1.0, opacity: 255 }, { easing: 'sineOut' }).start();
        if (order === 'login') {
            this.root.getChildByName("bg").getChildByName("title").getComponent(cc.Label).string = "玩家登录";
            this.inviteInput.node.active = false;
            this.nicknameEditBox.node.active = false;
        } else {
            this.root.getChildByName("bg").getChildByName("title").getComponent(cc.Label).string = "玩家注册";
            this.inviteInput.node.active = true;
            this.nicknameEditBox.node.active = true;
        }
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

        if (inviteCode && inviteCode.length > 10) {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '邀请码太长了', toastOverlay: false }, '');
            return;
        }

        let nickname = this.nicknameEditBox.string;
        if (this.order === "reg") {
            if (inviteCode === '') {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '新注册玩家请输入邀请码', toastOverlay: false }, '');
                return;
            }

            if (nickname === '') {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '新注册玩家请输入邀请码', toastOverlay: false }, '');
                return;
            }
        }
        this.dispatchCustomEvent(GateEventDefine.LOGIN_BTN_EVENT, new PhoneRegisterOrLoginData(phoneNo, code, inviteCode, nickname));

    }
    public cancle(): void {
        // cc.tween(this.root).to(0.2, { scale: 1.0, opacity: 50 }, { easing: 'sineOut' }).call(()=>{
        //     this.root.destroy();
        // }).start()
        cc.tween(this.root).to(0.1, { scale: 1.1, opacity: 0 }, { easing: 'sineOut' }).call(() => { this.root.destroy(); }).start()
    }
    start() {

    }

}