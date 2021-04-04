import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import CardItemView from '../DdYiMahjong/CardItemView';
const { ccclass, property } = cc._decorator;

export type PlayerRecordData = {
    userName: string,
    head: string,
    nickname: string,
    huPaiName: string,
    seatNo: number;
    winloss: number,
    pengValues: number[],
    gangValues: number[],
    shouValues: number[],
    huValues: number[],
    detailRemark: string[],
}

@ccclass
export default class BaseRecordDetail extends ViewComponent {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Label)
    roomNoLabel: cc.Label = null;
    @property(cc.Label)
    roundLabel: cc.Label = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;

    protected bindUI(): void {

    }
    protected bindEvent(): void {
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
    }

    loadData(showBG: boolean, userName: string, roomNo: number, currentGameCount: number, totalGameCount: number,
        playerData: Array<PlayerRecordData>, gameSubClass: number, timer?: string) {
    }

}
