export class XzddShowDingZhangMahjongs {
    /** 定张方位，一般就自己的方位 */
    playerAzimuth: number;
    /** 定张倒计时 */
    time: number;
    /** 定缺类型，0：万 1： 筒 2： 条， 数组只有一个，就是提示玩家缺该门牌最优的 */
    queTypes: number[];
    /** 是否重复消息，如果之前收到过此消息，就不用再次处理该消息 */
    reContinueMessage: boolean;
}