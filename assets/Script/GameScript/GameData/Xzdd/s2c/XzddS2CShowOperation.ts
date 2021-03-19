import { XzddAzimuth } from './XzddAzimuth';
import { XzddOperation } from './XzddOperation';
/**
 * 提示操作
 */
export class XzddS2CShowOperation extends XzddAzimuth {
    /** 操作时间 */
    time: number;
    /** 操作列表 */
    oprts: XzddOperation[];
    /** 是否重发消息 */
    reContinueMessage: boolean;
}