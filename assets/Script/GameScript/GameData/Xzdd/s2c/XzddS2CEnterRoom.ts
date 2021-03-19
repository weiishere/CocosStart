import { XzddBaseRoomData } from '../XzddBaseRoomData';
import { XzddPlayerInfo } from './XzddPlayerInfo';
/**
 * 进入房间返回
 */
export class XzddS2CEnterRoom extends XzddBaseRoomData {
    playType: number; //玩法。请求原样返回。
    balanceType: number; //结算方式。可能值：
    //系统结算
    //		BALANCE_TYPE_SYSTEM:int = 0;
    //		//自行结算
    //		BALANCE_TYPE_OWN:int = 1;
    roomName: string; //厅名称。休闲玩法时为空，比赛玩法时为比赛名，包间玩法时为包间名
    /** 是否可以重连 */
    reconnect: boolean;
    /** 比赛中额外货币的类型 */
    moneyCurrency: string;
    currentRoundNo: number;	//当前完成的游戏局数
    houseOwner: string;	//房主
    rules: number[]; //规则
    roundMark: string;
    totalRound: number;
    /** GPS开关 */
    gps: boolean;
    /** ip检查开关 */
    preventCheatin: boolean;
    /** gps距离 */
    gpsDistance: number;
    players: any;
}