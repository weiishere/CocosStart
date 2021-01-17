import ViewComponent from '../Base/ViewComponent';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { RoomPlayLog } from '../GameData/RoomPlayLog';
import RecordDetail from './RecordDetail';
import { PlayerRecordData } from './RecordDetail';
import { RecorDetailData } from './RecordDetailList';
import { DymjGameResult } from '../GameData/Dymj/s2c/DymjGameResult';
import { DymjGameUIResultItem } from '../GameData/Dymj/s2c/DymjGameUIResultItem';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordPanel extends ViewComponent {

    @property(cc.Node)
    quitRoom: cc.Node = null;
    @property(cc.Node)
    goOnBtn: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Label)
    countdownLabel: cc.Label = null;
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

    startNextRoundBtnCountdown(time: number) {
        if (this.quitRoom.active) {
            return;
        }
        if (time <= 0) {
            return;
        }
        this.schedule(() => {
            time--;
            this.countdownLabel.string = time + "";
        }, 1, time);
    }

    getResultDesc(list: DymjGameUIResultItem[]) {
        for (const value of list) {
            if (value.itemType === 6 || value.itemType === 7) {
                return value.name;
            }
        }

        return "";
    }

    getResultWinloss(list: DymjGameUIResultItem[], azimuth: number) {
        for (const value of list) {
            if (value.type === 'total') {
                if (azimuth === 0) {
                    return value.azimuth1;
                } else if (azimuth === 1) {
                    return value.azimuth2;
                } else if (azimuth === 2) {
                    return value.azimuth3;
                } else if (azimuth === 3) {
                    return value.azimuth4;
                }
            }
        }

        return 0;
    }

    buildData(dymjGameResult: DymjGameResult) {
        let recorDetailData: RecorDetailData = {
            roomNo: dymjGameResult.roomNo,
            currentGameCount: dymjGameResult.currentGameCount,
            playerData: []
        }

        // 是否显示退出按钮
        this.quitRoom.active = dymjGameResult.currentGameCount >= dymjGameResult.totalGameCount
        this.startNextRoundBtnCountdown(dymjGameResult.time);

        let huPaiName = this.getResultDesc(dymjGameResult.list);
        dymjGameResult.players.forEach(v => {
            let winlossScore = this.getResultWinloss(dymjGameResult.list, v.azimuth);
            let shouValues = [];
            let pengValues = [];
            let gangValues = [];
            if (v.shouValues) {
                shouValues = v.shouValues;
            }
            if (v.pengValues) {
                pengValues = v.pengValues;
            }
            if (v.gangValues) {
                gangValues = v.gangValues;
            }

            let huValues = [];
            if (v.huValues) {
                v.huValues.forEach(huValue => {
                    huValues.push(huValue.value);
                });
            }

            let playerRecordData: PlayerRecordData = {
                shouValues: shouValues,
                huValues: huValues,
                pengValues: pengValues,
                gangValues: gangValues,
                huPaiName: huPaiName,
                userName: v.userName,
                nickname: v.nickname,
                head: v.head,
                winloss: winlossScore
            }

            recorDetailData.playerData.push(playerRecordData);
        });

        this.createRecordDetailItem(recorDetailData, dymjGameResult.totalGameCount);
    }

    createRecordDetailItem(recorDetailData: RecorDetailData, totalLength: number) {
        let recordDetailNode = cc.instantiate(this.recordDetail);
        let script = <RecordDetail>recordDetailNode.getComponent("RecordDetail");
        recordDetailNode.y = 66;
        script.loadData(false, this.getLocalCacheDataProxy().getLoginData().userName, recorDetailData.roomNo, recorDetailData.currentGameCount, totalLength, recorDetailData.playerData);
        this.node.addChild(recordDetailNode);
    }

    // update (dt) {}
}