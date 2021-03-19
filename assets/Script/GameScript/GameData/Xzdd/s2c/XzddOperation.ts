import { XzddPeng } from "./XzddPeng";
import { XzddGang } from './XzddGang';
import { XzddHu } from './XzddHu';
import { XzddTing } from './XzddTing';

export class XzddOperation {
    /** 操作类型 对应 XzddOperationType */
    oprtType: number;
    peng: XzddPeng;
    gang: XzddGang;
    hu: XzddHu;
    ting: XzddTing;
    // public CocosTing ting;
}