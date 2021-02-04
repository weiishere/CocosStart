import ViewComponent from '../Base/ViewComponent';
import { HttpUtil } from '../Util/HttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import { ResponseCode } from '../GameConst/ResponseCode';
import { GateProxy } from '../Proxy/GateProxy';
import { DateUtil } from '../Util/DateUtil';
import { getUserOrderInfo } from './bonus/MyBonus';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiveAwayPanel extends ViewComponent {

    @property(cc.Node)
    giveAwayInfo: cc.Node = null;
    @property(cc.Node)
    logNode: cc.Node = null;
    @property(cc.Node)
    logContentItem: cc.Node = null;
    @property(cc.Node)
    logContentContainer: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    giveAwayBtn: cc.Node = null;
    @property(cc.EditBox)
    toUserNameEditBox: cc.EditBox = null;
    @property(cc.EditBox)
    goldEditBox: cc.EditBox = null;
    @property(cc.Label)
    giveAwayUserInfo: cc.Label = null;
    @property(cc.Node)
    giveAwayUserHead: cc.Node = null;

    protected bindUI(): void {
        this.updateGoldEditBoxPlaceholder();
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.giveAwayBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.giveAway();
        });

        this.toUserNameEditBox.node.on('editing-did-ended', (event) => {
            this.giveAwayUserInfo.node.color = new cc.Color(215, 215, 215);
            this.giveAwayUserHead.active = false;
            if (event.string.length === 7) {
                getUserOrderInfo(event.string, (res) => {
                    if (res.code === 200) {
                        this.giveAwayUserInfo.string = res.data.nickName;
                        cc.loader.load(res.data.headUrl, (error, item) => {
                            if (error) {
                                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家头像获取失败' }, '');
                            } else {
                                this.giveAwayUserHead.active = true;
                                this.giveAwayUserHead.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item)
                            }
                        });
                    } else {

                        this.giveAwayUserInfo.string = '无此玩家，请检查';
                        this.giveAwayUserInfo.node.color = new cc.Color(255, 0, 0);
                    }
                });
            } else {
                this.giveAwayUserInfo.string = '---';
            }
        });
    }

    private getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    private getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    private getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    private updateGoldEditBoxPlaceholder() {
        // this.goldEditBox.placeholder = "可赠送金币 " + this.getLocalCacheDataProxy().getLoginData().gold.toFixed(0);
    }

    private giveAway() {
        let toUserName = this.toUserNameEditBox.string;
        let gold = this.goldEditBox.string;

        if (!toUserName || toUserName.length === 0) {
            this.getGateProxy().toast("赠送账号不能空");
            return;
        }

        if (!gold || gold.length === 0 || parseFloat(gold) === 0) {
            this.getGateProxy().toast("赠送金币必须大于0");
            return;
        }

        let token = this.getLocalCacheDataProxy().getUserToken();
        let url = this.getConfigProxy().facadeUrl + "exchange/giveAway";
        let param = {
            tu: toUserName,
            gold: parseFloat(gold),
        }
        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                // this.toUserNameEditBox.string = "";
                // this.goldEditBox.string = "";

                this.updateGoldEditBoxPlaceholder();
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '赠送成功', toastOverlay: true }, '');
            } else {
                let errorCode = response.bd;
                let msg = "";
                if (errorCode === ResponseCode.GAME_NOT_DOWN_SCORE) {
                    msg = "玩家还在游戏中，不能赠送分数";
                } else if (errorCode === ResponseCode.USER_NOT_EXIST) {
                    msg = "账号不存在";
                } else if (errorCode === ResponseCode.USER_DISABLE) {
                    msg = "账号被禁用";
                } else if (errorCode === ResponseCode.GOLD_LACK) {
                    msg = "金币不足";
                }
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '赠送失败', toastOverlay: true }, '');
        }, HttpUtil.METHOD_POST, param);
    }

    private getGiveAwayLogs() {
        let url = this.getConfigProxy().facadeUrl + "exchange/getGiveAwayLog";

        let param = {
        }

        this.logContentContainer.removeAllChildren();
        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                this.loadGiveAwayLog(response.bd);
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '获取赠送记录失败', toastOverlay: true }, '');
        }, HttpUtil.METHOD_POST, param);
    }

    private loadGiveAwayLog(datas: any) {
        let userName = this.getLocalCacheDataProxy().getLoginData().userName;
        for (let index = 0; index < datas.length; index++) {
            const logsData = datas[index];

            let date = new Date(parseInt(logsData.createTime));

            let node = cc.instantiate(this.logContentItem);
            node.active = true;
            node.x = 0;
            node.y = 0;
            let statusStr = "";
            let giveAwayScore = logsData.giveAwayScore;
            let giveAwayName = "";
            statusStr = "成功";
            if (logsData.userName === userName) {
                giveAwayScore = -giveAwayScore;
                giveAwayName = logsData.toUserName;
            } else {
                giveAwayName = logsData.userName;
            }
            this.updateLogContent(node, DateUtil.dateFormat(DateUtil.DATE_FORMAT, date), giveAwayName, giveAwayScore, statusStr);
            this.logContentContainer.addChild(node);
        }
    }

    private

    // onLoad () {}

    start() {

    }

    hideNode() {
        this.giveAwayInfo.active = false;
        this.logNode.active = false;
    }

    updateLogContent(cotnent: cc.Node, timeStr, userStr, moneyStr, statusStr) {
        let timeLabel = cotnent.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = cotnent.getChildByName("UserLabel").getComponent(cc.Label);
        // typeLabel.string = userStr;
        let moneyLabel = cotnent.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;

        if (moneyStr >= 0) {
            typeLabel.string = userStr + " 赠送给我";
            let color = cc.color().fromHEX("#FF0000")
            moneyLabel.node.color = color;
        } else {
            typeLabel.string = "赠送给 " + userStr;
            let color = cc.color().fromHEX("#008567")
            moneyLabel.node.color = color;
        }

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
        let typeLabel = node.getChildByName("UserLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = node.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;
        // let StatusLabel = node.getChildByName("StatusLabel").getComponent(cc.Label);
    }

    menuClick(event) {
        this.hideNode();
        if (event.target.name === "giveAway") {
            this.giveAwayInfo.active = true;
        } else if (event.target.name === "giveAwayLog") {
            this.logNode.active = true;
            this.getGiveAwayLogs();
        }
    }

    // update (dt) {}
}
