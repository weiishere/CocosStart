// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../../Base/ViewComponent";
import { MusicManager } from '../../Other/MusicManager';
import Facade from '../../../Framework/care/Facade';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { AudioNotificationTypeDefine } from '../../MahjongConst/AudioNotificationTypeDefine';

@ccclass
export default class Setting extends ViewComponent {
    @property(cc.Toggle)
    musicToggle: cc.Toggle = null;
    @property(cc.Toggle)
    effectToggle: cc.Toggle = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    changeUser: cc.Node = null;
    @property(cc.Label)
    versionLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.changeUser.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.ChangeUser, null, "");
        });
    }

    start() {

    }

    init(isPauseMusic: boolean, isPauseEffect: boolean, isShowChangeUserBtn: boolean = true, version: string = "") {
        this.musicToggle.isChecked = !isPauseMusic;
        this.effectToggle.isChecked = !isPauseEffect;

        this.changeUser.active = isShowChangeUserBtn;
        this.versionLabel.string = "V." + version;
        // this.versionLabel.node.active = isShowChangeUserBtn;

        this.musicToggle.node.getChildByName("Background").active = !this.musicToggle.isChecked;
        this.effectToggle.node.getChildByName("Background").active = !this.effectToggle.isChecked;
    }

    musicOnOff() {
        this.musicToggle.node.getChildByName("Background").active = !this.musicToggle.isChecked;
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, !this.musicToggle.isChecked, AudioNotificationTypeDefine.PauseAudio);
    }

    effectOnOff() {
        this.effectToggle.node.getChildByName("Background").active = !this.effectToggle.isChecked;
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, !this.effectToggle.isChecked, AudioNotificationTypeDefine.PauseEffect);
    }
    // update (dt) {}
}
