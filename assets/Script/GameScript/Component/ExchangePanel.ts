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
    @property(cc.Node)
    getVerifyBtn: cc.Node = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.buyListClick();
        this.verifyClick();
    }

    private verifyClick() {
        //验证码倒计时
        this.getVerifyBtn.on(cc.Node.EventType.TOUCH_END, () => {
            let normalNode = this.getVerifyBtn.getChildByName("NormalBtn");
            let disableNode = this.getVerifyBtn.getChildByName("DisableBtn");
            if (normalNode.active) {
                let label = this.getVerifyBtn.getChildByName("Label").getComponent(cc.Label);
                normalNode.active = false;
                disableNode.active = true;
                let count = 60;
                label.string = count + "s";
                this.schedule(() => {
                    if (normalNode.active) {
                        return;
                    }
                    count--;

                    if (count < 0) {
                        normalNode.active = true;
                        disableNode.active = false;
                        label.string = "获取验证码";
                    } else {
                        label.string = count + "s";
                    }
                }, 1, count);
            }
        });
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

    /**
     * 更新记录内容
     * @param cotnent 
     * @param timeStr 
     * @param typeStr 
     * @param moneyStr 
     * @param statusStr 
     */
    updateLogContent(cotnent: cc.Node, timeStr, typeStr, moneyStr, statusStr) {
        let timeLabel = cotnent.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = cotnent.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = cotnent.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = "￥" + moneyStr;
        let statusLabel = cotnent.getChildByName("StatusLabel").getComponent(cc.Label);
        statusLabel.string = statusStr;
    }

    /**
     * 添加记录
     */
    addLogContent(timeStr, typeStr, moneyStr, statusStr) {
        // this.logContentContainer.removeAllChildren();
        let node = cc.instantiate(this.logContentItem);
        node.active = true;
        node.x = 0;
        node.y = 0;
        // this.updateLogContent(node, "");
        this.logContentContainer.addChild(node);
    }

    /**
     * 更新标题
     * @param timeStr 
     * @param typeStr 
     * @param moneyStr 
     */
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
            for (let index = 0; index < 10; index++) {
                // this.addLogContent();
            }
        } else if (event.target.name === "convert") {
            this.convertNode.active = true;
        } else if (event.target.name === "convertLog") {
            this.convertLogTitleUpdate();
            this.logNode.active = true;
        }
    }

    // update (dt) {}
}
