// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { MusicManager } from '../Other/MusicManager';

@ccclass
export default class Setting extends ViewComponent {
    @property(cc.Toggle)
    musicToggle: cc.Toggle = null;
    @property(cc.Toggle)
    effectToggle: cc.Toggle = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;

    musicManager: MusicManager;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
            this.musicManager = null;
        });
    }

    start() {

    }
    init(musicManager: MusicManager) {
        this.musicManager = musicManager;
        this.musicToggle.isChecked = !musicManager.isPauseMusic;
        this.effectToggle.isChecked = !musicManager.isPauseEffect;
    }

    musicOnOff() {
        this.musicManager.updatePauseMusic(!this.musicToggle.isChecked);
    }

    effectOnOff() {
        this.musicManager.updatePauseEffect(!this.effectToggle.isChecked);
    }
    // update (dt) {}
}
