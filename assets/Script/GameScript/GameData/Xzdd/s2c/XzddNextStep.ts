import { XzddOperation } from './XzddOperation';
import { XzddTing } from './XzddTing';
export class XzddNextStep {
    /** 操作类型 */
    type: number;
    /** 与type值对应：不可出牌的牌值数组 */
    datas: number[];
    /** 与type值对应：显示操作面板消息中 (与disableValues) */
    oprts: XzddOperation[];
    /** 操作时间单位：s, 若该值 <= 0 则，会根据该房间的出牌时间计算得到响应时间 */
    time: number;
    /** args：附加参数, 为出牌后有叫的数据 */
    args: XzddTing;
    /** 是否自动打牌 */
    isAutoPut: boolean;
}