import { ModuleProxy } from './ModuleProxy';
import { OperationDefine } from '../GameConst/OperationDefine';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { CommandDefine as TuiTongZiDefineConst } from '../TuiTongZiConst/CommandDefine';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { DeskProxy } from './DeskProxy';
import { TuiTongZiProtocol } from '../Protocol/TuiTongZiProtocol';
import { GameServerCode } from '../GameConst/GameServerCode';
import { C2SPlayerLogin } from '../GameData/TuiTongZi/c2s/C2SPlayerLogin';
import { S2CPlayerLogin } from '../GameData/TuiTongZi/s2c/S2CPlayerLogin';
import { C2SJoinRoom } from '../GameData/TuiTongZi/c2s/C2SJoinRoom';
import { TuiTongZiErrorCode } from '../GameConst/TuiTongZiErrorCode';
import { S2CEnterRoom } from '../GameData/TuiTongZi/s2c/S2CEnterRoom';
import { C2SPlayerBet } from '../GameData/TuiTongZi/c2s/C2SPlayerBet';
import { Bet } from '../GameData/TuiTongZi/Bet';
import { S2CPushBankerChange } from '../GameData/TuiTongZi/s2c/S2CPushBankerChange';
import { S2CPushJoinRoom } from '../GameData/TuiTongZi/s2c/S2CPushJoinRoom';
import { S2CQuitRoom } from '../GameData/TuiTongZi/s2c/S2CQuitRoom';
import { S2CPushCountDown } from '../GameData/TuiTongZi/s2c/S2CPushCountDown';
import { S2CPushRoomPoker } from '../GameData/TuiTongZi/s2c/S2CPushRoomPoker';
import { S2CBetUpdateMoney } from '../GameData/TuiTongZi/s2c/S2CBetUpdateMoney';
import { S2CRoomSeatChange } from '../GameData/TuiTongZi/s2c/S2CRoomSeatChange';
import { S2CWaitBankerPlayer } from '../GameData/TuiTongZi/s2c/S2CWaitBankerPlayer';
import { S2CPushDeal } from '../GameData/TuiTongZi/s2c/S2CPushDeal';
import { S2CPushMultiplayerBet } from '../GameData/TuiTongZi/s2c/S2CPushMultiplayerBet';

/**
 * 推筒子消息数据代理类
 */
export class TuiTongZiProxy extends ModuleProxy {

    isJoinRoom: boolean = false;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.TUI_TONG_ZI;
    }

    handle(msgType: number, content: any, errorCode: number): void {
        if (this.errorCodeHandle(msgType, errorCode)) {
            return;
        }

        if (msgType === TuiTongZiProtocol.C2S_PLAYER_LOGIN) {
            let s2CPlayerLogin: S2CPlayerLogin = <S2CPlayerLogin>content;
            this.selectRoom(s2CPlayerLogin);
        } else if (msgType === TuiTongZiProtocol.S2C_HEARTBEAT) {
            this.sendHeartbeat();
        } else if (msgType === TuiTongZiProtocol.C2S_PLAYER_LOGIN_OUT) {
            // 退出游戏成功返回
            this.isJoinRoom = false;
        } else if (msgType === TuiTongZiProtocol.C2S_JOIN_ROOM) {
            let s2CEnterRoom: S2CEnterRoom = <S2CEnterRoom>content;
            this.isJoinRoom = true;
            this.sendNotification(TuiTongZiDefineConst.OpenTTZDeskPanel);
        } else if (msgType === TuiTongZiProtocol.C2S_UP_BANKER) {
        } else if (msgType === TuiTongZiProtocol.C2S_DOWN_BANKER) {
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_CHANGE_TO_HALL) {
            let s2CPushBankerChange: S2CPushBankerChange = <S2CPushBankerChange>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_PLAYER_JOIN_ROOM) {
            let s2CPushJoinRoom: S2CPushJoinRoom = <S2CPushJoinRoom>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_PLAYER_QUIT_ROOM) {
            let s2CQuitRoom: S2CQuitRoom = <S2CQuitRoom>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_REST_COUNTDOWN) {
            let s2CPushCountDown: S2CPushCountDown = <S2CPushCountDown>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_PLAYER) {
            let s2CPushBankerChange: S2CPushBankerChange = <S2CPushBankerChange>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BET_COUNTDOWN) {
            let s2CPushCountDown: S2CPushCountDown = <S2CPushCountDown>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_ROOM_POKER) {
            let s2CPushRoomPoker: S2CPushRoomPoker = <S2CPushRoomPoker>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_CREDIT_UPDATE) {
            let s2CBetUpdateMoney: S2CBetUpdateMoney = <S2CBetUpdateMoney>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_SEAT_CHANGE) {
            let s2CRoomSeatChange: S2CRoomSeatChange = <S2CRoomSeatChange>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_QUEUE_LIST) {
            let s2CWaitBankerPlayer: S2CWaitBankerPlayer = <S2CWaitBankerPlayer>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_DOWN_BANKER) {
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_DEAL) {
            let s2CPushDeal: S2CPushDeal = <S2CPushDeal>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_MULTIPLAYER_BET) {
            let s2CPushMultiplayerBet: S2CPushMultiplayerBet = <S2CPushMultiplayerBet>content;
        }
    }

    errorCodeHandle(msgType: number, errorCode: number) {
        if (errorCode === GameServerCode.SUCCEED) {
            return false;
        }

        if (errorCode === GameServerCode.PLAYER_LOCK) {
            this.getGateProxy().toast("你的账号被锁定了，请联系管理员");
        } else if (errorCode === GameServerCode.SERVER_EXCEPTION) {
            this.getGateProxy().toast("游戏服务关闭了");
        } else if (errorCode === GameServerCode.SERVER_MAINTAIN) {
            this.getGateProxy().toast("游戏维护中");
        } else if (errorCode === GameServerCode.TOKEN_VERIFY_FAIL) {
            this.getGateProxy().toast("账号安全校验失败");
        } else if (errorCode === TuiTongZiErrorCode.ROOM_EXCEED_MAX_NUMBER) {
            this.getGateProxy().toast("房间满了");
        } else if (errorCode === TuiTongZiErrorCode.UP_BANKER_EXCEED_MAX_NUMBER) {
            this.getGateProxy().toast("上庄排队的人数满了");
        } else if (errorCode === TuiTongZiErrorCode.NO_MEET_UP_BANKER_CONDITION) {
            this.getGateProxy().toast("余额不足，不能上庄");
        } else if (errorCode === TuiTongZiErrorCode.WAIT_IDLE_DOWN_BANKER) {
            this.getGateProxy().toast("下庄成功，等待休息时下庄");
        } else if (errorCode === TuiTongZiErrorCode.CONTINUE_BANKER_COUNT_FULL) {
            this.getGateProxy().toast("你的局数下庄");
        } else if (errorCode === TuiTongZiErrorCode.MONEY_STORTAGE_DOWN_BANKER) {
            this.getGateProxy().toast("你的余额不足下庄");
        }

        return true;
    }

    getUserName() {
        return this.getLocalCacheDataProxy().getLoginData().userName;
    }

    sendHeartbeat() {
        this.sendGameData(TuiTongZiProtocol.S2C_HEARTBEAT, null, (op: number, msgType: number) => {
        });
    }

    loginGame() {
        if (this.isJoinRoom) {
            this.getGateProxy().toast("不能重复进入房间");
            return;
        }
        let c2sPlayerLogin: C2SPlayerLogin = new C2SPlayerLogin();
        c2sPlayerLogin.playerName = this.getUserName();
        c2sPlayerLogin.token = this.getLocalCacheDataProxy().getUserToken();

        this.sendGameData(TuiTongZiProtocol.C2S_PLAYER_LOGIN, c2sPlayerLogin, (op: number, msgType: number) => {
        });
    }

    selectRoom(s2CPlayerLogin: S2CPlayerLogin) {
        let roomNo: number = 0;
        if (s2CPlayerLogin.offlineData) {
            roomNo = s2CPlayerLogin.offlineData.machineId;
        } else {
            roomNo = s2CPlayerLogin.brHallDeskList.rooms[0].id;
        }

        this.joinRoom(roomNo);
    }

    joinRoom(roomNo: number) {
        let c2SJoinRoom: C2SJoinRoom = new C2SJoinRoom();
        c2SJoinRoom.machineId = roomNo;
        this.sendGameData(TuiTongZiProtocol.C2S_JOIN_ROOM, c2SJoinRoom, (op: number, msgType: number) => {
        });
    }

    bet(betType: number, betScore: number) {
        let c2sPlayerBet: C2SPlayerBet = new C2SPlayerBet();
        c2sPlayerBet.betValList = [];
        let bet: Bet = new Bet();
        bet.betType = betType;
        bet.betVal = betScore;
        c2sPlayerBet.betValList.push(bet);

        this.sendGameData(TuiTongZiProtocol.C2S_JOIN_ROOM, c2sPlayerBet);
    }

    upBanker() {
        this.sendGameData(TuiTongZiProtocol.C2S_UP_BANKER, null, (op: number, msgType: number) => {
        });
    }

    downBanker() {
        this.sendGameData(TuiTongZiProtocol.C2S_DOWN_BANKER, null, (op: number, msgType: number) => {
        });
    }

    /**
     * 登出
     */
    logout() {
        this.sendGameData(TuiTongZiProtocol.C2S_PLAYER_LOGIN_OUT, null, (op: number, msgType: number) => {
        });
    }

    serverShutDown(): void {
        this.isJoinRoom = false;
        this.getGateProxy().toast("游戏服务暂停了");
        this.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
    }

    onRegister() {
    }

    getDeskProxy() {
        return <DeskProxy>this.facade.retrieveProxy(ProxyDefine.Desk);
    }

}