import BaseProxy from "./BaseProxy";
import { DeskRepository, GameData, DeskData } from "../repositories/DeskRepository";
import { ConfigProxy } from './ConfigProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { HttpUtil } from '../Util/HttpUtil';
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import { ServerCode } from '../GameConst/ServerCode';
import { WebSockerProxy } from './WebSocketProxy';
import { LoginData } from '../GameData/LoginData';
import { ClubProxy } from './ClubProxy';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";


export class DeskProxy extends BaseProxy {
    private repository: DeskRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new DeskRepository();
    }
    
    getGameData() {
        return this.repository.gameData;
    }
    getDeskData() {
        return this.repository.deskData;
    }
    setGateData(gameData: GameData) {

    }
}