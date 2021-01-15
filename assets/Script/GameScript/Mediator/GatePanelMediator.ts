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

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;
    private scrollMsgNode: cc.Node;
    private gatePanelView: GatePanelView;
    private toastActive = false;
    private gateProxy: GateProxy;
    private gameStartPanel: cc.Node;

    private userHeaderScript;

    private musicManager: MusicManager;

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
            PrefabDefine.PromptWindow,
            PrefabDefine.ScrollMsgNode,
            PrefabDefine.UserInfoPanel,
            PrefabDefine.GameStartPanel,
            PrefabDefine.Setting,
            PrefabDefine.ExchangePanel,
        ];
    }

    protected initSucceed(): void {
        this.listenerEvent();
        this.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.LoadConfig);
    }

    /** 事件监听方法 */
    private listenerEvent(): void {
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
    private openSetting(): void {
        let settingSource = cc.loader.getRes(PrefabDefine.Setting, cc.Prefab);
        let settingPrefab = cc.instantiate(settingSource);

        this.gameStartPanel.addChild(settingPrefab);

        let settingScript = settingPrefab.getComponent("Setting");
        settingScript.init(this.musicManager.isPauseMusic, this.musicManager.isPauseEffect);
    }

    private musciHandle(notification: INotification): void {
        switch (notification.getType()) {
            case AudioNotificationTypeDefine.PlayAudio:
                this.musicManager.playMusic(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PlayEffect:
                this.musicManager.playMusic(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PauseAudio:
                this.musicManager.updatePauseMusic(notification.getBody());
                break;
            case AudioNotificationTypeDefine.PauseEffect:
                this.musicManager.updatePauseEffect(notification.getBody());
                break;
        }
    }

    private openExchangePanel() {
        let exchangePanelResource = cc.loader.getRes(PrefabDefine.ExchangePanel, cc.Prefab);
        let exchangePanelPrefab = cc.instantiate(exchangePanelResource);

        this.viewComponent.addChild(exchangePanelPrefab);
    }

    private changeUserHandle() {
        // 暂停音乐
        this.musicManager.updatePauseMusic(true, false);
        this.gameStartPanel.destroy();

        this.sendNotification(CommandDefine.OpenLoginPanel);

        this.getWebSockerProxy().disconnect();
        this.gameStartPanel = null;
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
            CommandDefine.OpenExchangePanel,
            CommandDefine.ChangeUser,
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
            case CommandDefine.AudioCommand:
                this.musciHandle(notification);
                break;
            case CommandDefine.OpenLoginPanel:
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

            case CommandDefine.OpenSetting:
                this.openSetting();
                break;
            case CommandDefine.OpenExchangePanel:
                this.openExchangePanel();
                break;
            case CommandDefine.ChangeUser:
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
                this.scrollMsgNode.getComponent('ScrollMsgNode').createContent('抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当，适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活', 300);
                break;

        }
    }
}