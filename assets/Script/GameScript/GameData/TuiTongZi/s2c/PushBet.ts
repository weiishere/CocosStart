import { RoomInfo } from "./RoomInfo";

export class PushBet {
    /** 下注位置类型 */
    betType: number;
    /** 下注金额 */
    betVal: number;
    /** 位置的下注总值 */
    totalBetVal: number;
}