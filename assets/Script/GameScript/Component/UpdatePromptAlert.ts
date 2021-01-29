// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import { MusicManager } from '../Other/MusicManager';
import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { AudioNotificationTypeDefine } from '../MahjongConst/AudioNotificationTypeDefine';

@ccclass
export default class Setting extends ViewComponent {
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    openUrlBtn: cc.Node = null;

    shareUrl: string;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.openUrlBtn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.sys.openURL(this.shareUrl);
        });
    }

    start() {

    }
    init(shareUrl: string) {
        this.shareUrl = shareUrl;
    }
}
