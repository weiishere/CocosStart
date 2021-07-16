// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Facade from "../../../Framework/care/Facade";
import ViewComponent from "../../Base/ViewComponent";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { GateProxy } from "../../Proxy/GateProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import { LoginAfterHttpUtil } from "../../Util/LoginAfterHttpUtil";

@ccclass
export default class QYQPanel extends ViewComponent {

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    Btu_cj: cc.Node = null;

    @property(cc.Node)
    Btu_jr: cc.Node = null;

    @property(cc.Node)
    qyq_panel_bg: cc.Node = null;
    @property(cc.Label)
    deskInfo: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    bindEvent() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.Btu_cj.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请联系上级代理...', toastOverlay: false }, '');
        });
        this.Btu_jr.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请联系上级代理...', toastOverlay: false }, '');
        });
        this.qyq_panel_bg.on(cc.Node.EventType.TOUCH_END, () => {
            this.getGateProxy().joinClub();
        });
    }
    bindUI() {

    }

    start() {
        this.updateClubSimpleInfo();

        this.updateQyqPanel();
    }
    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    updateQyqPanel() {
        let status = this.getLocalCacheDataProxy().getLoginData().status;
        this.qyq_panel_bg.active = status !== 2;
    }

    updateClubSimpleInfo() {
        let url = this.getConfigProxy().facadeUrl + "club/getCreateRoomInfo";
        let param = {
            gameSubClass: 0,
        }
        LoginAfterHttpUtil.send(url, (result) => {
            if (result.hd === 'success') {
                this.deskInfo.string = `桌数：${result.bd.gameRoomCount}`;
            }
        }, (err) => {

        }, HttpUtil.METHOD_POST, param)
    }
    // update (dt) {}
}
