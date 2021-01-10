import { DymjPlayerDealData } from './DymjPlayerDealData';
/**
 * 发牌数据
 */
export class DymjS2CBeginDealData {
    deskNo: string; //局号。
    diceNum: number; //骰子点数和值。
    dealNumForRound: number; //每轮发牌数量。当牌数发至少于该值时，将把剩余的牌一起发个玩家。

    players: DymjPlayerDealData[];

    diceValueArr: number[]; //单个骰子点数数组。长度可作为骰子个数
}