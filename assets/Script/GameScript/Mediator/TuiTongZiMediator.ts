import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "../Mediator/BaseMediator"
import { PrefabDefine as TuiTongZiPrefabDefine } from "../TuiTongZiConst/PrefabDefine";
import { CommandDefine as TuiTongZiCommandDefine } from "../TuiTongZiConst/CommandDefine";
import TTZDeskView from "../Component/TuiTongZi/TTZDeskView";

export class TuiTongZiMediator extends BaseMediator {
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.listenerEvent();
    }
    private listenerEvent() {

    }
    protected inAdvanceLoadFiles(): string[] {
        return [
            TuiTongZiPrefabDefine.TuiTongZiDesk
        ];
    }
    
    public listNotificationInterests(): string[] {
        return [
            TuiTongZiCommandDefine.OpenTTZDeskPanel
        ];
    }

    public async handleNotification(notification: INotification) {
        switch (notification.getName()) {
            case TuiTongZiCommandDefine.OpenTTZDeskPanel:
                const panel = cc.loader.getRes(TuiTongZiPrefabDefine.TuiTongZiDesk);
                debugger
                break;
        }
    }

}