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
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import { getUserOrderInfo, initNoRecoreNode } from './MyBonus';

@ccclass
export default class AllotSetting extends ViewComponent {

    @property(cc.Node)
    CloseBtu: cc.Node = null;

    @property(cc.EditBox)
    TextSet: cc.EditBox = null;

    @property(cc.Node)
    SureBtu: cc.Node = null;

    @property(cc.Node)
    CancleBtu: cc.Node = null;

    @property(cc.Slider)
    Slider: cc.Slider = null;

    @property
    text: string = 'hello';

    private data = null;
    private loading: cc.Node = null
    private lastRemailRatio: number = 0;
    private remailRatio: number = 0;
    private thisRatio: number = 0;
    // onLoad () {}
    public init(data) {
        this.data = data;
    }
    bindUI() {
        this.loading = this.node.getChildByName('loading');
        this.loading.active = true;
        this.Slider.node.on('slide', (data) => {
            //console.log(data.progress);
            const p = data.progress.toFixed(2);
            this.TextSet.string = (p * 100).toFixed(0) + '';
            this.node.getChildByName("biliValue").getComponent(cc.Label).string = (+(1 - p) * 100).toFixed(0) + '%';
        });
        this.TextSet.node.on('text-changed', (data) => {
            //console.log(data.string);
            this.Slider.progress = (data.string / 100);
            this.node.getChildByName("biliValue").getComponent(cc.Label).string = +((100 - data.string)).toFixed(2) + '%';
        });

    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    bindEvent() {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        //确认
        this.loading.active = true;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        this.SureBtu.on(cc.Node.EventType.TOUCH_END, () => {
            const num = +this.TextSet.getComponent(cc.EditBox).string;
            if (this.thisRatio > +num) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '授权比例不能调低', toastOverlay: true }, '');
                this.TextSet.getComponent(cc.EditBox).string = this.thisRatio + '';
                this.Slider.progress = this.thisRatio / 100;
                this.node.getChildByName("biliValue").getComponent(cc.Label).string = (100 - this.thisRatio).toFixed(2) + "%";
                return;
            }
            // if(isNaN(num)){ }
            const param = {
                loginUser: localCacheDataProxy.getLoginData().userName,
                targetUser: this.data.userName,
                bonus: num / 100
            }
            getUserOrderInfo(this.data.userName, ({ data }) => {
                HttpUtil.send(bonusUrl + `/api/v1/account/${data.accountType === 666 ? 'update' : 'add'}/leader`, res => {
                    this.loading.active = false;
                    if (res.code === 200) {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '操作已完成', toastOverlay: true }, '');
                    } else {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
                    }
                }, (err) => {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
                }, HttpUtil.METHOD_POST, param)
            });
        }, true);
        //取消
        this.CancleBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
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
        let bonusUrl = this.getConfigProxy().bonusUrl;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        //${/*localCacheDataProxy.getLoginData().userName*/}
        this.loading.active = true;
        HttpUtil.send(bonusUrl + `/api/v1/account/leader?userName=${this.data.userName}`, res => {
            this.loading.active = false;
            if (res.code === 200) {
                this.lastRemailRatio = res.data;
                this.remailRatio = +(1 - res.data).toFixed(2);
                this.node.getChildByName("biliValue").getComponent(cc.Label).string = (this.remailRatio * 100).toFixed(2) + "%";
                this.TextSet.placeholder = ``;
                this.thisRatio = (+(1 - this.remailRatio).toFixed(2) * 100);
                this.TextSet.string = this.thisRatio + '';
                this.Slider.progress = +(1 - this.remailRatio).toFixed(2);
                this.node.getChildByName("titleLabel").getComponent(cc.Label).string = `分配到该盟主的百分比(不低于${this.thisRatio}%):`;
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
        }, HttpUtil.METHOD_GET, {})
    }

    // update (dt) {}
}
