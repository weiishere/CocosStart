import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { MediatorDefine as TTZMediatorDefine } from "../TuiTongZi/TuiTongZiConst/TTZMediatorDefine";
import { ApplicationGlobal } from "../MahjongConst/ApplicationGlobal"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { ProxyDefine as ttzProxyDefine } from "../TuiTongZi/TuiTongZiConst/TTZProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";
import { DeskProxy } from "../Proxy/DeskProxy";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"
import { GateCommand } from "../Command/GateCommand"
import { WebSockerProxy } from '../Proxy/WebSocketProxy';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from "../Proxy/ConfigProxy";
import { ClubProxy } from '../Proxy/ClubProxy';
import { DeskListMediator } from '../Mediator/DeskListMediator';
import { DeskMediator } from '../Mediator/DeskMediator';
import { TuiTongZiMediator } from '../TuiTongZi/TuiTongZiMediator';
import { TTZDeskProxy } from "../TuiTongZi/TTZDeskProxy";
import { CDMJProxyDefine } from "../CDMahjong/CDMJConst/CDMJProxyDefine";
import { CDMJDeskProxy } from "../CDMahjong/CDMJDeskProxy";
import CDMJDeskMediator from "../CDMahjong/CDMJDeskMediator";
import { CDMJMediatorDefine } from "../CDMahjong/CDMJConst/CDMJMediatorDefine";

export class StartupCommand extends Command {
    public execute(notification: INotification): void {
        Facade.Instance.registerProxy(new GateProxy(ProxyDefine.Gate));
        Facade.Instance.registerProxy(new WebSockerProxy(ProxyDefine.WebSocket));
        Facade.Instance.registerProxy(new LocalCacheDataProxy(ProxyDefine.LocalCacheData));
        Facade.Instance.registerProxy(new ConfigProxy(ProxyDefine.Config));
        Facade.Instance.registerProxy(new DeskProxy(ProxyDefine.Desk));
        Facade.Instance.registerProxy(new TTZDeskProxy(ttzProxyDefine.TTZDesk));
        Facade.Instance.registerProxy(new CDMJDeskProxy(CDMJProxyDefine.CDMJDesk));
        

        Facade.Instance.registerMediator(new GatePanelMediator(MediatorDefine.GatePanel, ApplicationGlobal.GatePanel));
        Facade.Instance.registerMediator(new DeskListMediator(MediatorDefine.DeskList, ApplicationGlobal.GatePanel));
        Facade.Instance.registerMediator(new DeskMediator(MediatorDefine.Desk, ApplicationGlobal.GatePanel));
        Facade.Instance.registerMediator(new TuiTongZiMediator(TTZMediatorDefine.TTZDeskPanel, ApplicationGlobal.GatePanel));
        Facade.Instance.registerMediator(new CDMJDeskMediator(CDMJMediatorDefine.CDMJDeskPanel, ApplicationGlobal.GatePanel));

        /**放到command的notification命令或逻辑注意一个原则：可能会被其他view重用，不然尽量放到mediator中 */
        Facade.Instance.registerCommand(CommandDefine.GateCommand, GateCommand);


        // StartupCommand 只执行一次
        this.facade.removeCommand(CommandDefine.StartUp);

        //初始化Gate
        this.sendNotification(CommandDefine.InitGatePanel, {});

        
    }
}