import { DymjAzimuth } from './DymjAzimuth';
import { DymjNextStep } from './DymjNextStep';
/**
 * 推送的摸牌数据
 */
export class DymjS2CPlayerGet extends DymjAzimuth {
    getMjValue: number;
    nextStep: DymjNextStep;
}