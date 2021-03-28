import { XzddPlayerChangedCredit } from './XzddPlayerChangedCredit';

export class XzddOpHuan3ZhangMahjongsBroadCast {
    playerAzimuth: number;
    /** 换牌规则  0: 对家    1: 顺时针  2: 逆时针 */
    type: number;
    /** 换给别人的三张牌 */
    oldMahjongs: number[];
    /** 换给自己的牌 */
    newMahjongs: number[];
    /** 排序后的手牌排序 */
    spValuesSorted: number[];
}