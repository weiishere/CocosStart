import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { LoginResponseRepository } from "../repositories/LoginResponseRepository";
import { LoginPanelView } from "../View/LoginPanelView";

export class HallPanelMediator extends Mediator {
    private readonly loginPanelView: LoginPanelView = null;

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.CheckLoginState,
            CommandDefine.OpenLoginPanel,
            CommandDefine.ShowHeaderPanel
        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {
            case CommandDefine.CheckLoginState:
                {
                    break;
                }
            case CommandDefine.OpenLoginPanel:
                {
                    break;
                }
            case CommandDefine.ShowHeaderPanel:
                {
                    break;
                }
        }
    }
}