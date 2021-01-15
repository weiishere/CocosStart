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
import { DymjS2CEnterRoom } from "../GameData/Dymj/s2c/DymjS2CEnterRoom";
import { DymjEnterDeskPushPlyaerList } from "../GameData/Dymj/s2c/DymjEnterDeskPushPlyaerList";


export class DeskProxy extends BaseProxy {
    private repository: DeskRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new DeskRepository();
    }

    /**更新用户信息 */
    updateUserInfo(dymjEnterDeskPushPlyaerList: DymjEnterDeskPushPlyaerList) {

    }
    /**更新桌子信息 */
    updateDeskInfo(dymjS2CEnterRoom: DymjS2CEnterRoom) {

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