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
import { DymjS2CDissolveResult } from '../GameData/Dymj/s2c/DymjS2CDissolveResult';
import { DymjEntrust } from '../GameData/Dymj/s2c/DymjEntrust';
import { DymjEntrustRsp } from '../GameData/Dymj/s2c/DymjEntrustRsp';

/**
 * 大邑麻将消息数据代理类
 */
export class DymjProxy extends ModuleProxy {
    joinRoomNo: number;

    // 是否准备房间
    isReadyEnterRoom: boolean;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.DA_YI_ER_REN_MAHJONG;
    }

    handle(msgType: number, content: any, errorCode: number): void {
        if (this.errorCodeHandle(msgType, errorCode)) {
            return;
        }
        if (msgType === DymjProtocol.S_PLAYER_LOGIN) {
            // 登录成功之后直接进入房间
            this.joinRoom(this.joinRoomNo);
        } else if (msgType === DymjProtocol.S_ENTER_ROOM) {
            let dymjS2CEnterRoom: DymjS2CEnterRoom = <DymjS2CEnterRoom>content;
            dymjS2CEnterRoom.players.forEach(v => {
                v.azimuth -= 1;
            })
            // 这里构建麻将界面
            this.sendNotification(CommandDefine.InitDeskPanel, { dymjS2CEnterRoom });
        } else if (msgType === DymjProtocol.S_PUSH_DESK_PLAYER_LIST) {// 推送玩家信息
            let dymjEnterDeskPushPlyaerList: DymjEnterDeskPushPlyaerList = <DymjEnterDeskPushPlyaerList>content;
            dymjEnterDeskPushPlyaerList.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().updateUserInfo(dymjEnterDeskPushPlyaerList.players)
        } else if (msgType === DymjProtocol.S_GO_ON) {  //继续游戏返回
            this.sendNotification(CommandDefine.ReStartGamePush, null);
        } else if (msgType === DymjProtocol.S_Game_BeginDeal_BroadCast) {   //开始游戏发牌数据
            let dymjS2CBeginDealData: DymjS2CBeginDealData = <DymjS2CBeginDealData>content;
            dymjS2CBeginDealData.players.forEach(v => {
                v.azimuth -= 1;
            })
            this.getDeskProxy().beginGame(dymjS2CBeginDealData);
        } else if (msgType === DymjProtocol.S_Game_Get) {   //推送玩家摸牌消息
            let dymjS2CPlayerGet: DymjS2CPlayerGet = <DymjS2CPlayerGet>content;
            dymjS2CPlayerGet.playerAzimuth -= 1;
            this.getDeskProxy().drawCard(dymjS2CPlayerGet);
        } else if (msgType === DymjProtocol.S_Game_DoNextOperation_BroadCast) {   //推送玩家下一步的操作
            let dymjS2CDoNextOperation: DymjS2CDoNextOperation = <DymjS2CDoNextOperation>content;
            dymjS2CDoNextOperation.playerAzimuth -= 1;
            this.getDeskProxy().updateNextOperationEvent(dymjS2CDoNextOperation);
        } else if (msgType === DymjProtocol.S_Game_Result_BroadCast) {   //推送游戏结束消息
            let dymjGameResult: DymjGameResult = <DymjGameResult>content;
            dymjGameResult.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().gameOver(dymjGameResult);
        } else if (msgType === DymjProtocol.S_Game_ShowOperation) {   //推送提示玩家操作消息
            let dymjS2CShowOperation: DymjS2CShowOperation = <DymjS2CShowOperation>content;
            dymjS2CShowOperation.playerAzimuth -= 1;
            this.getDeskProxy().updateOperationEvent(dymjS2CShowOperation);
        } else if (msgType === DymjProtocol.S_Game_PutRsp_BroadCast) {   //推送玩家出牌消息
            let dymjS2COpPutRsp: DymjS2COpPutRsp = <DymjS2COpPutRsp>content;
            dymjS2COpPutRsp.playerAzimuth -= 1;
            this.getDeskProxy().updateOutCard(dymjS2COpPutRsp);
        } else if (msgType === DymjProtocol.S_Game_OperationRsp_BroadCast) {   //推送玩家操作之后的消息
            let dymjGameOperation: DymjGameOperation = <DymjGameOperation>content;
            // 操作之后玩家方位
            dymjGameOperation.playerAzimuth -= 1;
            if (dymjGameOperation.gang) {
                // 被杠的玩家方位
                dymjGameOperation.gang.playerAzimuth -= 1;
            }
            if (dymjGameOperation.peng) {
                // 被碰的玩家方位
                dymjGameOperation.peng.playerAzimuth -= 1;
            }
            if (dymjGameOperation.hu) {
                // 如果点炮或抢杠，这个是被胡的玩家方位
                dymjGameOperation.hu.playerAzimuth -= 1;
            }
            if (dymjGameOperation.ting) {
                // 如果点炮或抢杠，这个是被胡的玩家方位
                dymjGameOperation.ting.playerAzimuth -= 1;
            }
            this.getDeskProxy().updateDeskEvent(dymjGameOperation);
        } else if (msgType === DymjProtocol.S_UPDATE_PLAYERS_CREDIT) {   //推送玩家分数变化
            let dymjUpdateUserCredit: DymjUpdateUserCredit = <DymjUpdateUserCredit>content;
            dymjUpdateUserCredit.players.forEach(v => {
                v.azimuth -= 1;
            });
        } else if (msgType === DymjProtocol.S_Game_Reconn) {   //推送玩家重连的数据
            let dymjGameReconnData: DymjGameReconnData = <DymjGameReconnData>content;
            dymjGameReconnData.players.forEach(v => {
                v.playerInfo.azimuth -= 1;
            });
            dymjGameReconnData.lastPutPlayerAzimuth -= 1;
            dymjGameReconnData.waitingPlayerAzimuth -= 1;
            this.getDeskProxy().gameReconnect(dymjGameReconnData);
        } else if (msgType === DymjProtocol.S_PUSH_EXIT_ROOM) {   //推送玩家退出游戏消息
        } else if (msgType === DymjProtocol.S_PUSH_DISSOLVE_RESULT) {   //房间解散消息
            let dymjS2CDissolveResult: DymjS2CDissolveResult = <DymjS2CDissolveResult>content;
        } else if (msgType === DymjProtocol.S_ENTRUST) {   //请求托管返回
            let dymjEntrustRsp: DymjEntrustRsp = <DymjEntrustRsp>content;
            if (dymjEntrustRsp.isHosted) {
                this.sendNotification(CommandDefine.OpenEntrustPanel, null);
            } else {
                this.sendNotification(CommandDefine.EntrustNotice, null);
            }
        } else if (msgType === DymjProtocol.C_SEND_INTERACT_MSG) {   //推送玩家互动消息
            this.getDeskProxy().playerInteractMsg(content);
        } else if (msgType === DymjProtocol.S_HEARTBEAT) {   //推送玩家退出游戏消息
            this.sendHeartbeat();
        }
    }

    errorCodeHandle(msgType: number, errorCode: number) {
        if (errorCode === DymjErrorCode.SUCCEED) {
            return false;
        }

        let errorMsg = "";
        if (errorCode === DymjErrorCode.ROOM_NOT_EXIST) {
            errorMsg = "房间不存在";
        } else if (errorCode === DymjErrorCode.UNDER_LIMIT) {
            errorMsg = "低于准入限制";
        }

        if (msgType === DymjProtocol.S_PLAYER_LOGIN || msgType === DymjProtocol.S_ENTER_ROOM) {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        }

        this.getGateProxy().toast(errorMsg);
        cc.log("DYMJ错误码: ", errorMsg);
        return true;
    }

    sendHeartbeat() {
        this.sendGameData(DymjProtocol.C_HEARTBEAT, null);
    }

    getUserName() {
        return this.getLocalCacheDataProxy().getLoginData().userName;
    }

    loginGame(roomNo: number, isReconnect: boolean = false) {
        if (!isReconnect) {
            if (this.joinRoomNo) {
                return;
            }
            if (this.isReadyEnterRoom) {
                return;
            }
        }

        this.isReadyEnterRoom = true;
        this.joinRoomNo = roomNo;
        let data: DymjC2SPlayerLogin = new DymjC2SPlayerLogin();
        data.acctName = this.getUserName();
        data.acctToken = this.getLocalCacheDataProxy().getUserToken();
        data.clientType = 3;
        this.sendGameData(DymjProtocol.C_PLAYER_LOGIN, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        });
    }

    joinRoom(roomNo: number) {
        let data: DymjC2SEnterRoom = new DymjC2SEnterRoom();
        data.acctName = this.getUserName();
        data.playType = 3;
        data.roomId = roomNo;
        data.vipGameSubClass = 1;

        this.sendGameData(DymjProtocol.C_ENTER_ROOM, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        });
    }
    /**
     * 发牌动画结束
     */
    dealOver() {
        let dymjC2SEnterUserInfo: DymjC2SEnterUserInfo = new DymjC2SEnterUserInfo();
        dymjC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(DymjProtocol.C_Game_DealOver, dymjC2SEnterUserInfo);
    }

    /**
     * 准备
     */
    ready() {
        cc.log("发送准备=================");
        this.isReadyEnterRoom = false;
        let dymjC2SEnterUserInfo: DymjC2SEnterUserInfo = new DymjC2SEnterUserInfo();
        dymjC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(DymjProtocol.C_READY, dymjC2SEnterUserInfo);
    }

    /** 下一局 */
    goOn() {
        let dymjC2SEnterUserInfo: DymjC2SEnterUserInfo = new DymjC2SEnterUserInfo();
        dymjC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(DymjProtocol.C_GO_ON, dymjC2SEnterUserInfo);
    }

    /**
     * 出牌
     * @param mahjongValue 牌值
     */
    putMahkjong(mahjongValue: number, isQingHu: boolean = false) {
        let dymjC2SPutMahjong: DymjC2SPutMahjong = new DymjC2SPutMahjong();
        dymjC2SPutMahjong.acctName = this.getUserName();
        dymjC2SPutMahjong.mjValue = mahjongValue;
        dymjC2SPutMahjong.isQingHu = isQingHu;

        this.sendGameData(DymjProtocol.C_Game_Put, dymjC2SPutMahjong);
    }

    /**
     * 碰，杠，胡操作
     * @param opType 碰，杠，听，胡
     * @param mjValue 牌值
     * @param isQingHu 是否请胡，报胡的时候使用
     */
    operation(opType: DymjOperationType, mjValue: number, isQingHu: boolean = false) {
        let dymjC2SOperatioinData: DymjC2SOperatioinData = new DymjC2SOperatioinData();
        dymjC2SOperatioinData.acctName = this.getUserName();
        dymjC2SOperatioinData.oprtType = opType;
        dymjC2SOperatioinData.mjValues = [mjValue];
        dymjC2SOperatioinData.isQingHu = isQingHu;

        this.sendGameData(DymjProtocol.C_Game_Operation, dymjC2SOperatioinData);
    }

    /**
     * 托管
     * @param isHosted 是否托管，false 取消托管
     */
    entrust(isHosted: boolean) {
        if (isHosted) {
            return;
        }

        let dymjEntrust: DymjEntrust = new DymjEntrust();
        dymjEntrust.acctName = this.getUserName();
        dymjEntrust.isUserRequest = false;
        dymjEntrust.isHosted = isHosted;
        this.sendGameData(DymjProtocol.C_ENTRUST, dymjEntrust);
    }

    /**
     * 登出
     */
    logout() {
        this.isReadyEnterRoom = false;
        this.joinRoomNo = null;
        this.sendGameData(DymjProtocol.LOGOUT, this.getLocalCacheDataProxy().getLoginData().userName);
    }

    /**
     * 发送互动消息
     * @param msgContent 
     */
    sendInteractMsg(msgContent: string) {
        this.sendGameData(DymjProtocol.C_SEND_INTERACT_MSG, msgContent);
    }

    serverShutDown(): void {
        this.isReadyEnterRoom = false;
        this.joinRoomNo = null;
        this.getGateProxy().toast("游戏服务暂停了");
        this.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
    }

    onRegister() {

    }

    getDeskProxy() {
        return <DeskProxy>this.facade.retrieveProxy(ProxyDefine.Desk);
    }

}