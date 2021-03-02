export class S2CPushDeal {
    roundNo: string;
    dicePoints: number[];
    spokers: string[];
    /** 标记当前局是否需要洗牌(断线恢复状态使用) */
    bIsShuffle: boolean;
    /**
     * 当前当前局发牌从洗牌开始后轮数偏移值, 从 0 开始, 每局固定的发 8 张牌(断线恢复状态使用)， 根据 status 值的不同,
     * 这里有可能是上一局的数据,也可能是当前局的数据.
     */
    sendPokerOffNum: number;
    shuffleMinDicePoint: number;
}