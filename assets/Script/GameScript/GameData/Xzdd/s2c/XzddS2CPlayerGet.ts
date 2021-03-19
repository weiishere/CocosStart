import { XzddAzimuth } from './XzddAzimuth';
import { XzddNextStep } from './XzddNextStep';
/**
 * 推送的摸牌数据
 */
export class XzddS2CPlayerGet extends XzddAzimuth {
    getMjValue: number;
    /** 摸牌后的下一步操作 */
    nextStep: XzddNextStep;
    /** 剩余牌 */
    cardRemainCount: number;
}