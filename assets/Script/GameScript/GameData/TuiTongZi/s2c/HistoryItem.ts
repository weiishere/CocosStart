import { ResultDataLite } from "./ResultDataLite";

export class HistoryItem {
    /** 牌值，数组长度固定为8
     *  依地按照 庄、顺、迁、尾 取值，每个取两个
     */
    pokers: string[];
    /** 牌型结果，数组长度为4，分别对应 庄、顺、迁、尾 */
    resultData: ResultDataLite[];
    gameNo: string;
}