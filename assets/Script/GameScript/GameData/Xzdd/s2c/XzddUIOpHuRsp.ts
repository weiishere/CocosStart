export class XzddUIOpHuRsp {
    playerAzimuth: number;   //被胡的方位。自摸时，是自己的方位；抢杠时，是被抢杠一方的方位；点炮时，是点炮方方位；
    mjValue: number;   //被胡的牌值。
    huType: number;   //胡类型。
    isAfterGang: boolean = false;   //是否是杠牌后的胡牌。兰州麻将暂不关心该值.
    explosiveCount: number = 1;   //响的次数。默认值为1。有一炮多响规则时，此值会>1。
}