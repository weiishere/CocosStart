import { DymjPeng } from "./DymjPeng";
import { DymjGang } from './DymjGang';
import { DymjHu } from './DymjHu';
import { DymjTing } from './DymjTing';

export class DymjOperation {
    /** 操作类型 对应 DymjOperationType */
    oprtType: number;
    peng: DymjPeng;
    gang: DymjGang;
    hu: DymjHu;
    ting: DymjTing;
    // public CocosTing ting;
}