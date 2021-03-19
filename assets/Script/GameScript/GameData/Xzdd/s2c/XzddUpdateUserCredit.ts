import { XzddPlayerChangedCredit } from './XzddPlayerChangedCredit';
/**
 * 
 players：有游戏点数变化的玩家。格式：{azimuth:int, credit:Number, changeCredit:Number}
        azimuth：玩家方位。
        credit：当前游戏点数。
        changeCredit：游戏操作导致的点数变化值。有正负。
        示例：
            一. 方位1玩家点炮方位2玩家：
            players = [{azimuth:1, credit:970, changeCredit:-30}, {azimuth:2, credit:1030, changeCredit:30}];
            二. 当前为钻石游戏，方位3玩家玩了红包游戏，引起余额变化
            players = [{azimuth:3, credit:980, changeCredit:0}];
        	
 *
 */
export class XzddUpdateUserCredit {
    players: XzddPlayerChangedCredit[];
}