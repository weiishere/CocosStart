import { S2CClubRoomPlayerInfo } from './S2CClubRoomPlayerInfo';
export class S2CClubRoomInfoBase {
    gameSubClass: number;
    /** 最大座位数 */
    maxPlayerNum: number;
    /** 总的游戏局数 */
    gameCount: number;
    /** 当前游戏局数 */
    currentGameCount: number;
    /** 当前玩家人数 */
    currentPlayerNum: number;
    /** 底分 */
    basicScore: number;
    /** 包间号 */
    roomNo: number;
    /** 消费类型 */
    consumptionType: string;
    /** 用户信息 */
    userInfos: Array<S2CClubRoomPlayerInfo>;
    /** 准入 */
    enterLimit: number;
    /** 房间类型 */
    roomType: number;
    /** 游戏详细参数 */
    gameParam: string;
}