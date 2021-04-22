import { XzddGangHuTypeValue } from './XzddGangHuTypeValue';

/**
 * 
 [{azimuth:int, credit:Number, shouValues:Array, huValues:Array, gangValues:Array, pengValues:Array, chiValues:Array}]
        azimuth：玩家方位。
        credit：可用点数。结算后的可用点数。
        shouValues：手牌数组。格式：[int]。排好需的手牌。
        huValues：胡牌数组。需要数组按照玩家“胡”牌顺序排列。格式：
            方案一：[int]。如：[5, 3, 7]。
            方案二：[{value:int, type:int}]。（暂定方案）
                value：胡牌值。
                type：胡类型。参看“进行操作”消息。
        gangValues：杠牌数组。需要数组按照玩家“杠”牌顺序排列。格式：
            方案一：[int]。如：[9, 2, 3]。
            方案二：[{value:int, type:int}]。（暂定方案）
                value：杠牌值。
                type：杠类型。参看“进行操作”消息。
        pengValues：碰牌数组。需要数组按照玩家“碰”牌顺序排列。格式：[int]。如：[8, 1, 4]。
        chiValues：吃牌数组。需要数组按照玩家“吃”牌顺序排列。格式：[Array]。如：[[6,7,8], [2,3,4], [4,5,6]]。
    	
 *
 */
export class XzddPlayerGameResult {
    azimuth: number; //玩家方位。
    credit: number; //可用点数。结算后的可用点数。
    shouValues: number[]; //手牌数组。格式：[int]。排好需的手牌。
    huValues: XzddGangHuTypeValue[]; //胡牌数组。需要数组按照玩家“胡”牌顺序排列。格式：
    //		方案一：[int]。如：[5, 3, 7]。
    //		方案二：[{value:int, type:int}]。（暂定方案）
    //			value：胡牌值。
    //			type：胡类型。参看“进行操作”消息。
    gangValues: XzddGangHuTypeValue[]; //杠牌数组。需要数组按照玩家“杠”牌顺序排列。格式：
    //		方案一：[int]。如：[9, 2, 3]。
    //		方案二：[{value:int, type:int}]。（暂定方案）
    //			value：杠牌值。
    //			type：杠类型。参看“进行操作”消息。
    pengValues: number[]; //碰牌数组。需要数组按照玩家“碰”牌顺序排列。格式：[int]。如：[8, 1, 4]。
    /** 昵称 */
    nickname: string;
    /** 头像 */
    head: string;
    /** vip等级 */
    vipLevel: number;
    /** VIP是否有效 */
    isVipActive: boolean;
    userName: string;
    /** 胡牌顺序 */
    huOrder: number;
}