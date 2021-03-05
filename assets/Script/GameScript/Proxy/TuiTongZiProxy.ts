import { ModuleProxy } from './ModuleProxy';
import { OperationDefine } from '../GameConst/OperationDefine';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { CommandDefine as TuiTongZiDefineConst } from '../TuiTongZiConst/CommandDefine';
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
import { ProxyDefine } from '../TuiTongZiConst/ProxyDefine';
import { TTZDeskProxy } from './TTZDeskProxy';
import { DeskPlayer } from '../GameData/TuiTongZi/s2c/DeskPlayer';
import { RoomInfo } from '../GameData/TuiTongZi/s2c/RoomInfo';
import { S2CPushRoomResultToHall } from '../GameData/TuiTongZi/s2c/S2CPushRoomResultToHall';

/**
 * 推筒子消息数据代理类
 */
export class TuiTongZiProxy extends ModuleProxy {

    isJoinRoom: boolean = false;
    roomInfo: RoomInfo;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.TUI_TONG_ZI;
    }

    getTTZDeskProxy() {
        return <TTZDeskProxy>this.facade.retrieveProxy(ProxyDefine.TTZDesk);
    }

    setJoinRoom(isJoinRoom: boolean) {
        this.isJoinRoom = isJoinRoom;
        if (!this.isJoinRoom) {
            this.roomInfo = null;
        }
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
            this.setJoinRoom(false);
        } else if (msgType === TuiTongZiProtocol.C2S_JOIN_ROOM) {
            let s2CEnterRoom: S2CEnterRoom = <S2CEnterRoom>content;
            this.setJoinRoom(true);
            this.sendNotification(TuiTongZiDefineConst.OpenTTZDeskPanel);
            this.getTTZDeskProxy().updateSelfPlayerData(this.getDeskPlayer(s2CEnterRoom.players, this.getUserName()));
            this.getTTZDeskProxy().initPlayerData(s2CEnterRoom.players);
            this.getTTZDeskProxy().updateApplyMasterPlayer(s2CEnterRoom.bankerPlayer);
            this.getTTZDeskProxy().initAnteData(s2CEnterRoom.restoreAllPlayerBetVals);
            this.getTTZDeskProxy().updateCardDataList(s2CEnterRoom.spokers);
            this.getTTZDeskProxy().initHistory(this.roomInfo.historyList);
            this.getTTZDeskProxy().updateWaitBankerList(s2CEnterRoom.bankerWaitList);


        } else if (msgType === TuiTongZiProtocol.C2S_UP_BANKER) {
        } else if (msgType === TuiTongZiProtocol.C2S_DOWN_BANKER) {
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_CHANGE_TO_HALL) {
            let s2CPushBankerChange: S2CPushBankerChange = <S2CPushBankerChange>content;
            this.getTTZDeskProxy().updateApplyMasterPlayer(s2CPushBankerChange.deskBankerPlayer);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_PLAYER_JOIN_ROOM) {
            let s2CPushJoinRoom: S2CPushJoinRoom = <S2CPushJoinRoom>content;
            this.getTTZDeskProxy().addPlayerData(s2CPushJoinRoom.players);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_PLAYER_QUIT_ROOM) {
            let s2CQuitRoom: S2CQuitRoom = <S2CQuitRoom>content;
            this.getTTZDeskProxy().removePlayerData(s2CQuitRoom.playerNames);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_REST_COUNTDOWN) {
            let s2CPushCountDown: S2CPushCountDown = <S2CPushCountDown>content;
            let countdown = "";
            if (s2CPushCountDown.countdown > 9) {
                countdown = "" + s2CPushCountDown.countdown;
            } else {
                countdown = "0" + s2CPushCountDown.countdown;
            }
            this.getTTZDeskProxy().updateGameStateStr("等待开始" + countdown);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_PLAYER) {
            let s2CPushBankerChange: S2CPushBankerChange = <S2CPushBankerChange>content;
            this.getTTZDeskProxy().updateApplyMasterPlayer(s2CPushBankerChange.deskBankerPlayer);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BET_COUNTDOWN) {
            let s2CPushCountDown: S2CPushCountDown = <S2CPushCountDown>content;
            if (s2CPushCountDown.countdown >= 1) {
                let countdown = "";
                if (s2CPushCountDown.countdown > 9) {
                    countdown = "" + s2CPushCountDown.countdown;
                } else {
                    countdown = "0" + s2CPushCountDown.countdown;
                }
                this.getTTZDeskProxy().updateGameStateStr("开始下注" + countdown);
            } else {
                this.getTTZDeskProxy().updateGameStateStr("停止下注");
            }
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_ROOM_POKER) { //推送本局的结算结果
            let s2CPushRoomPoker: S2CPushRoomPoker = <S2CPushRoomPoker>content;
            this.getTTZDeskProxy().updateGameStateStr("比牌中");
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_CREDIT_UPDATE) {  //推送玩家分数变化
            let s2CBetUpdateMoney: S2CBetUpdateMoney = <S2CBetUpdateMoney>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_SEAT_CHANGE) {   //推送座位变化
            let s2CRoomSeatChange: S2CRoomSeatChange = <S2CRoomSeatChange>content;
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_BANKER_QUEUE_LIST) {  //推送排队上庄的玩家列表
            let s2CWaitBankerPlayer: S2CWaitBankerPlayer = <S2CWaitBankerPlayer>content;
            this.getTTZDeskProxy().updateWaitBankerList(s2CWaitBankerPlayer.bankerWaitList);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_DOWN_BANKER) {
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_DEAL) {
            let s2CPushDeal: S2CPushDeal = <S2CPushDeal>content;
            this.getTTZDeskProxy().updateGameStateStr("发牌中");
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_MULTIPLAYER_BET) {    //推送玩家下注
            let s2CPushMultiplayerBet: S2CPushMultiplayerBet = <S2CPushMultiplayerBet>content;
            this.getTTZDeskProxy().updateAnteData(s2CPushMultiplayerBet.betInfos);
        } else if (msgType === TuiTongZiProtocol.S2C_PUSH_DESK_WAIT_BET_COUNTDOWN) {
            let s2CPushRoomResultToHall: S2CPushRoomResultToHall = <S2CPushRoomResultToHall>content;
            this.getTTZDeskProxy().addHistory(s2CPushRoomResultToHall.history);
        }
    }

    getDeskPlayer(players: DeskPlayer[], userName: string) {
        for (const deskPlayer of players) {
            if (deskPlayer.name === userName) {
                return deskPlayer;
            }
        }
        return null;
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
        } else if (errorCode === TuiTongZiErrorCode.NOT_BET) {
            this.getGateProxy().toast("当前不能下注");
        } else if (errorCode === TuiTongZiErrorCode.EXCEED_CAN_BET_MONEY) {
            this.getGateProxy().toast("没有可下注的金额了");
        } else if (errorCode === TuiTongZiErrorCode.PLAYER_CASH_STORTAGE) {
            this.getGateProxy().toast("余额不足");
        }

        if (msgType === TuiTongZiProtocol.C2S_PLAYER_LOGIN || msgType === TuiTongZiProtocol.C2S_JOIN_ROOM) {
            this.setJoinRoom(false);
        }

        return true;
    }

    getUserName() {
        return this.getLocalCacheDataProxy().getLoginData().userName;
    }

    sendHeartbeat() {
        this.sendGameData(TuiTongZiProtocol.S2C_HEARTBEAT, null);
    }

    loginGame() {
        if (this.isJoinRoom) {
            this.getGateProxy().toast("不能重复进入房间");
            return;
        }
        this.setJoinRoom(true);
        let c2sPlayerLogin: C2SPlayerLogin = new C2SPlayerLogin();
        c2sPlayerLogin.playerName = this.getUserName();
        c2sPlayerLogin.token = this.getLocalCacheDataProxy().getUserToken();

        this.sendGameData(TuiTongZiProtocol.C2S_PLAYER_LOGIN, c2sPlayerLogin, (op: number, msgType: number) => {
            this.setJoinRoom(false);
        });
    }

    selectRoom(s2CPlayerLogin: S2CPlayerLogin) {
        let roomNo: number = 0;
        this.roomInfo = s2CPlayerLogin.brHallDeskList.rooms[0];
        if (s2CPlayerLogin.offlineData) {
            roomNo = s2CPlayerLogin.offlineData.machineId;
        } else {
            roomNo = this.roomInfo.id;
        }

        this.joinRoom(roomNo);
    }

    joinRoom(roomNo: number) {
        let c2SJoinRoom: C2SJoinRoom = new C2SJoinRoom();
        c2SJoinRoom.machineId = roomNo;
        this.sendGameData(TuiTongZiProtocol.C2S_JOIN_ROOM, c2SJoinRoom, (op: number, msgType: number) => {
            this.setJoinRoom(false);
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
        this.setJoinRoom(false);
        this.getGateProxy().toast("游戏服务暂停了");
        this.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
    }

    onRegister() {
    }

}