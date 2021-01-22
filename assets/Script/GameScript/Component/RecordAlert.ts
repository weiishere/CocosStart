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
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { DymjProxy } from '../Proxy/DymjProxy';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordAlert extends ViewComponent {

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
        this.closeBtn.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(this.closeBtn).to(0.1, { scale: 1.1 }).to(0.1, { scale: 1 }).call(() => this.node.destroy()).start();
        });
        this.quitRoom.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(this.quitRoom).to(0.1, { scale: 1.1 }).to(0.1, { scale: 1 }).call(() => {
                this.getDymjProxy().logout();
                Facade.Instance.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
            }).start();
        });

        this.goOnBtn.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(this.goOnBtn).to(0.1, { scale: 1.1 }).to(0.1, { scale: 1 }).call(() => {
                this.getDymjProxy().goOn();
            }).start();

        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getDymjProxy() {
        return <DymjProxy>Facade.Instance.retrieveProxy(ProxyDefine.Dymj);
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
            if (time <= 0) {
                this.getDymjProxy().goOn();
            }
        }, 1, time - 1);
    }

    getResultDesc(list: DymjGameUIResultItem[]) {
        for (const value of list) {
            if (value.itemType === 6 || value.itemType === 7) {
                return value.name;
            }
        }

        return "";
    }

    /**
     * 获得杠牌描述
     * @param list 
     */
    getGangDesc(list: DymjGameUIResultItem[]) {
        // gangValues 索引说明 0： 暗杠 1：直杠 2：面下杠
        let gangValues = [0, 0, 0];
        for (const value of list) {
            if (value.itemType === 4) {
                gangValues[0]++;
            } else if (value.itemType === 5) {
                gangValues[1]++;
            } else if (value.itemType === 10) {
                gangValues[2]++;
            }
        }

        let desc = "";
        for (let index = 0; index < gangValues.length; index++) {
            const count = gangValues[index];
            if (count > 0) {
                if (index === 0) {
                    desc += "暗杠*" + count + ", ";
                } else if (index === 1) {
                    desc += "直杠*" + count + ", ";
                } else if (index === 2) {
                    desc += "面下杠*" + count + ", ";
                }
            }
        }

        if (desc) {
            desc = desc.substring(0, desc.length - 1);
        }

        return desc;
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
        // 有退出按钮就没有下一局按钮
        this.goOnBtn.active = !this.quitRoom.active;
        this.startNextRoundBtnCountdown(dymjGameResult.time);

        let huPaiName = this.getResultDesc(dymjGameResult.list);
        let gangPaiName = this.getGangDesc(dymjGameResult.list);
        if (gangPaiName) {
            if (huPaiName) {
                huPaiName += ", " + gangPaiName;
            } else {
                huPaiName = gangPaiName;
            }
        }
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
                v.gangValues.forEach(gangValue => {
                    gangValues.push(gangValue.value);
                });
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
                huPaiName: huValues.length != 0 ? huPaiName : null,
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