import { XzddGang } from './XzddGang';
import { XzddPlayerInfo } from './XzddPlayerInfo';
import { UIOpPengRsp } from './UIOpPengRsp';
import { UIOpHuRsp } from './UIOpHuRsp';
export class XzddPlayerReconnData {
    playerInfo: XzddPlayerInfo;
    isBank: boolean; //是否为庄。
    isTing: boolean;  //是否已经听牌。
    isTingQingHu: boolean;  //是否已经报请胡。
    shouValues: number[]; // 手牌数组。已经排序好的手牌。格式：[int]。
    gangValues: XzddGang[]; //杠牌数组。格式：[{playerAzimuth:int, mjValue:int, gangType:int}]。
    pengValues: UIOpPengRsp[];  //碰牌数组。格式：[{playerAzimuth:int, mjValue:int}]。
    huValues: UIOpHuRsp[]; //胡牌数组。格式：
    //[{playerAzimuth:int, mjValue:int, huType:int, isAfterGang:Boolean, explosiveCount:int}]。
    chuValues: number[]; //出牌数组。按照出牌顺序排列。格式：[int]。
    //如果有定章功能，在定章牌没有翻开之前，不将定章牌归于出牌中。翻开后，就放入出牌中了。
    //甩出的牌归于出牌中。
    dingzhang: any; //定章对象。当有定章功能且玩家已经进行了定章才有值，否则为null。[TODO]四川麻将时再补充
    //		格式：{mjValue:int, dingzhangType:int, isQue:Boolean, isPutDingzhang:Boolean}
    //		mjValue：定章值。如果玩家已经定章，当前玩家为实际牌值，其他玩家为 0；缺时均为 -1。
    //		dingzhangType：定章类型。翻定章后为有效值（参考定章消息）；未翻定章时，当前玩家为有效值，其他玩家为 -1。
    //		isQue：是否为缺。
    //		isPutDingzhang：是否已经翻开定章。
    /** 是否认输 */
    isGiveUp: boolean;
    huanValues: number[]; //在等待其他玩家选择换牌的阶段时有效, 用户自己选择的换牌
}