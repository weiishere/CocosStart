import { ModuleProxy } from './ModuleProxy';
import { OperationDefine } from '../GameConst/OperationDefine';
import { DymjProtocol } from '../Protocol/DymjProtocol';
import { DymjC2SPlayerLogin } from '../GameData/Dymj/c2s/DymjC2SPlayerLogin';
import { DymjC2SEnterRoom } from '../GameData/Dymj/c2s/DymjC2SEnterRoom';
import { DymjErrorCode } from '../GameConst/DymjErrorCode';
import { DymjS2CEnterRoom } from '../GameData/Dymj/s2c/DymjS2CEnterRoom';
import { DymjS2CBeginDealData } from '../GameData/Dymj/s2c/DymjS2CBeginDealData';
import { DymjS2CPlayerGet } from '../GameData/Dymj/s2c/DymjS2CPlayerGet';
import { DymjS2CDoNextOperation } from '../GameData/Dymj/s2c/DymjS2CDoNextOperation';
import { DymjGameResult } from '../GameData/Dymj/s2c/DymjGameResult';
import { DymjS2CShowOperation } from '../GameData/Dymj/s2c/DymjS2CShowOperation';
import { DymjS2COpPutRsp } from '../GameData/Dymj/s2c/DymjS2COpPutRsp';
import { DymjGameOperation } from '../GameData/Dymj/s2c/DymjGameOperation';
import { DymjUpdateUserCredit } from '../GameData/Dymj/s2c/DymjUpdateUserCredit';
import { DymjGameReconnData } from '../GameData/Dymj/s2c/DymjGameReconnData';
import { DymjC2SEnterUserInfo } from '../GameData/Dymj/c2s/DymjC2SEnterUserInfo';
import { DymjC2SPutMahjong } from '../GameData/Dymj/c2s/DymjC2SPutMahjong';
import { DymjC2SOperatioinData } from '../GameData/Dymj/c2s/DymjC2SOperatioinData';
import { DymjOperationType } from '../GameData/Dymj/DymjOperationType';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { DymjEnterDeskPushPlyaerList } from '../GameData/Dymj/s2c/DymjEnterDeskPushPlyaerList';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { DeskProxy } from './DeskProxy';

/**
 * 大邑麻将消息数据代理类
 */
export class DymjProxy extends ModuleProxy {
    joinRoomNo: number;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.DA_YI_ER_REN_MAHJONG;
    }

    handle(msgType: number, content: any, errorCode: number): void {
        if (this.errorCodeHandle(errorCode)) {
            return;
        }
        if (msgType === DymjProtocol.S_PLAYER_LOGIN) {
            // 登录成功之后直接进入房间
            this.joinRoom(this.joinRoomNo);
        } else if (msgType === DymjProtocol.S_ENTER_ROOM) {
            let dymjS2CEnterRoom: DymjS2CEnterRoom = <DymjS2CEnterRoom>content;
            // 这里构建麻将界面
            this.sendNotification(CommandDefine.InitDeskPanel, { dymjS2CEnterRoom });
        } else if (msgType === DymjProtocol.S_PUSH_DESK_PLAYER_LIST) {// 推送玩家信息
            let dymjEnterDeskPushPlyaerList: DymjEnterDeskPushPlyaerList = <DymjEnterDeskPushPlyaerList>content;
            this.getDeskProxy().updateUserInfo(dymjEnterDeskPushPlyaerList)
        } else if (msgType === DymjProtocol.S_GO_ON) {
        } else if (msgType === DymjProtocol.S_Game_BeginDeal_BroadCast) {   //开始游戏发牌数据
            let dymjS2CBeginDealData: DymjS2CBeginDealData = <DymjS2CBeginDealData>content;

        } else if (msgType === DymjProtocol.S_Game_Get) {   //推送玩家摸牌消息
            let dymjS2CPlayerGet: DymjS2CPlayerGet = <DymjS2CPlayerGet>content;
        } else if (msgType === DymjProtocol.S_Game_DoNextOperation_BroadCast) {   //推送玩家下一步的操作
            let dymjS2CDoNextOperation: DymjS2CDoNextOperation = <DymjS2CDoNextOperation>content;
        } else if (msgType === DymjProtocol.S_Game_Result_BroadCast) {   //推送游戏结束消息
            let dymjGameResult: DymjGameResult = <DymjGameResult>content;
        } else if (msgType === DymjProtocol.S_Game_ShowOperation) {   //推送提示玩家操作消息
            let dymjS2CShowOperation: DymjS2CShowOperation = <DymjS2CShowOperation>content;
        } else if (msgType === DymjProtocol.S_Game_PutRsp_BroadCast) {   //推送玩家出牌消息
            let dymjS2COpPutRsp: DymjS2COpPutRsp = <DymjS2COpPutRsp>content;
        } else if (msgType === DymjProtocol.S_Game_OperationRsp_BroadCast) {   //推送玩家操作之后的消息
            let dymjGameOperation: DymjGameOperation = <DymjGameOperation>content;
        } else if (msgType === DymjProtocol.S_UPDATE_PLAYERS_CREDIT) {   //推送玩家分数变化
            let dymjUpdateUserCredit: DymjUpdateUserCredit = <DymjUpdateUserCredit>content;
        } else if (msgType === DymjProtocol.S_Game_Reconn) {   //推送玩家重连的数据
            let dymjGameReconnData: DymjGameReconnData = <DymjGameReconnData>content;
        } else if (msgType === DymjProtocol.S_PUSH_EXIT_ROOM) {   //推送玩家退出游戏消息
        }
    }

    errorCodeHandle(erroCode: number) {
        if (erroCode === DymjErrorCode.SUCCEED) {
            return false;
        }

        cc.log("DYMJ错误码: ", erroCode);
        return true;
    }

    sendHeartbeat() {
        // this.sendGameData(ClubProtocol.C2S_LOGIN_CLUB, '');
    }

    getUserName() {
        return this.getLocalCacheDataProxy().getLoginData().userName;
    }

    loginGame(roomNo: number) {
        this.joinRoomNo = roomNo;
        let data: DymjC2SPlayerLogin = new DymjC2SPlayerLogin();
        data.acctName = this.getUserName();
        data.acctToken = this.getLocalCacheDataProxy().getUserToken();
        data.clientType = 3;
        this.sendGameData(DymjProtocol.C_PLAYER_LOGIN, data, (op: number, msgType: number) => {
        });
    }

    joinRoom(roomNo: number) {
        let data: DymjC2SEnterRoom = new DymjC2SEnterRoom();
        data.acctName = this.getUserName();
        data.playType = 3;
        data.roomId = roomNo;
        data.vipGameSubClass = 1;

        this.sendGameData(DymjProtocol.C_ENTER_ROOM, data, (op: number, msgType: number) => {
        });
    }

    ready() {
        let dymjC2SEnterUserInfo: DymjC2SEnterUserInfo = new DymjC2SEnterUserInfo();
        dymjC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(DymjProtocol.C_READY, DymjC2SEnterUserInfo);
    }

    putMahkjong(mahjongValue: number) {
        let dymjC2SPutMahjong: DymjC2SPutMahjong = new DymjC2SPutMahjong();
        dymjC2SPutMahjong.acctName = this.getUserName();
        dymjC2SPutMahjong.mjValue = mahjongValue;

        this.sendGameData(DymjProtocol.C_Game_Put, dymjC2SPutMahjong);
    }

    operation(opType: DymjOperationType, huValue: number) {
        let dymjC2SOperatioinData: DymjC2SOperatioinData = new DymjC2SOperatioinData();
        dymjC2SOperatioinData.acctName = this.getUserName();
        dymjC2SOperatioinData.oprtType = opType;
        dymjC2SOperatioinData.mjValues = [huValue];

        this.sendGameData(DymjProtocol.C_Game_Operation, dymjC2SOperatioinData);
    }

    serverShutDown(): void {
    }

    onRegister() {

    }

    getDeskProxy(){
        return <DeskProxy>this.facade.retrieveProxy(ProxyDefine.Desk);
    }

}