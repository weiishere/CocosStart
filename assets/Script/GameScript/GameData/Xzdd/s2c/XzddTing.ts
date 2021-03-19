import { MahjongInfo } from "./XzddMahjongInfo";
import { XzddTingItem } from './XzddTingItem';

export class XzddTing extends MahjongInfo {
    list: Array<XzddTingItem>;
    /** 是否为听-胡，表示选择的牌是打出，还是胡。默认值 false ，代表常规听牌，选择牌将打出。而 true 时，则代表选择的牌为胡牌。 */
    isHu: boolean;
    isBaoQingHu: boolean;
}