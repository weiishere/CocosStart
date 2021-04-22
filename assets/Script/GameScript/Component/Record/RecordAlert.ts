import ViewComponent from '../../Base/ViewComponent';
import Facade from '../../../Framework/care/Facade';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { RecorDetailData } from './RecordDetailList';
import { DymjGameUIResultItem } from '../../GameData/Dymj/s2c/DymjGameUIResultItem';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { DymjProxy } from '../../Proxy/DymjProxy';
import { DymjGangHuTypeValue } from '../../GameData/Dymj/s2c/DymjGangHuTypeValue';
import { PrefabDefine } from '../../MahjongConst/PrefabDefine';
import BaseRecordDetail, { PlayerRecordData } from '../Record/BaseRecordDetail';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
import { DymjGameResult } from '../../GameData/Dymj/s2c/DymjGameResult';

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

    /**
     * 获得玩家的胡牌信息
     * @param list 
     * @param azimuth 
     */
    getResultDesc(list: DymjGameUIResultItem[], azimuth: number) {
        for (const value of list) {
            if ((azimuth === 0 && value.azimuth1 > 0) || (azimuth === 1 && value.azimuth2 > 0) ||
                (azimuth === 2 && value.azimuth3 > 0) || (azimuth === 3 && value.azimuth4 > 0)) {
                if (value.itemType === 6 || value.itemType === 7) {
                    return value.name;
                }
            }
        }

        return "";
    }

    /**
     * 获得杠牌描述
     * @param list 
     */
    getGangDesc(list: DymjGangHuTypeValue[]) {
        // gangValues 索引说明 0：直杠 1：面下杠 2：暗杠
        let gangValues = [0, 0, 0];
        for (const value of list) {
            gangValues[value.type]++;
        }

        let desc = "";
        for (let index = 0; index < gangValues.length; index++) {
            const count = gangValues[index];
            if (count > 0) {
                if (index === 0) {
                    desc += "直杠*" + count + ", ";
                } else if (index === 1) {
                    desc += "面下杠*" + count + ", ";
                } else if (index === 2) {
                    desc += "暗杠*" + count + ", ";
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

    buildData(gameResult: DymjGameResult, gameSubClass: number = GameNoDefine.DA_YI_ER_REN_MAHJONG) {
        let recorDetailData: RecorDetailData = {
            gameSubClass: gameSubClass,
            roomNo: gameResult.roomNo,
            currentGameCount: gameResult.currentGameCount,
            playerData: []
        }

        let userName = this.getLocalCacheDataProxy().getLoginData().userName;

        // 是否显示退出按钮
        this.quitRoom.active = gameResult.currentGameCount >= gameResult.totalGameCount;

        if (gameResult.isShowQuitBtn) {
            this.quitRoom.active = true;
        }

        // 有退出按钮就没有下一局按钮
        this.goOnBtn.active = !this.quitRoom.active;

        this.startNextRoundBtnCountdown(gameResult.time);

        // 最后胡牌的牌型
        gameResult.players.forEach(v => {
            let huPaiName = this.getResultDesc(gameResult.list, v.azimuth);
            let winlossScore = this.getResultWinloss(gameResult.list, v.azimuth);
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

            let gangPaiName = this.getGangDesc(v.gangValues);
            let huPaiNameTmp = huPaiName;
            if (huValues.length > 0) {
                if (huPaiNameTmp) {
                    huPaiNameTmp += ", " + gangPaiName;
                } else {
                    huPaiNameTmp = gangPaiName;
                }
            } else {
                huPaiNameTmp = "未胡牌, " + gangPaiName;
            }

            let playerRecordData: PlayerRecordData = {
                shouValues: shouValues,
                huValues: huValues,
                pengValues: pengValues,
                gangValues: gangValues,
                huPaiName: huPaiNameTmp,
                userName: v.userName,
                nickname: v.nickname,
                seatNo: v.azimuth,
                head: v.head,
                winloss: winlossScore,
                detailRemark: [],
                huOrder: 0,
            }

            recorDetailData.playerData.push(playerRecordData);
        });

        this.createRecordDetailItem(recorDetailData, gameResult.totalGameCount);
    }

    createRecordDetailItem(recorDetailData: RecorDetailData, totalLength: number) {
        let gameSubClass = recorDetailData.gameSubClass;

        if (recorDetailData.playerData.length === 2) {
            gameSubClass = GameNoDefine.DA_YI_ER_REN_MAHJONG;
        }

        let recordDetailNode = this.getRecordPrefab(recorDetailData.gameSubClass);
        let script = <BaseRecordDetail>recordDetailNode.getComponent(BaseRecordDetail);
        recordDetailNode.y = 66;
        script.loadData(false, this.getLocalCacheDataProxy().getLoginData().userName, recorDetailData.roomNo, recorDetailData.currentGameCount, totalLength, recorDetailData.playerData, recorDetailData.gameSubClass);
        this.node.addChild(recordDetailNode);
    }

    getRecordPrefab(gameSubClass: number): cc.Node {
        let data = null;
        if (gameSubClass === GameNoDefine.DA_YI_ER_REN_MAHJONG) {
            data = cc.loader.getRes(PrefabDefine.DymjRecordDetail, cc.Prefab);
        } else if (gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI) {
            data = cc.loader.getRes(PrefabDefine.XdzzRecordDetail, cc.Prefab);
        }

        if (!data) {
            return;
        }

        return cc.instantiate(data);
    }

    // update (dt) {}
}