import { XzddPlayerChangedCredit } from './XzddPlayerChangedCredit';

export class XzddOpHuan3ZhangMahjongsRsp {
    playerAzimuth: number;
    /** 换给别人的三张牌 */
    oldMahjongs: number[];
    /** 定张之后的手牌排序 */
    spValuesSorted: number[];
}