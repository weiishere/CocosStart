import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "./BaseMediator";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";
import { GatePanelView } from '../Component/GatePanelView';
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateRepository } from "../repositories/GateRepository"
import { GateProxy } from "../Proxy/GateProxy"
import { GateEventDefine } from '../GameConst/Event/GateEventDefine';
import { AudioSourceDefine } from '../MahjongConst/AudioSourceDefine';
import { AudioNotificationTypeDefine } from '../MahjongConst/AudioNotificationTypeDefine';
import { MusicManager } from '../Other/MusicManager';
import { UserGold } from '../GameData/UserGold';
import { WebSockerProxy } from '../Proxy/WebSocketProxy';
import MyCenter from '../Component/MyCenter';
import RecordDetailList from "../Component/RecordDetailList";
import NoticeAlert from "../Component/NoticeAlert";

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;
    private scrollMsgNode: cc.Node;
    private gatePanelView: GatePanelView;
    private toastActive = false;
    private gateProxy: GateProxy;
    private gameStartPanel: cc.Node;
    private settingPrefab: cc.Node;

    private userHeaderScript;
    private loadingPanel: cc.Node = null;
    private musicManager: MusicManager;

    /** 兑换窗口 */
    private exchangePanelNode: cc.Node;
    /** 个人中心窗口 */
    private myCenterNode: cc.Node;
    private shareNode: cc.Node;
    /** 赠送窗口 */
    private giveAwatPanelNode: cc.Node;

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.musicManager = new MusicManager();
    }

    public getWebSockerProxy(): WebSockerProxy {
        return <WebSockerProxy>this.facade.retrieveProxy(ProxyDefine.WebSocket);
    }

    protected prefabSource(): string {
        return PrefabDefine.GatePanel;
    }

    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [
            PrefabDefine.ToastPanel,
            PrefabDefine.NoticeAlert,
            PrefabDefine.PromptWindow,
            PrefabDefine.ScrollMsgNode,
            PrefabDefine.UserInfoPanel,
            PrefabDefine.GameStartPanel,
            PrefabDefine.Setting,
            PrefabDefine.ExchangePanel,
            PrefabDefine.RecordPanel,
            PrefabDefine.RecordDetailList,
            PrefabDefine.MyCenter,
            PrefabDefine.ShareAlert,
            PrefabDefine.GiveAwayPanel,
            PrefabDefine.BonusIndex,
            PrefabDefine.DymjRecordItem,
            PrefabDefine.XzddRecordItem,
            PrefabDefine.TuiTongZiRecordItem,
            PrefabDefine.DymjRecordDetail,
            PrefabDefine.XdzzRecordDetail,
        ];
    }

    protected initSucceed(): void {
        this.listenerEvent();
        this.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.LoadConfig);
    }

    /** 事件监听方法 */
    private listenerEvent(): void {
        // 应用被唤醒方法
        cc.game.on(cc.game.EVENT_SHOW, () => {
            // 主界面没有接就不处理了
            if (!this.gameStartPanel) {
                return;
            }

            let isReconnect = this.getWebSockerProxy().reconnect();
            // 是否重连过ws了
            if (isReconnect) {

            }
        });

        // 监听登录按钮请求方法
        this.viewComponent.on(GateEventDefine.LOGIN_BTN_EVENT, this.onLoginBtnEvent.bind(this));
        // 监听验证码按钮请求事件
        this.viewComponent.on(GateEventDefine.GET_VERIFY_CODE, this.onGetVerifyCodeEvent.bind(this));
    }

    private onLoginBtnEvent(event: cc.Event.EventCustom): void {
        // 停止冒泡
        event.stopPropagation();

        event.getUserData()

        // 注册或者登录
        this.sendNotification(CommandDefine.GateCommand, event.getUserData(), NotificationTypeDefine.UserLoginOrRegister);
    }

    private onGetVerifyCodeEvent(event: cc.Event.EventCustom): void {
        // 停止冒泡
        event.stopPropagation();
        this.sendNotification(CommandDefine.GateCommand, event.getUserData(), NotificationTypeDefine.GetVerifyCode);
    }

    /**
     * 打开设置
     */
    private openSetting(body: any): void {
        let isShowChangeUserBtn = false;
        if (body) {
            isShowChangeUserBtn = body.isShowChangeUserBtn;
        }
        let settingSource = cc.loader.getRes(PrefabDefine.Setting, cc.Prefab);
        this.settingPrefab = cc.instantiate(settingSource);

        // cc.find('Canvas').addChild(this.settingPrefab);
        this.viewComponent.addChild(this.settingPrefab);

        let settingScript = this.settingPrefab.getComponent("Setting");
        settingScript.init(this.musicManager.isPauseMusic, this.musicManager.isPauseEffect, isShowChangeUserBtn, this.getConfigProxy().version);
    }

    private musciHandle(notification: INotification): void {
        switch (notification.getType()) {
            case AudioNotificationTypeDefine.PlayAudio:
                this.musicManager.playMusic(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PlayEffect:
                this.musicManager.playEffect(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PauseAudio:
                this.musicManager.updatePauseMusic(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PauseEffect:
                this.musicManager.updatePauseEffect(notification.getBody());
                break;
        }
    }

    /** 打开兑换 */
    private openExchangePanel() {
        let exchangePanelResource = cc.loader.getRes(PrefabDefine.ExchangePanel, cc.Prefab);
        this.exchangePanelNode = cc.instantiate(exchangePanelResource);

        this.viewComponent.addChild(this.exchangePanelNode);
    }

    /** 打开战绩 */
    private openRecordPanel() {
        let recordPanelResource = cc.loader.getRes(PrefabDefine.RecordPanel, cc.Prefab);
        let recordPanelPrefab = cc.instantiate(recordPanelResource);

        this.gameStartPanel.addChild(recordPanelPrefab);
    }

    /** 打开战绩详情 */
    private openRecordDetailList(roomRoundNo) {
        let recordDetailListResource = cc.loader.getRes(PrefabDefine.RecordDetailList, cc.Prefab);
        let recordDetailListPrefab = cc.instantiate(recordDetailListResource);
        this.viewComponent.addChild(recordDetailListPrefab);

        let script = <RecordDetailList>recordDetailListPrefab.getComponent("RecordDetailList");
        script.loadData(roomRoundNo);
    }

    /** 打开个人中心 */
    private openMyCenter() {
        let myCenterResource = cc.loader.getRes(PrefabDefine.MyCenter, cc.Prefab);
        this.myCenterNode = cc.instantiate(myCenterResource);
        this.viewComponent.addChild(this.myCenterNode);

        let script = <MyCenter>this.myCenterNode.getComponent("MyCenter");

        let localCache = this.getLocalCacheDataProxy();
        script.loadData(localCache.getLoginData(), localCache.getInviteCode());
    }

    private openShare() {
        let shareResource = cc.loader.getRes(PrefabDefine.ShareAlert, cc.Prefab);
        this.shareNode = cc.instantiate(shareResource);
        this.viewComponent.addChild(this.shareNode);

        let script = this.shareNode.getComponent("ShareAlert");

        let localCache = this.getLocalCacheDataProxy();
        script.loadData(localCache.getInviteCode(), this.getConfigProxy().shareUrl);
    }

    /** 打开赠送界面 */
    private openGiveAwayPanel() {
        let giveAwatPanelResource = cc.loader.getRes(PrefabDefine.GiveAwayPanel, cc.Prefab);
        this.giveAwatPanelNode = cc.instantiate(giveAwatPanelResource);
        this.viewComponent.addChild(this.giveAwatPanelNode);

        let script = <MyCenter>this.giveAwatPanelNode.getComponent("GiveAwayPanel");
    }

    private openUpdatePromptAlert(downloadUrl: any) {
        let updatePromptAlertSource = cc.loader.getRes(PrefabDefine.UpdatePromptAlert, cc.Prefab);
        if (!updatePromptAlertSource) {
            cc.loader.loadRes(PrefabDefine.UpdatePromptAlert, cc.Prefab, (error, resources) => {
                let updatePromptAlertNode = cc.instantiate(resources);
                this.viewComponent.addChild(updatePromptAlertNode);

                let script = updatePromptAlertNode.getComponent("UpdatePromptAlert");
                script.init(downloadUrl);
            });
        } else {
            let updatePromptAlertNode = cc.instantiate(updatePromptAlertSource);
            this.viewComponent.addChild(updatePromptAlertNode);

            let script = updatePromptAlertNode.getComponent("UpdatePromptAlert");
            script.init(downloadUrl);
        }
    }

    /** 切换账号 */
    private changeUserHandle() {
        // 暂停音乐
        this.musicManager.updatePauseMusic(true, false);
        if (this.gameStartPanel.isValid) {
            this.gameStartPanel.destroy();
        }

        if (!this._loginView) {
            this.sendNotification(CommandDefine.OpenLoginPanel);
        }

        this.getWebSockerProxy().disconnect();
        this.gameStartPanel = null;

        if (this.exchangePanelNode && this.exchangePanelNode.isValid) {
            this.exchangePanelNode.destroy();
        }

        if (this.myCenterNode && this.myCenterNode.isValid) {
            this.myCenterNode.destroy();
        }

        if (this.settingPrefab && this.settingPrefab.isValid) {
            this.settingPrefab.destroy();
        }
    }


    /**
     * 开始登录验证码倒计时
     */
    public startLoginVerifyCountdown() {
        if (this._loginView) {
            let script = this._loginView.getComponent("LoginPanel");
            script.startVerifyCountdown();
        }
    }

    private _loginView: cc.Node;
    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitGatePanel,
            CommandDefine.OpenLoginPanel,
            CommandDefine.OpenToast,
            CommandDefine.OpenDeskList,
            CommandDefine.InitGateMainPanel,
            CommandDefine.CloseLoginPanel,
            CommandDefine.OpenSetting,
            CommandDefine.AudioCommand,
            CommandDefine.UpdatePlayerGold,
            CommandDefine.UpdateNickname,
            CommandDefine.UpdateHead,
            CommandDefine.OpenExchangePanel,
            CommandDefine.ChangeUser,
            CommandDefine.ForcedOffline,
            CommandDefine.OpenRecordPanel,
            CommandDefine.OpenRecordDetailList,
            CommandDefine.OpenMyCenter,
            CommandDefine.OpenShare,
            CommandDefine.OpenGiveAwayPanel,
            CommandDefine.OpenLoadingPanel,
            CommandDefine.CloseLoadingPanel,
            CommandDefine.OpenBonusIndex,
            CommandDefine.OpenUpdatePromptAlert,
            CommandDefine.closeLoginPanel,
            CommandDefine.OpenNoticeAlert
        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {
            case CommandDefine.InitGatePanel:
                this.init();
                break;
            case CommandDefine.UpdatePlayerGold:
                let userGold: UserGold = notification.getBody();
                this.userHeaderScript.updateGold(userGold.newGold);
                break;
            case CommandDefine.UpdateNickname:
                let nickname = notification.getBody();
                this.userHeaderScript.updateNickname(nickname);
                break;
            case CommandDefine.UpdateHead:
                let head = notification.getBody();
                this.userHeaderScript.updateHead(head);
                break;
            case CommandDefine.AudioCommand:
                this.musciHandle(notification);
                break;
            case CommandDefine.OpenUpdatePromptAlert:
                this.openUpdatePromptAlert(notification.getBody());
                break;
            case CommandDefine.OpenLoginPanel:
                // 登录打开了就不在处理了
                if (this._loginView) {
                    return;
                }
                this.gatePanelView = this.view.getComponent('GatePanelView');
                this._loginView = cc.instantiate(this.gatePanelView.LoginView);
                this.viewComponent.addChild(this._loginView);
                const res = cc.loader.getRes(PrefabDefine.ScrollMsgNode, cc.Prefab);
                this.scrollMsgNode = cc.instantiate(res) as cc.Node;
                this.viewComponent.addChild(this.scrollMsgNode);
                this.scrollMsgNode.setPosition(cc.v2(0, -340));
                //_scrollMsgNode.parent = cc.find("Canvas");
                this.scrollMsgNode.getComponent('ScrollMsgNode').createContent('抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当，适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活', 1000);
                break;
            case CommandDefine.CloseLoginPanel:
                //删除登录框、主app名 
                if (this._loginView) {
                    this.viewComponent.removeChild(this._loginView);
                    this.viewComponent.removeChild(this.scrollMsgNode);
                    this._loginView = null;
                }
                break;
            case CommandDefine.OpenToast:
                const { toastOverlay, content } = notification.getBody();
                if (this.toastActive && !toastOverlay) {
                    return;
                }
                this.toastActive = true;

                let toastPrefab = cc.loader.getRes(PrefabDefine.ToastPanel, cc.Prefab);
                const _toastPrefab = cc.instantiate(toastPrefab);
                this.viewComponent.addChild(_toastPrefab);
                const script = (_toastPrefab as cc.Node).getComponent('Toast');
                script.show(content, () => this.toastActive = false);
                break;
            case CommandDefine.OpenNoticeAlert:
                const noticeContent = notification.getBody().content;
                const closeCallback = notification.getBody().callback;
                const noticeAlertPrefab: cc.Node = cc.instantiate(cc.loader.getRes(PrefabDefine.NoticeAlert, cc.Prefab));
                this.viewComponent.addChild(noticeAlertPrefab);
                (noticeAlertPrefab.getComponent('NoticeAlert') as NoticeAlert).show(noticeContent, closeCallback);
                break;
            case CommandDefine.OpenSetting:
                this.openSetting(notification.getBody());
                break;
            case CommandDefine.OpenExchangePanel:
                this.openExchangePanel();
                break;
            case CommandDefine.OpenRecordPanel:
                this.openRecordPanel();
                break;
            case CommandDefine.OpenRecordDetailList:
                this.openRecordDetailList(notification.getBody());
                break;
            case CommandDefine.OpenMyCenter:
                this.openMyCenter();
                break;
            case CommandDefine.OpenShare:
                this.openShare();
                break;
            case CommandDefine.OpenGiveAwayPanel:
                this.openGiveAwayPanel();
                break;
            case CommandDefine.ChangeUser:
            case CommandDefine.ForcedOffline:
                this.changeUserHandle();
                break;
            case CommandDefine.InitGateMainPanel:
                if (this.gameStartPanel) {
                    return;
                }
                const userInfoPanel = cc.loader.getRes(PrefabDefine.UserInfoPanel, cc.Prefab);
                const { loginData } = notification.getBody();

                this.musicManager.playMusic(AudioSourceDefine.BackMusic);
                this.sendNotification(CommandDefine.OpenToast, { content: "欢迎回来" });

                let gameStartResource = cc.loader.getRes(PrefabDefine.GameStartPanel, cc.Prefab);
                this.gameStartPanel = cc.instantiate(gameStartResource);
                this.viewComponent.addChild(this.gameStartPanel);

                const _userInfoPanel = cc.instantiate(userInfoPanel) as cc.Node;
                this.gameStartPanel.addChild(_userInfoPanel);
                // _userInfoPanel.parent = cc.find("Canvas");
                this.userHeaderScript = (_userInfoPanel as cc.Node).getComponent('UserHeader');
                this.userHeaderScript.showAcount(loginData);

                this.scrollMsgNode = cc.instantiate(cc.loader.getRes(PrefabDefine.ScrollMsgNode, cc.Prefab)) as cc.Node;
                this.gameStartPanel.addChild(this.scrollMsgNode);
                this.scrollMsgNode.setPosition(cc.v2(30, 233));
                this.scrollMsgNode.getComponent('ScrollMsgNode').createContent('系统公告：' + this.getConfigProxy().leessang, 300);
                //this.scrollMsgNode.getComponent('ScrollMsgNode').createContent('抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当，适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活', 300);

                if (!cc.sys.localStorage.getItem('today') || (cc.sys.localStorage.getItem('today') !== ((new Date()).getDate() + ''))) {
                    this.sendNotification(CommandDefine.OpenNoticeAlert, {
                        content: this.getConfigProxy().leessang, callback: () => {
                            cc.sys.localStorage.setItem("today", (new Date()).getDate());
                        }
                    });
                }
                break;
            case CommandDefine.OpenLoadingPanel:
                this.loadingPanel = new cc.Node('Loading');
                const label = this.loadingPanel.addComponent(cc.Label);
                label.string = "Loading";
                cc.find("Canvas").addChild(this.loadingPanel);
                break;
            case CommandDefine.CloseLoadingPanel:
                if (this.loadingPanel && this.loadingPanel.isValid) {
                    this.loadingPanel.destroy();
                }
                break;
            case CommandDefine.OpenBonusIndex:
                const bonusIndex = cc.loader.getRes(PrefabDefine.BonusIndex);
                this.viewComponent.addChild(cc.instantiate(bonusIndex))
                break;
            case CommandDefine.closeLoginPanel:
                cc.find('Canvas/phoneLoginAlert').destroy();
                break;
        }
    }
}