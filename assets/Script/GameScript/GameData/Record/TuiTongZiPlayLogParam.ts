import { TuiTongZiPlayLogParamResultData } from "./TuiTongZiPlayLogParamResultData";

export class TuiTongZiPlayLogParam {
    /** 所有牌，顺序：庄家、顺们、迁门、尾门 */
    pokers: string[];
    /** 结果 */
    results: TuiTongZiPlayLogParamResultData[];
    /** 位置下注金额 顺序：顺们、迁门、尾门 */
    bets: number[];
    /** 输赢 */
    winloss: number;
    /** 余额占比 */
    percent: string;
}