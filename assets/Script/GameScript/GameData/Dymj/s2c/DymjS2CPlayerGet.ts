import { DymjAzimuth } from './DymjAzimuth';
import { DymjNextStep } from './DymjNextStep';
/**
 * 推送的摸牌数据
 */
export class DymjS2CPlayerGet extends DymjAzimuth {
    getMjValue: number;
    /** 摸牌后的下一步操作 */
    nextStep: DymjNextStep;
    /** 剩余牌 */
    cardRemainCount: number;
}