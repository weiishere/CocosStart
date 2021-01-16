import ViewComponent from '../Base/ViewComponent';
import { SpriteLoadUtil } from '../Other/SpriteLoadUtil';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { HttpUtil } from '../Util/HttpUtil';
import { GameRecordInfo } from '../GameData/GameRecordInfo';
import { RoomPlayerCredit } from '../GameData/RoomPlayerCredit';
import { RoomPlayLog } from '../GameData/RoomPlayLog';
import RecordDetail from './RecordDetail';
import { PlayerRecordData } from './RecordDetail';

const { ccclass, property } = cc._decorator;

export type RecorDetailData = {
    roomNo: number;
    currentGameCount: number;
    playerData: Array<PlayerRecordData>;
}

@ccclass
export default class RecordDetailList extends ViewComponent {

    @property(cc.Node)
    recordContent: cc.Node = null;
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
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
    }

    loadData(roomRoundNo: string) {
        this.recordContent.removeAllChildren();
        let url = this.getConfigProxy().facadeUrl + "record/getRoomPlayLogs";
        let param = {
            roomRoundNo: roomRoundNo,
        }
        LoginAfterHttpUtil.send(url, (response) => {
            let data: RoomPlayLog[] = <RoomPlayLog[]>response;
            this.buildData(data);
        }, (err) => {
        }, HttpUtil.METHOD_POST, param);
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

        script.loadData(true, this.getLocalCacheDataProxy().getLoginData().userName, recorDetailData.roomNo, recorDetailData.currentGameCount, totalLength, recorDetailData.playerData);
        this.recordContent.addChild(recordDetailNode);
    }

    // update (dt) {}
}