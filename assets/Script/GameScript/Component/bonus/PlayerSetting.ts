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
export default class PlayerSetting extends ViewComponent {

    @property(cc.Node)
    CloseBtu: cc.Node = null;

    @property(cc.EditBox)
    TextSet: cc.EditBox = null;

    @property(cc.Node)
    PlayerPromiseBtu: cc.Node = null;

    @property(cc.Node)
    PlayerPlayBtu: cc.Node = null;

    @property(cc.Node)
    JiaBtu: cc.Node = null;

    @property(cc.Node)
    JianBtu: cc.Node = null;

    @property(cc.Label)
    NickName: cc.Label = null;

    @property(cc.Label)
    PlayerId: cc.Label = null;

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
        this.loading.active = false;
        this.TextSet.node.on('text-changed', (data) => {

        });
        this.updateBtuStatus(this.data.status);
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    bindEvent() {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        //确认
        // this.loading.active = true;
        //0正常，1,禁赛，2不能看到亲友圈
        this.PlayerPromiseBtu.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.loading.active === true) { return; }
            this.loading.active = true;
            let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
            const param = {
                userName: this.data['userName'],
                status: this.data.status === 2 ? 0 : 2,
                loginUser: localCacheDataProxy.getLoginData().userName
            }
            this.httpRequestStartOrStop(param);
        }, true);
        //禁赛
        this.PlayerPlayBtu.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.data.status === 2) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家未被邀请入圈，请执行“邀请入圈”', toastOverlay: true }, '');
                return;
            }
            if (this.loading.active === true) { return; }
            this.loading.active = true;
            let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
            const param = {
                userName: this.data['userName'],
                status: this.data.status === 1 ? 0 : 1,
                loginUser: localCacheDataProxy.getLoginData().userName
            }
            this.httpRequestStartOrStop(param);
        }, true);
        //取消
        this.PlayerPlayBtu.on(cc.Node.EventType.TOUCH_END, () => {

        }, true);
    }
    httpRequestStartOrStop(param) {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        HttpUtil.send(bonusUrl + `/api/v1/account/set/game/startOrStop`, res => {
            this.loading.active = false;
            if (res.code === 200) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '操作已完成', toastOverlay: true }, '');
                this.data.status = param.status;
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
            this.updateBtuStatus(param.status);
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
            this.loading.active = false;
        }, HttpUtil.METHOD_POST, param);
    }
    updateBtuStatus(status) {
        //0正常，1,禁赛，2不能看到亲友圈
        if (status === 0) {
            this.PlayerPromiseBtu.getChildByName("label").getComponent(cc.Label).string = '删除成员';
            this.PlayerPlayBtu.getChildByName("label").getComponent(cc.Label).string = '禁赛';
        } else if (status === 1) {
            this.PlayerPromiseBtu.getChildByName("label").getComponent(cc.Label).string = '删除成员';
            this.PlayerPlayBtu.getChildByName("label").getComponent(cc.Label).string = '解除禁赛';
        } else if (status === 2) {
            this.PlayerPromiseBtu.getChildByName("label").getComponent(cc.Label).string = '邀请成员';
            this.PlayerPlayBtu.getChildByName("label").getComponent(cc.Label).string = '禁赛';
        }
    }
    start() {
        this.node.getChildByName("label_nackname").getComponent(cc.Label).string += this.data.nickName;
        this.node.getChildByName("label_pid").getComponent(cc.Label).string += this.data.userName;
        this.node.getChildByName("label_phone").getComponent(cc.Label).string += this.data.createDate.split(' ')[0];
        this.node.getChildByName("label_had_pay").getComponent(cc.Label).string += this.data.totalBalance;
        this.node.getChildByName("label_total_pay").getComponent(cc.Label).string += this.data.totalPay;
        this.node.getChildByName("label_balance").getComponent(cc.Label).string += this.data.balance;

        this.CloseBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        }, true);
    }

    glodGive(e, eventData) {
        if (this.loading.active === true) return;
        this.loading.active = true;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        const param = {
            playerName: this.data['userName'],
            amount: this.TextSet.string,
            type: eventData === 'add' ? 1 : -1,
            loginName: localCacheDataProxy.getLoginData().userName
        }
        let bonusUrl = this.getConfigProxy().bonusUrl;
        HttpUtil.send(bonusUrl + `/api/v1/give`, res => {
            this.loading.active = false;
            if (res.code === 200) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: `操作（${(eventData === 'add' ? '加分' : '减分') + param.amount}）已完成`, toastOverlay: true }, '');
                this.data.balance = parseFloat(this.data.balance) + (parseFloat(param.amount) * param.type);
                this.node.getChildByName("label_balance").getComponent(cc.Label).string = '余额：' + this.data.balance;
                this.TextSet.string = '';
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
            this.loading.active = false;
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
            this.loading.active = false;
        }, HttpUtil.METHOD_POST, param);
    }

    amountChangeHalder(e: string, target: cc.EditBox, customEventData) {
        if (parseFloat(e) > 1000) {

        }
    }

    // update (dt) {}
}
