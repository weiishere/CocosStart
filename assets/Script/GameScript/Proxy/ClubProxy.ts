import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';
import { ModuleProxy } from './ModuleProxy';
import { OperationDefine } from '../GameConst/OperationDefine';
import { ClubProtocol } from '../Protocol/ClubProtocol';
import { S2CJoinClubInfo } from '../GameData/Club/s2c/S2CJoinClubInfo';
import { ClubC2SLogin } from '../GameData/Club/c2s/ClubC2SLogin';
import { S2CClubRoomInfoBase } from '../GameData/Club/s2c/S2CClubRoomInfoBase';
import { S2CClubDeleteRoom } from '../GameData/Club/s2c/S2CClubDeleteRoom';
import { S2CClubRoomSitDown } from '../GameData/Club/s2c/S2CClubRoomSitDown';
import { S2CClubRoomStandUp } from '../GameData/Club/s2c/S2CClubRoomStandUp';
import { S2CClubPushRoomRound } from '../GameData/Club/s2c/S2CClubPushRoomRound';
import { S2CClubJoinRoom } from '../GameData/Club/s2c/S2CClubJoinRoom';
import { ClubErrorCode } from '../GameConst/ClubErrorCode';

/**
 * 俱乐部代理类
 */
export class ClubProxy extends ModuleProxy {
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.CLUB_SERVICE;
    }

    handle(msgType: number, content: any, errorCode: number): void {

        if (this.errorCodeHandle(errorCode)) {
            return;
        }
        // 登录返回
        if (msgType === ClubProtocol.C2S_LOGIN_CLUB) {
            let s2CJoinClubInfo: S2CJoinClubInfo = <S2CJoinClubInfo>content;
            cc.log("俱乐部登录返回", s2CJoinClubInfo);

            this.sendNotification(CommandDefine.OpenDeskList, s2CJoinClubInfo, NotificationTypeDefine.ClubJoinClob);
        } else if (msgType === ClubProtocol.S2C_PUSH_ADD_ROOM) {
            let s2CClubRoomInfoBase: S2CClubRoomInfoBase = <S2CClubRoomInfoBase>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubRoomInfoBase, NotificationTypeDefine.ClubAddDesk);
        } else if (msgType === ClubProtocol.S2C_HEARTBEAT) {  //推送心跳
            this.sendHeartbeat();
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_ROUND) {  //推送房间的局数变化
            let s2CClubPushRoomRound: S2CClubPushRoomRound = <S2CClubPushRoomRound>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubPushRoomRound, NotificationTypeDefine.ClubRoundCount);
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_DELETE) { //推送删除一个房间
            let s2CClubDeleteRoom: S2CClubDeleteRoom = <S2CClubDeleteRoom>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubDeleteRoom, NotificationTypeDefine.ClubDeleteDesk);
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_SIT_DOWN) { //推送玩家坐下
            let s2CClubRoomSitDown: S2CClubRoomSitDown = <S2CClubRoomSitDown>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubRoomSitDown, NotificationTypeDefine.ClubStiDown);
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_STAND_UP) { //推送玩家站起
            let s2CClubRoomStandUp: S2CClubRoomStandUp = <S2CClubRoomStandUp>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubRoomStandUp, NotificationTypeDefine.ClubStandUp);
        } else if (msgType === ClubProtocol.C2S_LOGOUT_CLUB) { // 退出俱乐部
            this.sendNotification(CommandDefine.OpenDeskList, null, NotificationTypeDefine.ClubQuit);
        } else if (msgType === ClubProtocol.C2S_JOIN_ROOM) { // 进入房间
            let s2CClubJoinRoom: S2CClubJoinRoom = <S2CClubJoinRoom>content;
            this.sendNotification(CommandDefine.OpenDeskList, s2CClubJoinRoom, NotificationTypeDefine.ClubJoinRoom);
        }
    }

    errorCodeHandle(errorCode: number) {
        if (errorCode === ClubErrorCode.SUCCEED) {
            return false;
        }

        let errorStr = "";
        if (errorCode === ClubErrorCode.TOKEN_VERIFY_FAILED) {
            this.getGateProxy().toast("TOKEN校验失败，请重新登录！");
        } else if (errorCode === ClubErrorCode.ROOM_NOT_EXIST) {
            this.getGateProxy().toast("房间不存在！");
        } else if (errorCode === ClubErrorCode.NOT_POWER) {
            this.getGateProxy().toast("暂无权限！");
        } else if (errorCode === ClubErrorCode.MY_DIAMOND_LACK) {
            this.getGateProxy().toast("您的金币不足！");
        } else if (errorCode === ClubErrorCode.SYSTEM_MAINTAIN) {
            this.getGateProxy().toast("系统维护中！");
        } else if (errorCode === ClubErrorCode.NOT_SEAT) {
            this.getGateProxy().toast("房间满了，请换一张桌子吧！");
        }

        return true;
    }

    public joinClub(): void {
        let token = this.getLocalCacheDataProxy().getUserToken();
        // clubNo 目前默认为1，表示系统俱乐部
        this.sendGameData(ClubProtocol.C2S_LOGIN_CLUB, new ClubC2SLogin(token, 1), (op: number, msgType: number) => {
            // 进入俱乐部之后没有返回的处理
        });
    }

    sendHeartbeat() {
        this.sendGameData(ClubProtocol.S2C_HEARTBEAT, '');
    }

    serverShutDown(): void {
        this.sendNotification(CommandDefine.OpenDeskList, null, NotificationTypeDefine.ClubShutdown);
    }

    onRegister() {

    }

}