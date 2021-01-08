import { LocalCacheDataProxy } from './LocalCacheDataProxy';
import { LoginData } from '../GameData/LoginData';
import { OperationDefine } from '../GameConst/OperationDefine';
import Proxy from '../../Framework/patterns/proxy/Proxy';

class WebSocketData {
    gsData: any;
    targetData: any;

    constructor(gsData: any, targetData: any) {
        this.gsData = gsData;
        this.targetData = targetData;
    }

    toStringData() {
        const gsDataStr = JSON.stringify(this.gsData);
        let targetDataStr = '';
        if (this.targetData && typeof this.targetData === 'object') {
            targetDataStr = JSON.stringify(this.targetData);
        }

        let gsDataStrLen = gsDataStr.length.toString();
        while (gsDataStrLen.length < 6) {
            gsDataStrLen = `0${gsDataStrLen}`;
        }

        const sendDataStr = gsDataStrLen + gsDataStr + targetDataStr;

        return sendDataStr;
    }
}

export class WebSockerProxy extends Proxy {

    private __wsUrl: string;
    private __webSocket: WebSocket;

    private loginData: LoginData = null;
    private tokenData: string = null;

    /** 心跳是否返回 */
    private isHeartbeatResult: boolean = false;
    /** 心跳未返回次数 */
    private heartbeatNotResultCount: number = 0;

    /** 心跳定时任务编号 */
    private heartbeatIntervalNumber: number = -1;
    
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    connect(wsUrl) {
        if (this.loginData === null) {
            this.loginData = this.getLocalCacheDataProxy().getLoginData();
            this.tokenData = this.getLocalCacheDataProxy().getUserToken();
        }

        this.__wsUrl = wsUrl;
        // 如果websocket连接建立了把之前的连接close掉，重新建立连接
        if (this.__webSocket && WebSocket.OPEN == this.__webSocket.readyState) {
            this.__webSocket.close();

            this.__webSocket = null;
        }

        this.__webSocket = new WebSocket(this.__wsUrl);
        this.__webSocket.onopen = this.onWebSocketOpen;
        this.__webSocket.onmessage = this.onWebSocketMessage;
        this.__webSocket.onclose = this.onWebSocketClose;
        this.__webSocket.onerror = this.onWebSocketError;
    }

    getLocalCacheDataProxy(): LocalCacheDataProxy {
        return null;
    }

    onWebSocketOpen(event: Event) {
        this.startHeartbeatHandle();

        this.heartbeatNotResultCount = 0;
        this.isHeartbeatResult = false;

        this.send({ op: OperationDefine.Authentication, un: this.loginData.userName, tk: this.tokenData });
    }

    onWebSocketMessage(event: MessageEvent) {
        // 服务器推送的数据
        let resData = JSON.parse(event.data);

        cc.log("event.data", event.data, "dt : ", resData);

        if (resData.op) {
            // 专门处理网关的消息
            this.gatewayDataHandle(resData);
        } else {
            this.gameDataHandle(resData);
        }
    }

    /**
     * 专门处理网关的数据
     * @param resData 
     */
    gatewayDataHandle(resData) {
        // 数据内容
        let dt = resData.dt;
        // 操作号
        let op: number = resData.op;
        // 错误码
        let errorCode: number = dt.errorCode;
        switch (op) {
            case OperationDefine.Authentication:
                this.gateWayLoginRes(resData);
                break;
            case OperationDefine.USER_GOLD_CHANGE:
                let userGold = JSON.parse(dt.content);
                // 更新玩家的分数
                // this.broadcastUpdateGold(userGold);
                break;
            case OperationDefine.C2GGW_Heartbeat:
                // 心跳返回
                this.isHeartbeatResult = true;
                break;
            case OperationDefine.Server_Shutdown:
                // 服务停止消息的通知

                // 大邑麻将服务被停止了
                if (dt.content == OperationDefine.DA_YI_ER_REN_MAHJONG) {
                    // this.serverShutdown(FacadeDefine.DZNN_FACADE);
                } else if (dt.content == OperationDefine.CLUB_SERVICE) {
                    // 俱乐部服务被停止了
                    // this.serverShutdown(FacadeDefine.CLUB_FACADE);
                }
                break;
        }
    }

    /**
     * 网关登录成功返回
     */
    gateWayLoginRes(resData) {

    }

    /**
     * 游戏数据处理
     * @param resData 
     */
    gameDataHandle(resData): void {
        let gameData = resData;
        if (!gameData) {
            cc.log("非游戏数据.....................");
            return;
        }

        // 游戏的操作号，对应 OperationDefine
        let operationNo = gameData.operationNo;
        // 游戏服务返回的错误码
        let errorType = gameData.errorType;
        // 游戏内容
        let content = gameData.content;

    }

    send(gsData: any, targetData?: any) {
        // cc.log("send msg gsData: ", gsData);
        var socketData = new WebSocketData(gsData, targetData).toStringData();
        // cc.log("send msg : ", socketData);
        this.__webSocket.send(socketData);
    }

    /**
     * 心跳处理
     */
    heartbeatHandle() {
        if (this.__webSocket) {
            if (WebSocket.OPEN == this.__webSocket.readyState) {
                // 心跳超过2次就重新连接
                if (this.heartbeatNotResultCount >= 2) {
                    this.connect(this.__wsUrl);
                    return;
                }

                if (!this.isHeartbeatResult) {
                    this.heartbeatNotResultCount++;
                }
                this.isHeartbeatResult = false;
                this.send({ op: OperationDefine.C2GGW_Heartbeat, un: this.loginData.userName, tk: this.tokenData });
            } else {
                this.connect(this.__wsUrl);
            }
        }
    }

    startHeartbeatHandle() {
        this.stopHeartbeatHandle();
        // 10秒钟发送一次心跳
        this.heartbeatIntervalNumber = setInterval(this.heartbeatHandle, 10000);
    }

    stopHeartbeatHandle() {
        if (this.heartbeatIntervalNumber == -1) {
            return;
        }
        clearInterval(this.heartbeatIntervalNumber);
        this.heartbeatIntervalNumber = -1;
    }

    onWebSocketClose(event: Event) {
        cc.log("onWebSocketClose", event);
        this.stopHeartbeatHandle();
    }

    onWebSocketError(event: Event) {
        cc.log("onWebSocketError", event);
    }

}
