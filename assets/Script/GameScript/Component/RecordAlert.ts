import ViewComponent from '../Base/ViewComponent';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { RoomPlayLog } from '../GameData/RoomPlayLog';
import RecordDetail from './RecordDetail';
import { PlayerRecordData } from './RecordDetail';
import { RecorDetailData } from './RecordDetailList';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordPanel extends ViewComponent {

    @property(cc.Node)
    quitRoom: cc.Node = null;
    @property(cc.Node)
    goOnBtn: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Prefab)
    recordDetail: cc.Prefab = null;


    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
        this.quitRoom.on(cc.Node.EventType.TOUCH_END, () => {

        });
        this.goOnBtn.on(cc.Node.EventType.TOUCH_END, () => {

        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
    }

    loadData() {
        
    }

    buildData(data: RoomPlayLog[]) {
        let playLog: Map<string, RecorDetailData> = new Map();

        data.forEach(v => {
            let recorDetailData: RecorDetailData = playLog.get(v.roomRoundNo);
            if (!recorDetailData) {
                recorDetailData = {
                    currentGameCount: v.gameNum,
                    roomNo: v.roomNo,
                    playerData: [],
                };
                playLog.set(v.roomRoundNo, recorDetailData);
            }

            let gameParam = JSON.parse(v.extraParam);

            let playerRecordData: PlayerRecordData = {
                shouValues: gameParam.handMahjongs,
                huValues: gameParam.huMahjongs,
                pengValues: gameParam.pengMahjongs,
                gangValues: gameParam.gangMahjongs,
                huPaiName: gameParam.huPaiName,
                userName: v.userName,
                nickname: v.nickname,
                head: v.head,
                winloss: v.winloss
            }
            recorDetailData.playerData.push(playerRecordData);
        });

        for (const value of playLog.values()) {
            this.createRecordDetailItem(value, data.length);
        }
    }

    createRecordDetailItem(recorDetailData: RecorDetailData, totalLength: number) {
        let recordDetailNode = cc.instantiate(this.recordDetail);
        let script = <RecordDetail>recordDetailNode.getComponent("RecordDetail");
        recordDetailNode.y = 20;
        script.loadData(false, this.getLocalCacheDataProxy().getLoginData().userName, recorDetailData.roomNo, recorDetailData.currentGameCount, totalLength, recorDetailData.playerData);
        this.node.addChild(recordDetailNode);
    }

    // update (dt) {}
}