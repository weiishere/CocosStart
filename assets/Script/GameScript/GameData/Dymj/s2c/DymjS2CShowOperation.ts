import { DymjAzimuth } from './DymjAzimuth';
import { DymjOperation } from './DymjOperation';
/**
 * 提示操作
 */
export class DymjS2CShowOperation extends DymjAzimuth {
    /** 操作时间 */
    time: number;
    /** 操作列表 */
    oprts: DymjOperation[];
    /** 是否重发消息 */
    reContinueMessage: boolean;
}