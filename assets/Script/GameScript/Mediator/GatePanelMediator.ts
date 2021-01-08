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

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;

    private gatePanelViewComponent: GatePanelView;

    private gateProxy: GateProxy;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        // this.gateProxy = Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy;
        // this.createPrefab(PrefabDefine.GatePanel).then((prefab) => {
        //     this.viewComponent.addChild(prefab);
        //     const scriptComp: GatePanelView = (prefab as cc.Component).getComponent('GatePanelView');
        //     if (this.gateProxy.checkLogin()) {
        //         this.viewComponent.addChild(cc.instantiate(scriptComp.AccountPanel));
        //         //this.viewComponent.addChild(cc.instantiate(scriptComp.GameList));
        //     } else {
        //         this.viewComponent.addChild(cc.instantiate(scriptComp.LoginView));
        //     }
        // })
    }

    protected prefabSource(): string {
        return PrefabDefine.GatePanel;
    }

    protected initSucceed(): void {
        this.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
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