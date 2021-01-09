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
                break
            case CommandDefine.OpenToast:
                if (this.toastActive && !notification.getBody().toastOverlay) {
                    return;
                }
                this.toastActive = true;
                this.createPrefab(PrefabDefine.ToastPanel).then((toastPrefab) => {
                    const _toastPrefab = cc.instantiate(toastPrefab);
                    this.viewComponent.addChild(_toastPrefab);
                    const script = (_toastPrefab as cc.Node).getComponent('Toast');
                    script.show(notification.getBody().content, () => {
                        this.toastActive = false;
                    });
                })
                break;
            case CommandDefine.OpenDeskList:
                this.createPrefab(PrefabDefine.DeskList).then((prefab) => {
                    this.viewComponent.addChild(prefab);

                    const script = prefab.getComponent("DeskList");
                    script.loadUserData(this.getLocalCacheDataProxy().getLoginData());
                });
                break;

        }
    }
}