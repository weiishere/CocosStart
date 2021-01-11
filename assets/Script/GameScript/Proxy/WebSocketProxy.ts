import { LocalCacheDataProxy } from './LocalCacheDataProxy';
import { LoginData } from '../GameData/LoginData';
import { OperationDefine } from '../GameConst/OperationDefine';
import Proxy from '../../Framework/patterns/proxy/Proxy';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';
import { ServerCode } from '../GameConst/ServerCode';
import { DymjProtocol } from '../Protocol/DymjProtocol';
import { ModuleProxy } from './ModuleProxy';
import { ClubProxy } from './ClubProxy';
import { UserGold } from '../GameData/UserGold';
import { DymjProxy } from './DymjProxy';
import { GateProxy } from './GateProxy';

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


class SendMsgData {
    op: number;
    msgType: number;
    time: number;
    callback: (op: number, msgType: number) => void;

    constructor(op: number, msgType: number, time: number, callback: (op: number, msgType: number) => void) {
        this.op = op;
        this.msgType = msgType;
        this.time = time;
        this.callback = callback;
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

    /** 待返回数据 */
    private waitResultData: Map<string, SendMsgData> = new Map();
    /** 模块代理类 */
    private moduleProxyMap: Map<number, ModuleProxy> = new Map();

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    connect(wsUrl: string) {
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
        this.__webSocket.onopen = this.onWebSocketOpen.bind(this);
        this.__webSocket.onmessage = this.onWebSocketMessage.bind(this);
        this.__webSocket.onclose = this.onWebSocketClose.bind(this);
        this.__webSocket.onerror = this.onWebSocketError.bind(this);
    }

    getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    getGateProxy(): GateProxy {
        return <GateProxy>this.facade.retrieveProxy(ProxyDefine.Gate);
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

        if (this.errorCodeHandle(errorCode)) {
            return;
        }

        switch (op) {
            case OperationDefine.Authentication:
                this.gateWayLoginRes(resData);
                break;
            case OperationDefine.USER_GOLD_CHANGE:
                let userGold = <UserGold>JSON.parse(dt.content);
                this.handleUpdateGold(userGold);
                break;
            case OperationDefine.C2GGW_Heartbeat:
                // 心跳返回
                this.isHeartbeatResult = true;
                break;
            case OperationDefine.Server_Shutdown:
                // 服务停止消息的通知
                // 被停掉的OP号
                let shutdownOp = dt.content;
                // 模块处理方法
                let moduleProxy = this.moduleProxyMap.get(shutdownOp);
                if (moduleProxy) {
                    moduleProxy.serverShutDown();
                }
                this.getGateProxy().toast("服务器开小差了，请稍候再试！");
                break;
            case OperationDefine.Server_Goneaway:
                cc.log(dt.content + " 服务不存在");
                this.getGateProxy().toast("服务不存在！");
                break;
        }
    }

    private handleUpdateGold(userGold: UserGold): void {
        cc.log("金币变化: ", userGold);
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        loginData.gold = userGold.newGold;
        this.getLocalCacheDataProxy().setLoginData(loginData);
        this.sendNotification(CommandDefine.UpdatePlayerGold, userGold);
    }

    private errorCodeHandle(errorCode: number): boolean {
        if (errorCode == ServerCode.SUCCEED) {
            return false;
        }

        cc.log("网关返回错误码: ", errorCode);
        return true;
    }

    /**
     * 网关登录成功返回
     */
    gateWayLoginRes(resData) {
        this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.Authentication);
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
        // 消息号
        let msgType = gameData.msgType;
        // 游戏服务返回的错误码
        let errorType = gameData.errorType;
        // 游戏内容
        let content = gameData.content;

        this.deleteSendMsgData(operationNo, msgType);

        // 模块处理方法
        let moduleProxy = this.moduleProxyMap.get(operationNo);
        if (moduleProxy) {
            moduleProxy.handle(msgType, content, errorType);
        }
    }

    /**
     * 发送socket消息
     * @param op 操作号，对应 OperationDefine
     * @param msgType 消息号，每个模块有自己的消息号， ClubProtocol, DymjProtocol
     * @param content 消息内容
     * @param timeOutCallback 超时回调方法，如果5秒钟没有返回，自动调用该方法
     */
    sendGameData(op: number, msgType: number, content: any, timeOutCallback: (op: number, msgType: number) => void = null) {
        let messageObj = {
            msgType: msgType,
            content: content,
            messNum: 0
        }

        // 由于麻将的客户端发送消息和返回的消息号不一致，这里做了一个转换
        if (op === OperationDefine.DA_YI_ER_REN_MAHJONG) {
            msgType = DymjProtocol.dymjMsgTypeConvert(msgType);
        }

        let msgKey = op + "-" + msgType;

        let sendMsgData = this.waitResultData.get(msgKey);
        if (sendMsgData) {
            cc.log(msgKey, "消息还没有返回，已运行时长:", sendMsgData.time);
            return;
        }

        if (timeOutCallback) {
            this.waitResultData.set(msgKey, new SendMsgData(op, msgType, 5, timeOutCallback));
        }

        this.send({ op: op }, messageObj);
    }

    deleteSendMsgData(op: number, msgType: number) {
        let msgKey = op + "-" + msgType;
        this.waitResultData.delete(msgKey);
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
        this.heartbeatIntervalNumber = setInterval(this.heartbeatHandle.bind(this), 10000);
    }

    stopHeartbeatHandle() {
        if (this.heartbeatIntervalNumber == -1) {
            return;
        }
        clearInterval(this.heartbeatIntervalNumber);
        this.heartbeatIntervalNumber = -1;
    }

    /**
     * 超时消息定时任务
     */
    timeoutMsgTimedTask() {
        this.waitResultData.forEach((sendMsgData: SendMsgData, key: string) => {
            if (sendMsgData.time <= 0) {
                this.waitResultData.delete(key);
                this.handleTimeoutMsg(sendMsgData);
            }
            sendMsgData.time--;
        })
    }

    /** 处理超时的定时任务 */
    handleTimeoutMsg(sendMsgData: SendMsgData) {
        if (sendMsgData.callback) {
            sendMsgData.callback(sendMsgData.op, sendMsgData.msgType);
            // 提示某个消息已经超时了
            this.getGateProxy().toast("连接服务器超时，请检查您的网络是否正常！");
        }
    }

    onWebSocketClose(event: Event) {
        cc.log("onWebSocketClose", event);
        this.stopHeartbeatHandle();
    }

    onWebSocketError(event: Event) {
        cc.log("onWebSocketError", event);
    }

    addModuleProxy(moduleProxy: ModuleProxy) {
        if (!moduleProxy) {
            return;
        }

        if (this.moduleProxyMap.has(moduleProxy.getOp())) {
            return;
        }

        this.facade.registerProxy(moduleProxy);
        this.moduleProxyMap.set(moduleProxy.getOp(), moduleProxy);
    }

    deleteModuleProxy(op: number) {
        let moduleProxy = this.moduleProxyMap.get(op);
        if (moduleProxy) {
            this.facade.removeProxy(moduleProxy.getProxyName());
        }
        this.moduleProxyMap.delete(op);
    }

    onRegister() {
        setInterval(this.timeoutMsgTimedTask.bind(this), 1000);

        // 默认注册俱乐部代理
        this.addModuleProxy(new ClubProxy(ProxyDefine.Club));
        this.addModuleProxy(new DymjProxy(ProxyDefine.Dymj));
    }
}
