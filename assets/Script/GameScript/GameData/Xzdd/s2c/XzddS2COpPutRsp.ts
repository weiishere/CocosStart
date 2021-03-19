import { XzddUIOpTingHuData } from './XzddUIOpTingHuData';
import { XzddAzimuth } from './XzddAzimuth';
/**
 * 推送的出牌数据
 */
export class XzddS2COpPutRsp extends XzddAzimuth {
    putMjValue: number;    //出牌值。
    spValuesSorted: number[];    //排序后的手牌。如果该值为null，则前台将按照牌值从小到大排序。可以考虑非己方的操作，该值为null.
    /** 玩家可胡牌的值 */
    huList: XzddUIOpTingHuData[];
    /** 是否请胡 */
    isQingHu: boolean;
    /** 是否报胡 */
    isBaoHu: boolean;
}