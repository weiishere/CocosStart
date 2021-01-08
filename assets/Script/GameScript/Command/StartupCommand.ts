import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { ApplicationGlobal } from "../MahjongConst/ApplicationGlobal"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";
import { NotificationDefine } from "../MahjongConst/NotificationDefine"
import { GateCommand } from "../Command/GateCommand"

export class StartupCommand extends Command {
    public execute(notification: INotification): void {
        Facade.Instance.registerMediator(new GatePanelMediator(MediatorDefine.GatePanel, ApplicationGlobal.GatePanel));

        Facade.Instance.registerProxy(new GateProxy(ProxyDefine.Gate));

        Facade.Instance.registerCommand(CommandDefine.GateCommand, GateCommand);
    }
}