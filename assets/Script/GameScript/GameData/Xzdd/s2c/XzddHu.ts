import { MahjongInfo } from "./XzddMahjongInfo";

export class XzddHu extends MahjongInfo {
    /** 是否自摸 */
    isSelf: boolean;
    /** 是否自动胡 */
    isAutoHu: boolean;
    /** 胡类型 0：点炮 1：自摸 2：抢杠 */
    huType: number;
    /** 是否杠牌后的胡牌 */
    isAfterGang: boolean;
    /** 响的次数。默认值为1。有一炮多响规则时，此值会>1 */
    explosiveCount: number;
    /** 是否五对 */
    isWuDui: boolean;
    /** 是否请胡 */
    isQingHu: boolean;
}