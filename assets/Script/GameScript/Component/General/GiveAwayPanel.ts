import ViewComponent from '../../Base/ViewComponent';
import { HttpUtil } from '../../Util/HttpUtil';
import Facade from '../../../Framework/care/Facade';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { LoginAfterHttpUtil } from '../../Util/LoginAfterHttpUtil';
import { ResponseCode } from '../../GameConst/ResponseCode';
import { GateProxy } from '../../Proxy/GateProxy';
import { DateUtil } from '../../Util/DateUtil';
import { getUserOrderInfo } from '../bonus/MyBonus';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiveAwayPanel extends ViewComponent {

    @property(cc.Node)
    giveAwayInfo: cc.Node = null;
    @property(cc.Node)
    logNode: cc.Node = null;
    @property(cc.ScrollView)
    logScrollView: cc.ScrollView = null;
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
    @property(cc.Label)
    tipsLabel: cc.Label = null;
    @property(cc.Node)
    backPage: cc.Node = null;
    @property(cc.Node)
    nextPage: cc.Node = null;

    _totalPage: number = -1;
    _pageIndex: number = 0;
    _pageSize: number = 20;
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

        this.backPage.on(cc.Node.EventType.TOUCH_END, () => {
            if (this._pageIndex <= 1) {
                this.sendToast("已经是第一页了");
                return;
            }
            this._pageIndex--;
            this.getGiveAwayLogs();
        });

        this.nextPage.on(cc.Node.EventType.TOUCH_END, () => {
            if (this._totalPage >= 0 && this._pageIndex >= this._totalPage) {
                this.sendToast("已经是最后一页了");
                return;
            }
            this._pageIndex++;
            this.getGiveAwayLogs();
        });

        this.toUserNameEditBox.node.on('editing-did-ended', (event) => {
            this.giveAwayUserInfo.node.color = new cc.Color(215, 215, 215);
            this.giveAwayUserHead.active = false;
            if (event.string.length === 7) {
                let param = {
                    userName: event.string,
                }
                let url = this.getConfigProxy().facadeUrl + "user/getUserInfo"
                LoginAfterHttpUtil.send(url, (res) => {
                    if (res.hd === "success") {
                        this.giveAwayUserInfo.string = res.bd.nickname;
                        this.giveAwayUserHead.active = true;
                        SpriteLoadUtil.loadSprite(this.giveAwayUserHead.getComponent(cc.Sprite), res.bd.head);
                    } else {
                        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家头像获取失败' }, '');
                    }
                }, (error) => {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家头像获取失败' }, '');
                }, HttpUtil.METHOD_POST, param)
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

    private sendToast(msg: string) {
        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: msg, toastOverlay: true }, '');
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
        this.logScrollView.scrollToTop(0.01);
        let url = this.getConfigProxy().facadeUrl + "exchange/getGiveAwayLog";

        let param = {
            pageIndex: this._pageIndex,
            pageSize: this._pageSize
        }

        this.logContentContainer.removeAllChildren();
        LoginAfterHttpUtil.send(url, (response) => {
            if (response.hd === "success") {
                this.loadGiveAwayLog(response.bd);
            } else {
                this.tipsLabel.string = "获取赠送记录失败";
            }
        }, (err) => {
            this.tipsLabel.string = "获取赠送记录失败";
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '获取赠送记录失败', toastOverlay: true }, '');
        }, HttpUtil.METHOD_POST, param);
    }

    private loadGiveAwayLog(result: any) {
        this._totalPage = result.totalPages;
        let datas = result.data;
        if (datas.length === 0) {
            this.tipsLabel.string = "没有赠送记录";
            return;
        }
        let userName = this.getLocalCacheDataProxy().getLoginData().userName;
        for (let index = 0; index < datas.length; index++) {
            const logsData = datas[index];

            let date = new Date(parseInt(logsData.createTime));

            let node = cc.instantiate(this.logContentItem);
            node.active = true;
            // node.x = 0;
            // node.y = 0;
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
            let color = cc.color().fromHEX("#FFFFFF")
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
            this.tipsLabel.string = "";
            this.logNode.active = true;
            this._pageIndex = 1;
            this.getGiveAwayLogs();
        }
    }

    // update (dt) {}
}
