import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import ViewComponent from "../Base/ViewComponent";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateRepository } from "../repositories/GateRepository"
import { GateProxy } from "../Proxy/GateProxy"

export default class BaseMediator extends Mediator {
    public view: ViewComponent = null;
    private gateProxy: GateProxy;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.gateProxy = Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy;
    }

    public listNotificationInterests(): string[] {
        return [

        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {

        }
    }

}