import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "./BaseMediator";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"; PrefabDefine
import { LoginResponseRepository } from "../repositories/LoginResponseRepository";
import { GatePanelView } from "../Component/GatePanelView";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateRepository } from "../repositories/GateRepository"
import { GateProxy } from "../Proxy/GateProxy"

export class GatePanelMediator extends BaseMediator {
    //private gatePanelView: GatePanelView = null;
    //private component: cc.Component;

    private gateProxy: GateProxy;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.gateProxy = Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy;
        this.createPrefab(PrefabDefine.GatePanel).then((prefab) => {
            this.viewComponent.addChild(prefab);
            const scriptComp: GatePanelView = (prefab as cc.Component).getComponent('GatePanelView');
            if (this.gateProxy.checkLogin()) {
                this.viewComponent.addChild(cc.instantiate(scriptComp.AccountPanel));
                //this.viewComponent.addChild(cc.instantiate(scriptComp.GameList));
            } else {
                this.viewComponent.addChild(cc.instantiate(scriptComp.LoginView));
            }
        })
    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.OpenLoginPanel
        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {
            case CommandDefine.InitGatePanel:
                {
                    //(this.viewComponent as cc.Node).addComponent(GatePanelView);
                    // this.sendNotification(CommandDefine.GateCommand, {
                    //     callback: (islogin) => {
                    //         console.log(`是否登录:${islogin}`);
                    //         if (!islogin) {
                    //             //打开登录面板
                    //             this.sendNotification(CommandDefine.OpenLoginPanel)
                    //         }
                    //     }
                    // }, NotificationTypeDefine.CheckLogin);
                    break;
                }
            case CommandDefine.OpenLoginPanel:
                //const loginView = cc.instantiate(this.gatePanelView.LoginView);
                //this.gatePanelView.root.addChild(loginView);
                break
        }
    }
}