import ViewComponent from '../../Base/ViewComponent';
import { HttpUtil } from '../../Util/HttpUtil';
import Facade from '../../../Framework/care/Facade';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { LoginAfterHttpUtil } from '../../Util/LoginAfterHttpUtil';
import { GateProxy } from '../../Proxy/GateProxy';
import { ServerCode } from '../../GameConst/ServerCode';
import md5 from '../../Util/MD5';

const { ccclass, property } = cc._decorator;

export type AccessInfo = {
    accessId: number,
    channelNo?: string,
    accessName: string,
    exchangeScore: number[],
}

@ccclass
export default class ExchangePanel extends ViewComponent {

    @property(cc.Sprite)
    bgSprite: cc.Sprite = null;
    @property(cc.Node)
    goldBuyContent: cc.Node = null;
    @property(cc.Node)
    goldBuyList: cc.Node = null;
    @property(cc.Node)
    exchangeAccessListNode: cc.Node = null;
    @property(cc.Node)
    exchangeAccessTmpplateNode: cc.Node = null;
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
    @property(cc.Node)
    vipExchange: cc.Node = null;
    @property(cc.SpriteAtlas)
    newFace: cc.SpriteAtlas = null;
    @property(cc.Node)
    retrievePwd: cc.Node = null;
    @property(cc.EditBox)
    exchangePwdEditBox: cc.EditBox = null;

    /** 查询的url */
    findUrl: string = "";
    pageIndex: number = 1;
    isLastPage: boolean = false;
    pageSize: number = 5;

    /** 通道列表 */
    accessList: AccessInfo[] = [];
    /** 当前选择的通道 */
    selectChannelNo: string;

    protected bindUI(): void {
        this.goldBuyList.removeAllChildren();
        // this.getRechargeValues();

        this.getAccessData();
        // this.testAccess();
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

        this.retrievePwd.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenSetExchangePwd, null, '');
        });

        this.ConvertBtn.on(cc.Node.EventType.TOUCH_END, () => {
            let localCacheDataProxy = <LocalCacheDataProxy><unknown>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
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

            const exchangePwd = this.exchangePwdEditBox.string.trim();
            if (exchangePwd === '') {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '请输入兑换密码！', toastOverlay: true }, '');
                return;
            }

            let configProxy: ConfigProxy = <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
            let token = localCacheDataProxy.getUserToken();
            let url = configProxy.facadeUrl + "exchange/alipayGiveOut";
            let param = {
                alipayAccount: alipayAccount,
                alipayName: alipayName,
                gold: gold,
                exchangePwd: md5(exchangePwd),
            }
            LoginAfterHttpUtil.send(url, (response) => {
                if (response.hd === "success") {
                    this.exchangePwdEditBox.string = "";
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '兑换已成功提交，预计30分钟内到账，请关注！', toastOverlay: true }, '');
                } else {
                    if (response.bd === ServerCode.PWD_ERROR) {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '密码错误！', toastOverlay: true }, '');
                    } else {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '对不起，兑换失败！', toastOverlay: true }, '');
                    }
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

        let url = configProxy.bonusUrl + "/api/v1/capital/add/recharge";
        let param = {
            userName: localCacheDataProxy.getLoginData().userName,
            amount: parseInt(gold),
            channelNo: this.selectChannelNo,
        }
        HttpUtil.send(url, (response) => {
            if (response.code === 200) {
                // 跳转页面
                cc.sys.openURL(response.data);
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: response.msg, toastOverlay: true }, '');
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
        this.goldBuyContent.active = false;
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
    updateLogContent(cotnent: cc.Node, flowNo, timeStr, typeStr, moneyStr, statusStr) {
        let flowNoLabel = cotnent.getChildByName("orderIdLabel").getComponent(cc.Label);
        flowNoLabel.string = flowNo;
        //cotnent.getChildByName("orderIdLabel").getComponent(cc.EditBox).string = flowNo;
        cotnent.getChildByName("orderIdLabel").getChildByName("copyBtn").on(cc.Node.EventType.TOUCH_END, (event) => {
            //console.log(flowNo);
            if (CC_JSB) {
                (<any>jsb).copyTextToClipboard(flowNo);
                this.getGateProxy().toast("流水/订单号复制成功");
            }
        });
        let timeLabel = cotnent.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = cotnent.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = cotnent.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = "￥" + moneyStr;
        let statusLabel = cotnent.getChildByName("StatusLabel").getComponent(cc.Label);
        statusLabel.string = statusStr;
        if (statusStr === '兑换失败') {
            statusLabel.node.color = new cc.Color(255, 0, 0);
        }
    }

    /**
     * 添加记录
     */
    addLogContent(flowNo, timeStr, typeStr, moneyStr, statusStr) {
        let node = cc.instantiate(this.logContentItem);
        node.active = true;
        node.x = 0;
        node.y = 0;
        this.updateLogContent(node, flowNo, timeStr, typeStr, moneyStr, statusStr);
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



    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
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

        let facadeUrl = this.getConfigProxy().facadeUrl;
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
                    let status = "";
                    let type = "支付宝";
                    if (value.serialType === 1) {
                        type = "银行卡转账"

                        if (value.status === 1) {
                            status = "已支付";
                        } else if (value.status === 0) {
                            status = "待支付";
                        }
                    } else {
                        if (value.status === 1) {
                            status = "已兑换";
                        } else if (value.status === 0) {
                            status = "待兑换";
                        } else if (value.status === -1) {
                            status = "兑换失败";
                        }
                    }
                    
                    type = value.channelName;

                    this.addLogContent(value.flowNo, value.createTime, type, Math.abs(value.amount), status);
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
        let facadeUrl = this.getConfigProxy().facadeUrl;
        LoginAfterHttpUtil.send(facadeUrl + "/exchange/getRechargeValues", (response) => {
            if (response.hd === "success") {
                this.loadGoldList(response.bd);
            } else {
                this.getGateProxy().toast("获得支付列表失败！");
            }
        }, (err) => {
            this.getGateProxy().toast("获得支付列表失败！");
        }, HttpUtil.METHOD_POST, param);
    }

    /**
     * 加载金币列表
     * @param goldArray 
     */
    loadGoldList(goldArray: any[]) {
        this.goldBuyList.removeAllChildren();
        for (const value of goldArray) {
            let rechargeNode = cc.instantiate(this.rechargeValue);
            rechargeNode.x = 0;
            rechargeNode.y = 0;
            rechargeNode.active = true;
            // if (value === 0) {
            //     this.goldBuyList.addChild(this.vipExchange);
            //     this.vipExchange.on(cc.Node.EventType.TOUCH_END, (event) => {
            //         //const rechargeServiceUrl = this.getConfigProxy();
            //         cc.sys.openURL(this.getConfigProxy().rechargeServiceUrl);
            //     });
            // } else {
            let label = rechargeNode.getChildByName("GoldLabel").getComponent(cc.Label);
            label.string = value;

            let goldIcon = rechargeNode.getChildByName("GoldIcon").getComponent(cc.Sprite);
            let spriteName = "zhuanshi-";
            if (value === 0) {
                spriteName += "6";
                label.string = "Vip充值";
            } else if (value < 50) {
                spriteName += "1";
            } else if (value >= 50 && value < 200) {
                spriteName += "2";
            } else if (value >= 200 && value < 500) {
                spriteName += "3";
            } else if (value >= 500 && value < 1000) {
                spriteName += "4";
            } else if (value >= 1000 && value < 2000) {
                spriteName += "5";
            } else {
                spriteName += "6";
            }

            spriteName = "m_glodSign";

            goldIcon.spriteFrame = this.newFace.getSpriteFrame(spriteName);
            this.goldBuyList.addChild(rechargeNode);
            rechargeNode.on(cc.Node.EventType.TOUCH_END, (event) => {
                // 金额是0，打开VIP通道
                if (value === 0) {
                    cc.sys.openURL(this.getConfigProxy().rechargeServiceUrl);
                } else {
                    this.exchange(label.string);
                }
            });
            // }
        }
    }

    menuClick(event) {
        this.hideNode();
        if (event.target.name === "goldBuyItem") {
            this.goldBuyContent.active = true;
        } else if (event.target.name === "exchangeLogItem") {
            this.exchangeLogTitleUpdate();
            this.logNode.active = true;

            this.findUrl = "/exchange/exchangeLog";
            this.pageIndex = 1;
            this.isLastPage = false;
            this.findLog(this.pageIndex);
        } else if (event.target.name === "convert") {
            this.convertNode.active = true;
            if (!this.getLocalCacheDataProxy().getIsSetExchangePwd()) {
                Facade.Instance.sendNotification(CommandDefine.OpenSetExchangePwd, null, '');
            }
        } else if (event.target.name === "convertLog") {
            this.convertLogTitleUpdate();
            this.logNode.active = true;

            this.findUrl = "/exchange/withdrawalLog";
            this.pageIndex = 1;
            this.isLastPage = false;
            this.findLog(this.pageIndex);
        }
    }

    /**
     * 加载通道
     * @param accessInfos 
     */
    loadExchangeAccess(accessInfos: AccessInfo[]) {
        this.exchangeAccessListNode.removeAllChildren();
        for (const access of accessInfos) {
            let node = cc.instantiate(this.exchangeAccessTmpplateNode);
            node.name = "access_" + access.channelNo;
            node.getChildByName("label").getComponent(cc.Label).string = access.accessName;

            this.exchangeAccessListNode.addChild(node);
        }

        if (this.exchangeAccessListNode.childrenCount > 0) {
            this.exchangeAccessListNode.children[0].getComponent(cc.Toggle).isChecked = true;

            let nodeName: string = this.exchangeAccessListNode.children[0].name;
            this.selectChannelNo = nodeName.split("_")[1];

            this.loadGoldList(accessInfos[0].exchangeScore);
        }
    }

    /**
     * 通道选择
     * @param event 
     */
    exchangeSelect(event) {
        let nodeName: string = event.node.name;

        this.selectChannelNo = nodeName.split("_")[1];

        let accessInfo = this.accessList.find(v => v.channelNo === this.selectChannelNo);
        this.loadGoldList(accessInfo.exchangeScore);
    }

    /**
     * 获取远程通道数据
     */
    getAccessData() {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        HttpUtil.send(bonusUrl + "/api/v1/list/payChannel", (response) => {
            if (response.code === 200) {
                this.setAccessList(response.data);
            } else {
                this.getGateProxy().toast("获得通道列表失败！");
            }
        }, (err) => {
            this.getGateProxy().toast("获得通道列表失败！");
        }, HttpUtil.METHOD_GET, []);
    }

    /**
     * 设置通道数据
     */
    setAccessList(datas: any[]) {
        let accessList = [];
        for (const data of datas) {
            let amountList: string = data.amountList;
            let values = amountList.substring(1, amountList.length - 1).split(",");
            let exchangeScore = [];
            values.forEach(v => exchangeScore.push(parseInt(v)))
            let accessInfo: AccessInfo = {
                accessId: data.id,
                channelNo: data.channelNo,
                accessName: data.channelName,
                exchangeScore: exchangeScore,
            }
            accessList.push(accessInfo);
        }

        this.accessList = accessList;
        this.loadExchangeAccess(accessList);
    }

    testAccess() {
        let accessList = [];

        let accessInfo: AccessInfo = {
            accessId: 1,
            accessName: "支付宝",
            exchangeScore: [10, 100, 200, 300],
        }
        accessList.push(accessInfo);

        accessInfo = {
            accessId: 2,
            accessName: "微信",
            exchangeScore: [10, 20, 50, 1000],
        }
        accessList.push(accessInfo);

        this.accessList = accessList;
        this.loadExchangeAccess(accessList);
    }

    // update (dt) {}
}
