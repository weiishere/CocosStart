import { DymjGameUIResultItem } from './DymjGameUIResultItem';
import { DymjPlayerGameResult } from './DymjPlayerGameResult';
export class DymjGameResult {
    boardNo: string; // 局号。用于结算面板中局号的显示。当为null或空字符串时，将显示“本局结算”，否则显示“第@{boardNo}局结算”。
    /** 自动继续游戏时间。单位：s。当该值 > 0 时有效性；<= 0 时，被视为无需自动继续。 */
    time: number; // 自动继续游戏时间。单位：s。当该值 > 0 时有效性；<= 0 时，被视为无需自动继续。
    /** 结算列表 */
    list: DymjGameUIResultItem[]; // /结算列表。 格式：
    /** 玩家数据。格式： */
    players: DymjPlayerGameResult[]; // 玩家数据。格式：
    /** 是否有继续按钮。非0值为有继续按钮 */
    hasContinue: number = 1; // 是否有继续按钮。非0值为有继续按钮;
    /** 是否留局 */
    isLiuJu: boolean = false;
    /** 当前游戏局数 */
    currentGameCount: number;
    /** 总的局数 */
    totalGameCount: number;
    /** 房间号 */
    roomNo: number
}