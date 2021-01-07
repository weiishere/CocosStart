import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "./BaseMediator";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { LoginResponseRepository } from "../repositories/LoginResponseRepository";
import { GatePanelView } from "../View/GatePanelView";

export class GatePanelMediator extends BaseMediator {
    //private readonly gatePanelView: GatePanelView = null;
    //private component: cc.Component;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);

        //this.viewNode = viewComponent as cc.Node;
        // if (!viewNode) {
        //     return;
        // }
    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitGatePanel
        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {
            case CommandDefine.InitGatePanel:
            {
                this.viewComponent = (this.viewComponent as cc.Node).addComponent(GatePanelView) as cc.Component;
                break;
            }
        }
    }
}