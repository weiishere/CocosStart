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

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;

    private gatePanelViewComponent: GatePanelView;
    private toastActive = false;
    private gateProxy: GateProxy;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }

    protected prefabSource(): string {
        return PrefabDefine.GatePanel;
    }

    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [PrefabDefine.PromptWindow];
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

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitGatePanel,
            CommandDefine.OpenLoginPanel,
            CommandDefine.OpenToast,
            CommandDefine.OpenDeskList,
            CommandDefine.InitGateMainPanel,
            CommandDefine.CloseLoginPanel
        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {
            case CommandDefine.InitGatePanel:
                {
                    this.init();
                    break;
                }
            case CommandDefine.OpenLoginPanel:
                const scriptComp: GatePanelView = this.view.getComponent('GatePanelView');
                this.viewComponent.addChild(cc.instantiate(scriptComp.LoginView));
                break;
            case CommandDefine.CloseLoginPanel:
                
                const _scriptComp: GatePanelView = this.view.getComponent('GatePanelView');
                
                //_scriptComp.removePhoneLoginNode();
                //this.viewComponent.removeChild(_scriptComp)
                break;
            case CommandDefine.OpenToast:
                const { toastOverlay, content } = notification.getBody();
                if (this.toastActive && !toastOverlay) {
                    return;
                }
                this.toastActive = true;
                this.createPrefab(PrefabDefine.ToastPanel).then((toastPrefab) => {
                    const _toastPrefab = cc.instantiate(toastPrefab);
                    this.viewComponent.addChild(_toastPrefab);
                    const script = (_toastPrefab as cc.Node).getComponent('Toast');
                    script.show(content, () => this.toastActive = false);
                })
                break;

            case CommandDefine.InitGateMainPanel:
                this.createPrefab(PrefabDefine.UserInfoPanel).then((userInfoPanel) => {
                    const { loginData } = notification.getBody();
                    const _userInfoPanel = cc.instantiate(userInfoPanel);
                    this.viewComponent.addChild(_userInfoPanel);
                    _userInfoPanel.parent = cc.find("Canvas");
                    const script = (_userInfoPanel as cc.Node).getComponent('UserHeader');
                    script.showAcount(loginData)
                    // const script = (_toastPrefab as cc.Node).getComponent('Toast');
                    // script.show(content, () => this.toastActive = false);
                });
                this.createPrefab(PrefabDefine.ScrollMsgNode).then((scrollMsgNode) => {
                    //const { loginData } = notification.getBody();
                    const _scrollMsgNode = cc.instantiate(scrollMsgNode);
                    this.viewComponent.addChild(_scrollMsgNode);
                    _scrollMsgNode.parent = cc.find("Canvas");
                    const script = (_scrollMsgNode as cc.Node).getComponent('ScrollMsgNode');
                    script.createContent('sdadasdsadasdawewaeaweaweaweaweawe');
                    // const script = (_toastPrefab as cc.Node).getComponent('Toast');
                    // script.show(content, () => this.toastActive = false);
                })
                break;

        }
    }
}