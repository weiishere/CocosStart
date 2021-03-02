import { RoomInfo } from "./RoomInfo";

export class DeskBankerPlayer {
    acctName: string;
    nickname: string;
    money: number;
    // 当前坐庄局数
    totalBankerNum: number;
    // 最大连续坐庄局数
    maxBankerNum: number;
    // 玩家头像 id or url
    headName: string;

    sex: string;
    /** 当庄占成比. 如 99.99 的字符串 */
    percent: string;
}