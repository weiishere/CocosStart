import { DymjPeng } from "./DymjPeng";
import { DymjGang } from './DymjGang';
import { DymjHu } from './DymjHu';
import { DymjUIOpTingHuData } from './DymjUIOpTingHuData';
import { DymjAzimuth } from './DymjAzimuth';

export class DymjGameOperation extends DymjAzimuth {
    /** 操作类型 */
    oprtType: number;
    peng: DymjPeng;
    gang: DymjGang;
    hu: DymjHu;
    /** 剩下的牌 */
    spValuesSorted: number[];
    /** 可胡的牌数组 */
    huList: DymjUIOpTingHuData[];
}