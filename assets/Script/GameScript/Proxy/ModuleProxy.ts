import BaseProxy from "./BaseProxy";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';
import { WebSockerProxy } from './WebSocketProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { GateProxy } from './GateProxy';

/**
 * 模块代理类
 */
export abstract class ModuleProxy extends BaseProxy {

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    abstract getOp(): number;

    /**
     * 消息处理犯法
     * @param msgType 消息号
     * @param content 消息内容
     * @param errorCode 错误码
     */
    abstract handle(msgType: number, content: any, errorCode: number): void;

    /**
     * 服务器被停掉了
     */
    abstract serverShutDown(): void;

    getWebSocketProxy(): WebSockerProxy {
        return <WebSockerProxy>this.facade.retrieveProxy(ProxyDefine.WebSocket);
    }

    getGateProxy(): GateProxy {
        return <GateProxy>this.facade.retrieveProxy(ProxyDefine.Gate);
    }

    /**
     * 发送socket消息
     * @param op 操作号，对应 OperationDefine
     * @param msgType 消息号，每个模块有自己的消息号， ClubProtocol, DymjProtocol
     * @param content 消息内容
     * @param timeOutCallback 超时回调方法，如果5秒钟没有返回，自动调用该方法
     */
    sendGameData(msgType: number, content: any, timeOutCallback: (op: number, msgType: number) => void = null) {
        this.getWebSocketProxy().sendGameData(this.getOp(), msgType, content, timeOutCallback);
    }
}