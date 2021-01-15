/**
 * 玩家的发牌数据
 */
export class DymjPlayerDealData {
    name: string; // 玩家名。
    acctNickname: string; //昵称
    head: string; //头像
    vip: boolean; //是否是VIP
    vipLevel: number; //等级
    azimuth: number; //方位。目前可能值：1、2、3、4 分别对应 东、南、西、北。
    /** 是否为庄。 */
    isBank: boolean;
    credit: number; //可用点数。系统结算时，为预扣后的可用点数。

    initSpValuesUnsorted: number[];//未排序的手牌。当前玩家为有效的牌值，其他玩家为牌值均为0的数组。

    //玩家手上的牌（只有自家的牌才会有数据，其他玩家的手牌为空,自家的牌是排序后的。
    //把后台排序后的手牌麻将给前台，前台省却排序算法（不同地方麻将的排序算法可能不同，这些不同要不要前台处理？）
    //先为了简单，后台处理，但是通信上会额外增加了不少冗余数据。因为每次操作后，都需要更新前台的手牌数据。
    //但是摸牌有点特殊，后台摸牌后就对新的14张牌排序了，前方效果需要先不更新手牌，显示摸到的牌，然后更换新的手牌。
    initSpValuesSorted: number[];//排序后的手牌。当前玩家为有效的牌值，其他玩家为牌值均为0的数组。
}