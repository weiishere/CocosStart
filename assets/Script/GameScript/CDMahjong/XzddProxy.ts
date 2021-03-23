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
            let dymjS2CEnterRoom: XzddS2CEnterRoom = <XzddS2CEnterRoom>content;
            dymjS2CEnterRoom.players.forEach(v => {
                v.azimuth -= 1;
            })
            // 这里构建麻将界面
            this.sendNotification(CDMJCommandDefine.InitDeskPanel, { dymjS2CEnterRoom });
        } else if (msgType === XzddProtocol.S_PUSH_DESK_PLAYER_LIST) {// 推送玩家信息
            let xzddEnterDeskPushPlyaerList: XzddEnterDeskPushPlyaerList = <XzddEnterDeskPushPlyaerList>content;
            xzddEnterDeskPushPlyaerList.players.forEach(v => {
                v.azimuth -= 1;
            });
            this.getDeskProxy().updateUserInfo(xzddEnterDeskPushPlyaerList.players)
        } else if (msgType === XzddProtocol.S_GO_ON) {  //继续游戏返回
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
        } else if (msgType === XzddProtocol.S_HEARTBEAT) {   //推送玩家退出游戏消息
            this.sendHeartbeat();
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
        }

        if (msgType === XzddProtocol.S_PLAYER_LOGIN || msgType === XzddProtocol.S_ENTER_ROOM) {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        }

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

        this.isReadyEnterRoom = true;
        this.joinRoomNo = roomNo;
        let data: XzddC2SPlayerLogin = new XzddC2SPlayerLogin();
        data.acctName = this.getUserName();
        data.acctToken = this.getLocalCacheDataProxy().getUserToken();
        data.clientType = 3;
        this.sendGameData(XzddProtocol.C_PLAYER_LOGIN, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
        });
    }

    joinRoom(roomNo: number) {
        let data: XzddC2SEnterRoom = new XzddC2SEnterRoom();
        data.acctName = this.getUserName();
        data.playType = 3;
        data.roomId = roomNo;
        data.vipGameSubClass = 1;

        this.sendGameData(XzddProtocol.C_ENTER_ROOM, data, (op: number, msgType: number) => {
            this.isReadyEnterRoom = false;
            this.joinRoomNo = null;
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
    ready() {
        cc.log("发送准备=================");
        this.isReadyEnterRoom = false;
        let xzddC2SEnterUserInfo: XzddC2SEnterUserInfo = new XzddC2SEnterUserInfo();
        xzddC2SEnterUserInfo.acctName = this.getUserName();
        this.sendGameData(XzddProtocol.C_READY, xzddC2SEnterUserInfo);
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