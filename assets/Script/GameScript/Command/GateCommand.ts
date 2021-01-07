import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { NotificationDefine } from "../MahjongConst/NotificationDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";

export class GateCommand extends Command {
    public execute(notification: INotification): void {
        
        
        switch (notification.getType()) {
            case NotificationDefine.CheckLogin:
                console.log('----检查登录状态----');
                break;
        }
    }

}