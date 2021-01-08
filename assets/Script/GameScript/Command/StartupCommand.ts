import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { ApplicationGlobal } from "../MahjongConst/ApplicationGlobal"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"
import { GateCommand } from "../Command/GateCommand"

export class StartupCommand extends Command {
    public execute(notification: INotification): void {
        
        Facade.Instance.registerMediator(new GatePanelMediator(MediatorDefine.GatePanel, ApplicationGlobal.GatePanel));

        Facade.Instance.registerProxy(new GateProxy(ProxyDefine.Gate));

        /**放到command的notification命令或逻辑注意一个原则：可能会被其他view重用，不然尽量放到mediator中 */
        Facade.Instance.registerCommand(CommandDefine.GateCommand, GateCommand);

        //初始化Gate
        //this.sendNotification(CommandDefine.InitGatePanel, {});
    }
}