import { BankerBalance } from "./BankerBalance";
import { PlayerBalance } from "./PlayerBalance";
import { ResultData } from "./ResultData";

export class S2CPushRoomPoker {
    /** 牌值，数组长度固定为8
     *  依地按照 庄、顺、迁、尾 取值，每个取两个
     */
    pokers: string[];
    /** 牌型结果，数组长度为4，分别对应 庄、顺、迁、尾 */
    results: ResultData[];
    /** 每个位置是输赢，顺序为： 顺、迁、尾 */
    winMoney: number[];
    /** 每个位置输赢类型，顺序为： 顺、迁、尾，1：表示赢 0：表示输 */
    winTypes: number[];
    /** 余额 */
    money: number;
    /** 所有下注玩家的结算 */
    playerBalance: PlayerBalance[];
    gameNo: string;
    /** 有人下注，可能是庄家使用的参数 */
    bankerAnyBet: boolean;
    /** 庄家结算 */
    bankerBalance: BankerBalance[];
}