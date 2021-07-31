/*
 * @Author: weishere.huang
 * @Date: 2021-02-05 10:59:52
 * @LastEditTime: 2021-02-10 22:00:38
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
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
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    openUrlBtn: cc.Node = null;
    @property(cc.Label)
    tipLabel: cc.Label = null;

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
                cc.sys.openURL(this.iosDownUrl || this.shareUrl);
            } else {
                cc.sys.openURL(this.shareUrl);
            }

        });
    }

    start() {

    }
    init({ shareUrl, iosDownUrl, version, toVersion }) {
        this.shareUrl = shareUrl;
        this.iosDownUrl = iosDownUrl;

        this.tipLabel.string = `您当前使用的版本(${version})不是最新版，为保证最佳的游戏体验，请更新至最新版本(${toVersion})/n（注：若出现更新无效或者重复提示更新等异常情况，烦请删除原App再下载）`;
    }
}
