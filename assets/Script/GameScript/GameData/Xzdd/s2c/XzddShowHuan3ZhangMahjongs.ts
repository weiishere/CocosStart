import { XzddPlayerChangedCredit } from './XzddPlayerChangedCredit';

export class XzddShowHuan3ZhangMahjongs {
    playerAzimuth: number;
    /** 推荐的换三张 */
    mahjongs: number[];
    /** 是否重复消息，如果之前收到过此消息，就不用再次处理该消息 */
    reContinueMessage: boolean;
}