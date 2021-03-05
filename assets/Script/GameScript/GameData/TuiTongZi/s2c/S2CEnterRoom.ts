import { BankerQueuePlayer } from "./BankerQueuePlayer";
import { DeskBankerPlayer } from "./DeskBankerPlayer";
import { DeskPlayer } from "./DeskPlayer";
import { OddsTable } from "./OddsTable";
import { PlayerBet } from "./PlayerBet";
import { RoomInfo } from "./RoomInfo";

export class S2CEnterRoom {
    /** 房间号 */
    machineId: number;
    deskNo: string;
    limit: number;
    /** 所有玩家信息 */
    players: DeskPlayer[];
    /** 规则 */
    oddstable: OddsTable[];
    /** 总的玩家人数 */
    playerNums: number;
    /** 玩家当前余额 */
    money: number;
    /** 等待上庄列表 */
    bankerWaitList: BankerQueuePlayer[];
    /** 坐庄玩家列表 */
    bankerPlayer: DeskBankerPlayer[];
    /** 上庄限制 */
    upBankerLimit: number;
    /** 玩家已下注金额 */
    restoreAllPlayerBetVals: PlayerBet[];
    /** 游戏状态 对应 TuiTongZiRoomGameStatus */
    status: number;
    roundNo: string;
    /** 骰子点数 */
    dicePoints: number[];
    /** 下庄条件 */
    minContinueTakeBankerMoney:number;
    /** 最大赔率 */
    maxOdds: number;
    /** 标识当前玩法是单人, 还是多人当庄 0：表示单人 1：表示多人 */
    bankerType: number;
    /** 明 1 张时的发牌数据, 顺序结构同 SPushDeskSendingPoker 中的 pokers */
    spokers: string[];
    /** 标记是否是每局都需要洗牌,如果不是,每局结束后不能清理桌面的牌 */
    bIsShuffleEveryRound: boolean;
    /** 标记当前局是否需要洗牌(断线恢复状态使用) */
    bIsShuffle: boolean;
    /**
     * 当前当前局发牌从洗牌开始后轮数偏移值, 从 0 开始, 每局固定的发 8 张牌(断线恢复状态使用)， 根据 status 值的不同,
     * 这里有可能是上一局的数据,也可能是当前局的数据.
     */
    sendPokerOffNum: number;
    /** 洗牌时的最小骰子点数 */
    shuffleMinDicePoint: number;
}