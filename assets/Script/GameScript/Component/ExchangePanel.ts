import ViewComponent from '../Base/ViewComponent';
import { HttpUtil } from '../Util/HttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangePanel extends ViewComponent {

    @property(cc.Node)
    goldBuyList: cc.Node = null;
    @property(cc.Node)
    logNode: cc.Node = null;
    @property(cc.Node)
    convertNode: cc.Node = null;
    @property(cc.Node)
    logContentItem: cc.Node = null;
    @property(cc.Node)
    logContentContainer: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.buyListClick();
    }

    private buyListClick() {
        this.goldBuyList.children.forEach((value: cc.Node) => {
            value.on(cc.Node.EventType.TOUCH_END, (event) => {
                let panel = event.target as cc.Node
                let label = panel.getChildByName("GoldLabel").getComponent(cc.Label);
                cc.log(label.string);

                this.exchange(label.string);
            });
        })

    }

    private exchange(gold) {
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        let configProxy: ConfigProxy = <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);

        let token = localCacheDataProxy.getUserToken();
        let url = configProxy.facadeUrl + "exchange/upGold";
        let param = {
            userName: localCacheDataProxy.getLoginData().userName,
            gold: parseFloat(gold),
        }
        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '充值成功', toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '充值失败' + err, toastOverlay: true }, '');
        }, HttpUtil.METHOD_POST, param);
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    hideNode() {
        this.goldBuyList.active = false;
        this.logNode.active = false;
        this.convertNode.active = false;
    }

    updateLogContent(cotnent: cc.Node, timeStr, typeStr, moneyStr, statusStr) {
        let timeLabel = cotnent.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = cotnent.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = cotnent.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;
        let statusLabel = cotnent.getChildByName("StatusLabel").getComponent(cc.Label);
        statusLabel.string = statusStr;
    }

    addLogContent() {
        this.logContentContainer.removeAllChildren();
        let node = cc.instantiate(this.logContentItem);
        // this.updateLogContent(node, "");
        this.logContentContainer.addChild(node);
    }

    updateLogTitle(timeStr, typeStr, moneyStr) {
        let node = <cc.Node>this.logNode.getChildByName("Title");
        let timeLabel = node.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = node.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = node.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;
        // let StatusLabel = node.getChildByName("StatusLabel").getComponent(cc.Label);
    }

    exchangeLogTitleUpdate() {
        this.updateLogTitle("充值时间", "充值方式", "充值金额");
    }

    convertLogTitleUpdate() {
        this.updateLogTitle("兑换时间", "兑换方式", "兑换金额");
    }

    menuClick(event) {
        this.hideNode();
        if (event.target.name === "goldBuyItem") {
            this.goldBuyList.active = true;
        } else if (event.target.name === "exchangeLogItem") {
            this.exchangeLogTitleUpdate();
            this.logNode.active = true;
        } else if (event.target.name === "convert") {
            this.convertNode.active = true;
        } else if (event.target.name === "convertLog") {
            this.convertLogTitleUpdate();
            this.logNode.active = true;
        }
    }

    // update (dt) {}
}
