import { DymjPeng } from "./DymjPeng";
import { DymjGang } from './DymjGang';
import { DymjHu } from './DymjHu';
import { DymjUIOpTingHuData } from './DymjUIOpTingHuData';

export class DymjGameOperation {
    /** 操作类型 */
    oprtType: number;
    peng: DymjPeng;
    gang: DymjGang;
    hu: DymjHu;
    spValuesSorted: number[];
    /** 可胡的牌数组 */
    huList: DymjUIOpTingHuData[];
}