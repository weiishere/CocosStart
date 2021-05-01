import { ModuleProxy } from '../Proxy/ModuleProxy';
import { OperationDefine } from '../GameConst/OperationDefine';
import { XzddProtocol } from '../Protocol/XzddProtocol';
import { XzddC2SPlayerLogin } from '../GameData/Xzdd/c2s/XzddC2SPlayerLogin';
import { XzddC2SEnterRoom } from '../GameData/Xzdd/c2s/XzddC2SEnterRoom';
import { XzddErrorCode } from '../GameConst/XzddErrorCode';
import { XzddS2CEnterRoom } from '../GameData/Xzdd/s2c/XzddS2CEnterRoom';
import { XzddS2CBeginDealData } from '../GameData/Xzdd/s2c/XzddS2CBeginDealData';
import { XzddS2CPlayerGet } from '../GameData/Xzdd/s2c/XzddS2CPlayerGet';
import { XzddS2CDoNextOperation } from '../GameData/Xzdd/s2c/XzddS2CDoNextOperation';
import { XzddGameResult } from '../GameData/Xzdd/s2c/XzddGameResult';
import { XzddS2CShowOperation } from '../GameData/Xzdd/s2c/XzddS2CShowOperation';
import { XzddS2COpPutRsp } from '../GameData/Xzdd/s2c/XzddS2COpPutRsp';
import { XzddGameOperation } from '../GameData/Xzdd/s2c/XzddGameOperation';
import { XzddUpdateUserCredit } from '../GameData/Xzdd/s2c/XzddUpdateUserCredit';
import { XzddGameReconnData } from '../GameData/Xzdd/s2c/XzddGameReconnData';
import { XzddC2SEnterUserInfo } from '../GameData/Xzdd/c2s/XzddC2SEnterUserInfo';
import { XzddC2SPutMahjong } from '../GameData/Xzdd/c2s/XzddC2SPutMahjong';
import { XzddC2SOperatioinData } from '../GameData/Xzdd/c2s/XzddC2SOperatioinData';
import { XzddOperationType } from '../GameData/Xzdd/XzddOperationType';
import { CDMJCommandDefine } from './CDMJConst/CDMJCommandDefine';
import { XzddEnterDeskPushPlyaerList } from '../GameData/Xzdd/s2c/XzddEnterDeskPushPlyaerList';
import { CDMJProxyDefine } from './CDMJConst/CDMJProxyDefine';
import { CDMJDeskProxy } from './CDMJDeskProxy';
import { XzddS2CDissolveResult } from '../GameData/Xzdd/s2c/XzddS2CDissolveResult';
import { XzddEntrust } from '../GameData/Xzdd/s2c/XzddEntrust';
import { XzddEntrustRsp } from '../GameData/Xzdd/s2c/XzddEntrustRsp';
import { XzddShowDingZhangMahjongs } from '../GameData/Xzdd/s2c/XzddShowDingZhangMahjongs';
import { XzddDingZhangMahjongs } from '../GameData/Xzdd/c2s/XzddDingZhangMahjongs';
import { XzddOpDingZhangMahjongsRsp } from '../GameData/Xzdd/s2c/XzddOpDingZhangMahjongsRsp';
import { XzddOpDingZhangMahjongsBroadCast } from '../GameData/Xzdd/s2c/XzddOpDingZhangMahjongsBroadCast';
import { XzddShowHuan3ZhangMahjongs } from '../GameData/Xzdd/s2c/XzddShowHuan3ZhangMahjongs';
import { XzddHuan3ZhangMahjongs } from '../GameData/Xzdd/c2s/XzddHuan3ZhangMahjongs';
import { XzddOpHuan3ZhangMahjongsRsp } from '../GameData/Xzdd/s2c/XzddOpHuan3ZhangMahjongsRsp';
import { XzddOpHuan3ZhangMahjongsBroadCast } from '../GameData/Xzdd/s2c/XzddOpHuan3ZhangMahjongsBroadCast';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { XzddReady } from '../GameData/Xzdd/c2s/XzddReady';
import { XzddS2CCheckHu } from '../GameData/Xzdd/s2c/XzddS2CCheckHu';
import getLocation from '../Util/GetLocation';

/**
 * 血战到底消息数据代理类
 */
export class XzddProxy extends ModuleProxy {
    joinRoomNo: number;

    // 是否准备房间
    isReadyEnterRoom: boolean;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    getOp(): number {
        return OperationDefine.XUE_ZHAN_DAO_DI;
    }

    handle(msgType: number, content: any, errorCode: number): void {
        if (this.errorCodeHandle(msgType, errorCode)) {
            return;
        }
        if (msgType === XzddProtocol.S_PLAYER_LOGIN) {
            // 登录成功之后直接进入房间
            this.joinRoom(this.joinRoomNo);
        } else if (msgType === XzddProtocol.S_ENTER_ROOM) {

            // dymjS2CEnterRoom 这个名字是需要修改，这里是为了能够拉起二人麻将做的测试
            let xzddS2CEnterRoom: XzddS2CEnterRoom = <XzddS2CEnterRoom>content;
            xzddS2CEnterRoom.players.forEach(v => {
                v.azimuth -= 1;
            })
            // 这里构建麻将界面
            cc.log("构建CDMJ--sendNotification=================");
            this.sendNotification(CDMJCommandDefine.InitDeskPanel, { xzddS2CEnterRoom });
        } else if (msgType === XzddProtocol.S_PUSH_DESK_PLAYER_LIST) {// 推送玩家信息
            let xzddEnterDeskPushPlyaerList: XzddEnterDeskPushPlyaerList = <XzddEnterDeskPushPlyaerList>content;
            xzddEnterDeskPushPlyaerList.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().updateUserInfo(xzddEnterDeskPushPlyaerList.players)
        } else if (msgType === XzddProtocol.S_GO_ON) {  //继续游戏返回
            this.sendNotification(CDMJCommandDefine.ClearDeskGameView);
            this.sendNotification(CDMJCommandDefine.ReStartGamePush, null);
        } else if (msgType === XzddProtocol.S_Game_BeginDeal_BroadCast) {   //开始游戏发牌数据
            let xzddS2CBeginDealData: XzddS2CBeginDealData = <XzddS2CBeginDealData>content;
            xzddS2CBeginDealData.players.forEach(v => {
                v.azimuth -= 1;
            })
            this.getDeskProxy().beginGame(xzddS2CBeginDealData);
        } else if (msgType === XzddProtocol.S_Game_Get) {   //推送玩家摸牌消息
            let xzddS2CPlayerGet: XzddS2CPlayerGet = <XzddS2CPlayerGet>content;
            xzddS2CPlayerGet.playerAzimuth -= 1;
            this.getDeskProxy().drawCard(xzddS2CPlayerGet);
        } else if (msgType === XzddProtocol.S_Game_DoNextOperation_BroadCast) {   //推送玩家下一步的操作
            let xzddS2CDoNextOperation: XzddS2CDoNextOperation = <XzddS2CDoNextOperation>content;
            xzddS2CDoNextOperation.playerAzimuth -= 1;
            this.getDeskProxy().updateNextOperationEvent(xzddS2CDoNextOperation);
        } else if (msgType === XzddProtocol.S_Game_Result_BroadCast) {   //推送游戏结束消息
            let xzddGameResult: XzddGameResult = <XzddGameResult>content;
            xzddGameResult.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().gameOver(xzddGameResult);
        } else if (msgType === XzddProtocol.S_Game_ShowOperation) {   //推送提示玩家操作消息
            let xzddS2CShowOperation: XzddS2CShowOperation = <XzddS2CShowOperation>content;
            xzddS2CShowOperation.playerAzimuth -= 1;
            console.log('===========', xzddS2CShowOperation.oprts);
            this.getDeskProxy().updateOperationEvent(xzddS2CShowOperation);
        } else if (msgType === XzddProtocol.S_Game_PutRsp_BroadCast) {   //推送玩家出牌消息
            let xzddS2COpPutRsp: XzddS2COpPutRsp = <XzddS2COpPutRsp>content;
            xzddS2COpPutRsp.playerAzimuth -= 1;
            this.getDeskProxy().updateOutCard(xzddS2COpPutRsp);
        } else if (msgType === XzddProtocol.S_Game_OperationRsp_BroadCast) {   //推送玩家操作之后的消息
            let xzddGameOperation: XzddGameOperation = <XzddGameOperation>content;
            // 操作之后玩家方位
            xzddGameOperation.playerAzimuth -= 1;
            if (xzddGameOperation.gang) {
                // 被杠的玩家方位
                xzddGameOperation.gang.playerAzimuth -= 1;
            }
            if (xzddGameOperation.peng) {
                // 被碰的玩家方位
                xzddGameOperation.peng.playerAzimuth -= 1;
            }
            if (xzddGameOperation.hu) {
                // 如果点炮或抢杠，这个是被胡的玩家方位
                xzddGameOperation.hu.playerAzimuth -= 1;
            }
            if (xzddGameOperation.ting) {
                // 如果点炮或抢杠，这个是被胡的玩家方位
                xzddGameOperation.ting.playerAzimuth -= 1;
            }
            this.getDeskProxy().updateDeskEvent(xzddGameOperation);
        } else if (msgType === XzddProtocol.S_UPDATE_PLAYERS_CREDIT) {   //推送玩家分数变化
            let xzddUpdateUserCredit: XzddUpdateUserCredit = <XzddUpdateUserCredit>content;
            xzddUpdateUserCredit.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().updatePlayerGold(xzddUpdateUserCredit);
        } else if (msgType === XzddProtocol.S_Game_Reconn) {   //推送玩家重连的数据
            let xzddGameReconnData: XzddGameReconnData = <XzddGameReconnData>content;
            xzddGameReconnData.players.forEach(v => {
                v.playerInfo.azimuth -= 1;
            });
            xzddGameReconnData.lastPutPlayerAzimuth -= 1;
            xzddGameReconnData.waitingPlayerAzimuth -= 1;
            this.getDeskProxy().gameReconnect(xzddGameReconnData);
        } else if (msgType === XzddProtocol.S_PUSH_EXIT_ROOM) {   //推送玩家退出游戏消息
        } else if (msgType === XzddProtocol.S_PUSH_DISSOLVE_RESULT) {   //房间解散消息
            let xzddS2CDissolveResult: XzddS2CDissolveResult = <XzddS2CDissolveResult>content;
        } else if (msgType === XzddProtocol.S_ENTRUST) {   //请求托管返回
            let xzddEntrustRsp: XzddEntrustRsp = <XzddEntrustRsp>content;
            if (xzddEntrustRsp.isHosted) {
                this.sendNotification(CDMJCommandDefine.OpenEntrustPanel, null);
            } else {
                this.sendNotification(CDMJCommandDefine.EntrustNotice, null);
            }
        } else if (msgType === XzddProtocol.C_SEND_INTERACT_MSG) {   //推送玩家互动消息
            this.getDeskProxy().playerInteractMsg(content);
        } else if (msgType === XzddProtocol.S_Game_ShowDingzhang) {   //提示玩家定章消息
            let xzddShowDingZhangMahjongs: XzddShowDingZhangMahjongs = <XzddShowDingZhangMahjongs>content;
            xzddShowDingZhangMahjongs.playerAzimuth -= 1;
            this.getDeskProxy().updateDingZhangOperationEvent(xzddShowDingZhangMahjongs);
        } else if (msgType === XzddProtocol.S_Game_Dingzhang) {   //玩家定章结果返回
            let xzddOpDingZhangMahjongsRsp: XzddOpDingZhangMahjongsRsp = <XzddOpDingZhangMahjongsRsp>content;
            xzddOpDingZhangMahjongsRsp.playerAzimuth -= 1;
            this.getDeskProxy().playerSelfDingzhangDone(xzddOpDingZhangMahjongsRsp);
        } else if (msgType === XzddProtocol.S_Game_Put_Dingzhang) {   //所有玩家定张结束，包含所有玩家的定张信息
            let xzddOpDingZhangMahjongsBroadCast: XzddOpDingZhangMahjongsBroadCast = <XzddOpDingZhangMahjongsBroadCast>content;
            this.getDeskProxy().allPlayerDingZhangDone(xzddOpDingZhangMahjongsBroadCast);
        } else if (msgType === XzddProtocol.S_Game_ShowHuan3Zhang) {   //提示玩家换三张操作
            let xzddShowHuan3ZhangMahjongs: XzddShowHuan3ZhangMahjongs = <XzddShowHuan3ZhangMahjongs>content;
            xzddShowHuan3ZhangMahjongs.playerAzimuth -= 1;
            const myCards = (<CDMJDeskProxy>this.facade.retrieveProxy(CDMJProxyDefine.CDMJDesk)).repository.gameData.myCards;
            if (myCards.switchOutCardDefault.length === 3) return;
            myCards.switchOutCardDefault = xzddShowHuan3ZhangMahjongs.mahjongs;
            this.getDeskProxy().chooseSwitchOutCard(xzddShowHuan3ZhangMahjongs.mahjongs);
        } else if (msgType === XzddProtocol.S_Game_Huan3Zhang) {   //玩家操作换三张结果返回
            let xzddOpHuan3ZhangMahjongsRsp: XzddOpHuan3ZhangMahjongsRsp = <XzddOpHuan3ZhangMahjongsRsp>content;
            xzddOpHuan3ZhangMahjongsRsp.playerAzimuth -= 1;
            this.sendNotification(CDMJCommandDefine.SureSwitchCardPush);
        } else if (msgType === XzddProtocol.S_Game_Put_Huan3Zhang) {   //所有玩家换三张结束之后，广播的消息
            let xzddOpHuan3ZhangMahjongsBroadCast: XzddOpHuan3ZhangMahjongsBroadCast = <XzddOpHuan3ZhangMahjongsBroadCast>content;
            xzddOpHuan3ZhangMahjongsBroadCast.playerAzimuth -= 1;
            this.getDeskProxy().chooseSwitchInCard(xzddOpHuan3ZhangMahjongsBroadCast);
        } else if (msgType === XzddProtocol.S_HEARTBEAT) {   //推送玩家退出游戏消息
            this.sendHeartbeat();
        } else if (msgType === XzddProtocol.S_CHECKHU) {   //返回玩家请求的胡牌数据
            let XzddS2CCheckHu = <XzddS2CCheckHu>content;
            this.getDeskProxy().updateRtMayHuCard(XzddS2CCheckHu);
        }
    }

    errorCodeHandle(msgType: number, errorCode: number) {
        if (errorCode === XzddErrorCode.SUCCEED) {
            return false;
        }

        let errorMsg = "";
        if (errorCode === XzddErrorCode.ROOM_NOT_EXIST) {
            errorMsg = "房间不存在";
        } else if (errorCode === XzddErrorCode.UNDER_LIMIT) {
            errorMsg = "低于准入限制";
        } else if (errorCode === XzddErrorCode.ROOM_FULL) {
            errorMsg = "来晚了，人数满了，换一张桌子吧！";
        } else if (errorCode === XzddErrorCode.GPS_DIST_TOO_CLOSE) {
            errorMsg = "该房间有玩家离您太近了！";
        } else {
            errorMsg = errorCode + "";
        }

        if (msgType === XzddProtocol.S_PLAYER_LOGIN || msgType === XzddProtocol.S_ENTER_ROOM) {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        }

        this.sendNotification(CommandDefine.CloseLoadingPanel);
        this.getGateProxy().toast(errorMsg);
        cc.log("Xzdd错误码: ", errorMsg);
        return true;
    }

    sendHeartbeat() {
        this.sendGameData(XzddProtocol.C_HEARTBEAT, null);
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
        this.sendNotification(CommandDefine.OpenLoadingPanel);

        this.isReadyEnterRoom = true;
        this.joinRoomNo = roomNo;
        let data: XzddC2SPlayerLogin = new XzddC2SPlayerLogin();
        data.acctName = this.getUserName();
        data.acctToken = this.getLocalCacheDataProxy().getUserToken();
        data.clientType = 3;
        this.sendGameData(XzddProtocol.C_PLAYER_LOGIN, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;

            this.sendNotification(CommandDefine.CloseLoadingPanel);
        });
    }

    joinRoom(roomNo: number) {
        let data: XzddC2SEnterRoom = new XzddC2SEnterRoom();
        data.acctName = this.getUserName();
        data.playType = 3;
        data.roomId = roomNo;
        data.vipGameSubClass = 1;

        let { Latitude, Longgitude } = getLocation()

        if (Latitude === '' || Longgitude === '') {
            this.getGateProxy().toast("没有定位信息，请打开定位权限！");
            
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
            this.sendNotification(CommandDefine.CloseLoadingPanel);
            return;
        }
        data.latitude = Number(Latitude);  // 纬度
        data.longitude = Number(Longgitude); // 经度

        this.sendGameData(XzddProtocol.C_ENTER_ROOM, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
            this.sendNotification(CommandDefine.CloseLoadingPanel);
        });
    }
    /**
     * 发牌动画结束
     */
    dealOver() {
        let xzddC2SEnterUserInfo: XzddC2SEnterUserInfo = new XzddC2SEnterUserInfo();
        xzddC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(XzddProtocol.C_Game_DealOver, xzddC2SEnterUserInfo);
    }

    /**
     * 准备
     */
    ready(score: number = 0) {
        cc.log("发送准备=================CDMJ");
        this.isReadyEnterRoom = false;
        let xzddReady: XzddReady = new XzddReady();
        xzddReady.acctName = this.getUserName();
        xzddReady.score = score;
        this.sendGameData(XzddProtocol.C_READY, xzddReady);
    }

    /** 下一局 */
    goOn() {
        let xzddC2SEnterUserInfo: XzddC2SEnterUserInfo = new XzddC2SEnterUserInfo();
        xzddC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(XzddProtocol.C_GO_ON, xzddC2SEnterUserInfo);
    }

    /**
     * 出牌
     * @param mahjongValue 牌值
     */
    putMahkjong(mahjongValue: number, isQingHu: boolean = false) {
        let xzddC2SPutMahjong: XzddC2SPutMahjong = new XzddC2SPutMahjong();
        xzddC2SPutMahjong.acctName = this.getUserName();
        xzddC2SPutMahjong.mjValue = mahjongValue;
        xzddC2SPutMahjong.isQingHu = isQingHu;

        this.sendGameData(XzddProtocol.C_Game_Put, xzddC2SPutMahjong);
    }

    /**
     * 碰，杠，胡操作
     * @param opType 碰，杠，听，胡
     * @param mjValue 牌值
     * @param isQingHu 是否请胡，报胡的时候使用
     */
    operation(opType: XzddOperationType, mjValue: number, isQingHu: boolean = false) {
        let xzddC2SOperatioinData: XzddC2SOperatioinData = new XzddC2SOperatioinData();
        xzddC2SOperatioinData.acctName = this.getUserName();
        xzddC2SOperatioinData.oprtType = opType;
        xzddC2SOperatioinData.mjValues = [mjValue];
        xzddC2SOperatioinData.isQingHu = isQingHu;

        this.sendGameData(XzddProtocol.C_Game_Operation, xzddC2SOperatioinData);
    }

    /**
     * 托管
     * @param isHosted 是否托管，false 取消托管
     */
    entrust(isHosted: boolean) {
        if (isHosted) {
            return;
        }

        let xzddEntrust: XzddEntrust = new XzddEntrust();
        xzddEntrust.acctName = this.getUserName();
        xzddEntrust.isUserRequest = false;
        xzddEntrust.isHosted = isHosted;
        this.sendGameData(XzddProtocol.C_ENTRUST, xzddEntrust);
    }

    /**
     * 定张
     * @param queType 0：万 1： 筒 2： 条
     */
    dingZhang(queType: number) {
        let xzddDingZhangMahjongs: XzddDingZhangMahjongs = new XzddDingZhangMahjongs();
        xzddDingZhangMahjongs.acctName = this.getUserName();
        xzddDingZhangMahjongs.queType = queType;
        this.sendGameData(XzddProtocol.C_Game_Dingzhang, xzddDingZhangMahjongs, (op: number, msgType: number) => {
        });
    }

    /**
     * 换三张
     * @param mahjongs 玩家选择的三张牌，注意：这个三张牌必须是同一个花色的
     */
    huanSanZhang(mahjongs: number[]) {
        let xzddHuan3ZhangMahjongs: XzddHuan3ZhangMahjongs = new XzddHuan3ZhangMahjongs();
        xzddHuan3ZhangMahjongs.mahjongs = mahjongs

        this.sendGameData(XzddProtocol.C_Game_Huan3Zhang, xzddHuan3ZhangMahjongs, (op: number, msgType: number) => {
        });
    }

    /**
     * 查询自己的胡牌
     */
    checkHu() {
        let xzddC2SEnterUserInfo: XzddC2SEnterUserInfo = new XzddC2SEnterUserInfo();
        xzddC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(XzddProtocol.C_CHECKHU, xzddC2SEnterUserInfo, (op: number, msgType: number) => {
        });
    }

    /**
     * 登出
     */
    logout() {
        this.isReadyEnterRoom = false;
        this.joinRoomNo = null;
        this.sendGameData(XzddProtocol.LOGOUT, this.getLocalCacheDataProxy().getLoginData().userName);
    }

    /**
     * 发送互动消息
     * @param msgContent 
     */
    sendInteractMsg(msgContent: string) {
        this.sendGameData(XzddProtocol.C_SEND_INTERACT_MSG, msgContent);
    }


    serverShutDown(): void {
        this.isReadyEnterRoom = false;
        this.joinRoomNo = null;
        this.getGateProxy().toast("游戏服务暂停了");
        this.sendNotification(CDMJCommandDefine.ExitDeskPanel, {}, '');
    }

    onRegister() {

    }

    getDeskProxy() {
        return <CDMJDeskProxy>this.facade.retrieveProxy(CDMJProxyDefine.CDMJDesk);
    }

}