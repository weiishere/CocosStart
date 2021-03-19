import { XzddPeng } from "./XzddPeng";
import { XzddGang } from './XzddGang';
import { XzddHu } from './XzddHu';
import { XzddUIOpTingHuData } from './XzddUIOpTingHuData';
import { XzddAzimuth } from './XzddAzimuth';
import { XzddTing } from './XzddTing';

export class XzddGameOperation extends XzddAzimuth {
    /** 操作类型 */
    oprtType: number;
    peng: XzddPeng;
    gang: XzddGang;
    hu: XzddHu;
    ting: XzddTing;
    /** 剩下的牌 */
    spValuesSorted: number[];
    /** 可胡的牌数组 */
    huList: XzddUIOpTingHuData[];
}