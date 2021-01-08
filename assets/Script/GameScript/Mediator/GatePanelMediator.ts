import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "./BaseMediator";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";
import { LoginResponseRepository } from "../repositories/LoginResponseRepository";
import { GatePanelView } from '../Component/GatePanelView';
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateRepository } from "../repositories/GateRepository"
import { GateProxy } from "../Proxy/GateProxy"
import { GateEventDefine } from '../GameConst/Event/GateEventDefine';

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;

    private gatePanelViewComponent: GatePanelView;

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
        this.viewComponent.on(GateEventDefine.LOGIN_BTN_EVENT, this.onLoginBtnEvent);
    }

    private onLoginBtnEvent(): void {

    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitGatePanel,
            CommandDefine.OpenLoginPanel,
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
        }
    }
}