import { DymjCanHuData } from './DymjCanHuData';
export class DymjTingItem {
    /** 需要打出的牌值  */
    putValue: number;
    /** 可胡的牌数组 */
    huList: Array<DymjCanHuData>;
}