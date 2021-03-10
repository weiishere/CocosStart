export class ResultDataLite {
    /** 对应类型  TuiTongZiSuitType */
    type: number;
    /** 点数，只有type 为 TuiTongZiSuitType.POINT_POKER时才使用这个值，如果 一点半，point = 1.5 */
    point: number;
    /** 结果倍数 */
    odds: number;
}