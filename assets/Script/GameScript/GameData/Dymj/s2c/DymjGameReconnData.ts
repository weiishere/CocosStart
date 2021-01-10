import { DymjPlayerReconnData } from './DymjPlayerReconnData';
export class DymjGameReconnData {
    deskNo: string; //局号。
    iceValueArr: number[]; //骰子点数和值。
    lastPutPlayerAzimuth: number; //重连进入时最后打牌方位。
    lastPutMjValue: number; //重连进入时最后出牌值。
    dealNumForRound: number;  //每轮发牌数量。
    players: DymjPlayerReconnData[]; //玩家数组。

    /***************************************************
     **************  COCOS 版本新增加    ******************
     **************************************************/
    isReady: boolean = false; //玩家是否已准备
    waitingPlayerAzimuth: number = -1; //等待用户操作的方位
    waitingTime: number; //等待操作的时间
    deskState: number; //桌子的状态
    /** 牌墙剩余个数 */
    lastCount: number;
}