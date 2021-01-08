import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';

export class BaseCommand extends Command {

    public getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData);
    }
}