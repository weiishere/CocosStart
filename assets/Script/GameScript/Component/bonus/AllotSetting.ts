// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Facade from "../../../Framework/care/Facade";
import ViewComponent from "../../Base/ViewComponent";
import { ApplicationGlobal } from "../../MahjongConst/ApplicationGlobal";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";

@ccclass
export default class AllotSetting extends ViewComponent {

    @property(cc.Node)
    CloseBtu: cc.Node = null;

    @property(cc.Node)
    TextSet: cc.Node = null;

    @property(cc.Node)
    SureBtu: cc.Node = null;

    @property(cc.Node)
    CancleBtu: cc.Node = null;

    @property
    text: string = 'hello';

    private data = null;
    private loading: cc.Node = null

    // onLoad () {}
    public init(data) {
        this.data = data;
    }
    bindUI() {
        this.loading = this.node.getChildByName('loading');
        this.loading.active = true;
    }
    bindEvent() {
        //确认
        this.loading.active = true;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        this.SureBtu.on(cc.Node.EventType.TOUCH_END, () => {
            debugger
            HttpUtil.send(ApplicationGlobal.BaseUrl + `/api/v1/account/update/leader?loginUser=${localCacheDataProxy.getLoginData().userName}&targetUser=${this.data.userName}&bonus=${this.TextSet.getComponent(cc.EditBox).string}`, res => {
                this.loading.active = false;
                if (res.code === 200) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '操作已完成', toastOverlay: true }, '');
                } else {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
                }
            }, (err) => {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
            }, HttpUtil.METHOD_GET, {})
        }, true);
        //取消
        this.CancleBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.destroy();
        }, true);
    }
    start() {
        this.node.getChildByName("biliValue").getComponent(cc.Label).string = '';
        this.CloseBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        }, true);
        this.getAllot();
    }

    getAllot() {
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        //${/*localCacheDataProxy.getLoginData().userName*/}
        this.loading.active = true;
        HttpUtil.send(ApplicationGlobal.BaseUrl + `/api/v1/account/leader?userName=${localCacheDataProxy.getLoginData().userName}`, res => {
            this.loading.active = false;
            if (res.code === 200) {
                const remail = 1 - res.data;
                this.node.getChildByName("biliValue").getComponent(cc.Label).string = remail * 100 + "%";
                this.TextSet.getComponent(cc.EditBox).placeholder = `请输入分配到的百分比(<${remail * 100}%)`;
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
        }, HttpUtil.METHOD_GET, {})
    }

    // update (dt) {}
}
