import ViewComponent from '../Base/ViewComponent';
import { HttpUtil } from '../Util/HttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import { GateProxy } from '../Proxy/GateProxy';

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
    @property(cc.Node)
    pageNextBtn: cc.Node = null;
    @property(cc.Node)
    pageUpBtn: cc.Node = null;
    @property(cc.Label)
    tipsLabel: cc.Label = null;

    @property(cc.Node)
    ConvertBtn: cc.Node = null;
    @property(cc.Node)
    rechargeValue: cc.Node = null;


    /** 查询的url */
    findUrl: string = "";
    pageIndex: number = 1;
    isLastPage: boolean = false;
    pageSize: number = 10;

    protected bindUI(): void {
        this.goldBuyList.removeAllChildren();
        this.getRechargeValues();
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.verifyClick();

        this.pageNextBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isLastPage) {
                return;
            }

            this.pageIndex++;
            this.findLog(this.pageIndex);
        });

        this.pageUpBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.pageIndex--;
            if (this.pageIndex < 1) {
                this.pageIndex = 1;
                return;
            }
            this.isLastPage = false;
            this.findLog(this.pageIndex);
        });

        this.ConvertBtn.on(cc.Node.EventType.TOUCH_END, () => {
            let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
            const getEditBox = (nodeName): cc.Node => this.node.getChildByName("ConvertNode").getChildByName(nodeName).getChildByName("EditBox");
            const alipayAccount = getEditBox('BankName').getComponent(cc.EditBox).string;
            const alipayName = getEditBox('AccountName').getComponent(cc.EditBox).string;
            let gold = getEditBox('ConvertMoney').getComponent(cc.EditBox).string || 0;
            if (!alipayAccount || !alipayName || !+gold) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '您输入的提现信息有误，请修改！', toastOverlay: true }, '');
                return;
            }
            if (localCacheDataProxy.getLoginData().gold < +gold) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '您的余额不足！', toastOverlay: true }, '');
                return;
            }
            let configProxy: ConfigProxy = <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
            let token = localCacheDataProxy.getUserToken();
            let url = configProxy.facadeUrl + "exchange/alipayGiveOut";
            let param = {
                alipayAccount: alipayAccount,
                alipayName: alipayName,
                gold: gold
            }
            LoginAfterHttpUtil.send(url, (response) => {
                if (response.hd === "success") {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '兑换成功', toastOverlay: true }, '');
                } else {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '对不起，兑换失败', toastOverlay: true }, '');
                }
            }, (err) => {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '参数异常：' + err, toastOverlay: true }, '');
            }, HttpUtil.METHOD_POST, param);
        });
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
                // 跳转页面
                cc.sys.openURL(response.bd);
                // Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '充值成功', toastOverlay: true }, '');
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
        this.tipsLabel.node.active = false;
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
        let node = cc.instantiate(this.logContentItem);
        node.active = true;
        node.x = 0;
        node.y = 0;
        this.updateLogContent(node, timeStr, typeStr, moneyStr, statusStr);
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

    getConfirProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    updatePageBtn(active) {
        // this.pageNextBtn.active = active;
        // this.pageUpBtn.active = active;
    }

    /**
     * 查询充值记录
     * @param pageIndex 
     */
    findLog(pageIndex: number) {
        this.logContentContainer.removeAllChildren();
        let param = {
            pageSize: this.pageSize,
            pageIndex: pageIndex
        }

        let facadeUrl = this.getConfirProxy().facadeUrl;
        LoginAfterHttpUtil.send(facadeUrl + this.findUrl, (response) => {
            if (response.hd === "success") {
                let length = response.bd.content.length;
                if (length === 0) {
                    this.tipsLabel.node.active = true;
                    this.tipsLabel.string = "没有记录";
                    return;
                }
                this.updatePageBtn(true);
                if (length < this.pageSize) {
                    this.isLastPage = true;
                }

                for (const value of response.bd.content) {
                    let type = "支付宝";
                    if (value.serialType === 1) {
                        type = "银行卡转账"
                    }
                    this.addLogContent(value.createTime, type, Math.abs(value.amount), value.status === 1 ? "成功" : "失败");
                }
            } else {
                this.getGateProxy().toast("获取记录失败！");
                this.updatePageBtn(false);
            }
        }, (err) => {
            this.getGateProxy().toast("获取记录失败！");
            this.updatePageBtn(false);
        }, HttpUtil.METHOD_POST, param);
    }

    /**
     * 获得充值列表
     */
    getRechargeValues() {
        let param = {
        }
        let facadeUrl = this.getConfirProxy().facadeUrl;
        LoginAfterHttpUtil.send(facadeUrl + "/exchange/getRechargeValues", (response) => {
            if (response.hd === "success") {
                for (const value of response.bd) {
                    let rechargeNode = cc.instantiate(this.rechargeValue);
                    rechargeNode.x = 0;
                    rechargeNode.y = 0;
                    rechargeNode.active = true;
                    let label = rechargeNode.getChildByName("GoldLabel").getComponent(cc.Label);
                    label.string = value;

                    this.goldBuyList.addChild(rechargeNode);
                    rechargeNode.on(cc.Node.EventType.TOUCH_END, (event) => {
                        this.exchange(label.string);
                    });
                }
            } else {
                this.getGateProxy().toast("获得支付列表失败！");
            }
        }, (err) => {
            this.getGateProxy().toast("获得支付列表失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    menuClick(event) {
        this.hideNode();
        if (event.target.name === "goldBuyItem") {
            this.goldBuyList.active = true;
        } else if (event.target.name === "exchangeLogItem") {
            this.exchangeLogTitleUpdate();
            this.logNode.active = true;

            this.findUrl = "/exchange/exchangeLog";
            this.pageIndex = 1;
            this.isLastPage = false;
            this.findLog(this.pageIndex);
        } else if (event.target.name === "convert") {
            this.convertNode.active = true;
        } else if (event.target.name === "convertLog") {
            this.convertLogTitleUpdate();
            this.logNode.active = true;

            this.findUrl = "/exchange/withdrawalLog";
            this.pageIndex = 1;
            this.isLastPage = false;
            this.findLog(this.pageIndex);
        }
    }

    // update (dt) {}
}
