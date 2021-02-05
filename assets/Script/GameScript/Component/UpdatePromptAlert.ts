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
    iosDownUrl: string;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.openUrlBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                cc.sys.openURL(this.shareUrl);//安卓下载链接
            } else if (cc.sys.os === cc.sys.OS_IOS) {
                //IOS下载链接
                cc.sys.openURL(this.iosDownUrl);
            }

        });
    }

    start() {

    }
    init({ shareUrl, iosDownUrl }) {
        this.shareUrl = shareUrl;
        this.iosDownUrl = iosDownUrl;
    }
}
