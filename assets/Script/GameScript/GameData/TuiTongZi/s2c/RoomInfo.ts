import { HistoryItem } from "./HistoryItem";

export class RoomInfo {
    /** 房间ID */
    id: number;
    /** 最小限红 */
    minlimit: number;
    /** 最大限红 */
    maxlimit: number;
    /** 历史 */
    historyList: HistoryItem[];
    /**
     * 倒计时
     */
    duration: number;
    /** 准入限制 */
    minBet: number;
    roomName: string;
    bankerType: number;
}