import BaseProxy from "./BaseProxy";
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
        // 登录返回
        if (msgType === ClubProtocol.C2S_LOGIN_CLUB) {
            let s2CJoinClubInfo: S2CJoinClubInfo = <S2CJoinClubInfo>content;
            cc.log("俱乐部登录返回", s2CJoinClubInfo);
        } else if (msgType === ClubProtocol.S2C_PUSH_ADD_ROOM) {
            let s2CClubRoomInfoBase: S2CClubRoomInfoBase = <S2CClubRoomInfoBase>content;
        } else if (msgType === ClubProtocol.S2C_HEARTBEAT) {  //推送心跳
            this.sendHeartbeat();
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_ROUND) {  //推送房间的局数变化
            let s2CClubPushRoomRound: S2CClubPushRoomRound = <S2CClubPushRoomRound>content;
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_DELETE) { //推送删除一个房间
            let s2CClubDeleteRoom: S2CClubDeleteRoom = <S2CClubDeleteRoom>content;
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_SIT_DOWN) { //推送玩家坐下
            let s2CClubRoomSitDown: S2CClubRoomSitDown = <S2CClubRoomSitDown>content;
        } else if (msgType === ClubProtocol.S2C_PUSH_ROOM_STAND_UP) { //推送玩家站起
            let s2CClubRoomStandUp: S2CClubRoomStandUp = <S2CClubRoomStandUp>content;
        }
    }

    public joinClub(): void {
        let token = this.getLocalCacheDataProxy().getUserToken();
        // clubNo 目前默认为1，表示系统俱乐部
        this.sendGameData(ClubProtocol.C2S_LOGIN_CLUB, new ClubC2SLogin(token, 1), (op: number, msgType: number) => {
            // 进入俱乐部之后没有返回的处理
        });
    }

    sendHeartbeat() {
        this.sendGameData(ClubProtocol.C2S_LOGIN_CLUB, '');
    }

    onRegister() {

    }

}