import { XzddAzimuth } from './XzddAzimuth';

export class XzddGang extends XzddAzimuth {
    /** 是否自杠 */
    isSelf: boolean;
    /** 可杠的牌数组 */
    mjValues: number[];
    /** 杠类型 0:点杠 1:弯杠 2:暗杠 */
    gangType: number;
    /** 是否自动杠牌 */
    isAutoGang: boolean;
}