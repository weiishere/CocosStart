import ViewComponent from '../../Base/ViewComponent';
import Facade from '../../../Framework/care/Facade';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { PrefabDefine } from '../../MahjongConst/PrefabDefine';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
import { RecorDetailData } from '../../Component/Record/RecordDetailList';
import BaseRecordDetail, { PlayerRecordData } from '../../Component/Record/BaseRecordDetail';
import { XzddGameResult } from '../../GameData/Xzdd/s2c/XzddGameResult';
import { XzddProxy } from '../XzddProxy';
import { CDMJCommandDefine } from '../CDMJConst/CDMJCommandDefine';
import { XzddGameUIResultItem } from '../../GameData/Xzdd/s2c/XzddGameUIResultItem';
import { XzddGangHuTypeValue } from '../../GameData/Xzdd/s2c/XzddGangHuTypeValue';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CDMJRecordAlert extends ViewComponent {

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
                this.getXzddProxy().logout();
                Facade.Instance.sendNotification(CDMJCommandDefine.ExitDeskPanel, {}, '');
            }).start();
        });

        this.goOnBtn.on(cc.Node.EventType.TOUCH_START, () => {
            cc.tween(this.goOnBtn).to(0.1, { scale: 1.1 }).to(0.1, { scale: 1 }).call(() => {
                this.getXzddProxy().goOn();
            }).start();

        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getXzddProxy() {
        return <XzddProxy>Facade.Instance.retrieveProxy(ProxyDefine.Xzdd);
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
                this.getXzddProxy().goOn();
            }
        }, 1, time - 1);
    }

    /**
     * 获得玩家的胡牌信息
     * @param list 
     * @param azimuth 
     */
    getResultDesc(list: XzddGameUIResultItem[], azimuth: number) {
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
    getGangDesc(list: XzddGangHuTypeValue[]) {
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

    getResultWinloss(list: XzddGameUIResultItem[], azimuth: number) {
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

    buildData(gameResult: XzddGameResult, gameSubClass: number = GameNoDefine.XUE_ZHAN_DAO_DI) {
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

        let myAzimuth: number = 0;
        let myPlayerRecordData: PlayerRecordData;
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

            // let gangPaiName = this.getGangDesc(v.gangValues);
            let gangPaiName = "";
            let huPaiNameTmp = huPaiName;
            if (huValues.length > 0) {
                // if (huPaiNameTmp) {
                //     huPaiNameTmp += ", " + gangPaiName;
                // } else {
                //     huPaiNameTmp = gangPaiName;
                // }
            } else {
                huPaiNameTmp = "未胡牌";
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
                detailRemark: []
            }

            if (userName === v.userName) {
                myAzimuth = v.azimuth;
                myPlayerRecordData = playerRecordData;
            }

            recorDetailData.playerData.push(playerRecordData);
        });

        myPlayerRecordData.detailRemark = this.getDetailGameResult(myAzimuth, gameResult.list);

        this.createRecordDetailItem(recorDetailData, gameResult.totalGameCount);
    }

    createRecordDetailItem(recorDetailData: RecorDetailData, totalLength: number) {
        let gameSubClass = recorDetailData.gameSubClass;

        if (recorDetailData.playerData.length === 2) {
            gameSubClass = GameNoDefine.DA_YI_ER_REN_MAHJONG;
        }

        let recordDetailNode = this.getRecordPrefab(gameSubClass);
        let script = <BaseRecordDetail>recordDetailNode.getComponent(BaseRecordDetail);
        recordDetailNode.y = 66;
        script.loadData(false, this.getLocalCacheDataProxy().getLoginData().userName, recorDetailData.roomNo, recorDetailData.currentGameCount, totalLength, recorDetailData.playerData);
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

    getDetailGameResult(myAzimuth: number, gameResultItems: XzddGameUIResultItem[]) {
        let itemResults = [];
        for (const gameResultItem of gameResultItems) {
            if (gameResultItem.type === "total") {
                continue;
            }

            let changeCredit = this.getAzimuthPlayer(myAzimuth, gameResultItem);
            if (changeCredit == 0) {
                continue;
            }
            let resultName = "";
            if (gameResultItem.itemType === 5) {
                resultName = "刮风";
                if (changeCredit < 0) {
                    resultName = "被刮风";
                }
            } else if (gameResultItem.itemType === 4) {
                resultName = "下雨";
                if (changeCredit < 0) {
                    resultName = "被下雨";
                }
            } else if (gameResultItem.itemType === 10) {
                resultName = "面下杠";
                if (changeCredit < 0) {
                    resultName = "被面下杠";
                }
            } else if (gameResultItem.itemType === 3) {
                resultName = "呼叫转移";
            } else if (gameResultItem.itemType === 1) {
                resultName = "查大叫";
                if (changeCredit < 0) {
                    resultName = "被查叫";
                }
            } else if (gameResultItem.itemType === 7) {
                resultName = "吃胡";
                if (changeCredit < 0) {
                    resultName = "点炮";
                }
            } else if (gameResultItem.itemType === 6) {
                resultName = "自摸";
                if (changeCredit < 0) {
                    resultName = "被自摸";
                }
            } else if (gameResultItem.itemType === 8) {
                resultName = "杠上花";
                if (changeCredit < 0) {
                    resultName = "被杠上花";
                }
            } else if (gameResultItem.itemType === 9) {
                resultName = "杠上炮";
                if (changeCredit < 0) {
                    resultName = "被杠上炮";
                }
            }

            let azimuthStr = "";

            let azimuthWinloss: number[] = [gameResultItem.azimuth1, gameResultItem.azimuth2, gameResultItem.azimuth3, gameResultItem.azimuth4];

            for (let index = 0; index < azimuthWinloss.length; index++) {
                const winloss = azimuthWinloss[index];
                if (index === myAzimuth) {
                    continue;
                }

                if (winloss === 0) {
                    continue;
                }

                // 如果自己是负的，不需要找其他负的玩家，只需要知道正的玩家就可以了
                if (changeCredit < 0 && winloss < 0) {
                    continue;
                }
                azimuthStr += this.getAzimuthName(myAzimuth, index) + " ";
            }

            let resultItem = `${resultName},${changeCredit},${azimuthStr}`;
            itemResults.push(resultItem);
        }

        return itemResults;
    }

    getAzimuthPlayer(myAzimuth: number, xzddGameUIResultItem: XzddGameUIResultItem) {
        if (myAzimuth === 0 && xzddGameUIResultItem.azimuth1 != 0) {
            return xzddGameUIResultItem.azimuth1;
        } else if (myAzimuth === 1 && xzddGameUIResultItem.azimuth2 != 0) {
            return xzddGameUIResultItem.azimuth2;
        } else if (myAzimuth === 2 && xzddGameUIResultItem.azimuth3 != 0) {
            return xzddGameUIResultItem.azimuth3;
        } else if (myAzimuth === 3 && xzddGameUIResultItem.azimuth4 != 0) {
            return xzddGameUIResultItem.azimuth4;
        }
        return 0;
    }

    getAzimuthName(myAzimuth: number, azimuthType: number) {
        let duiJiaAzimuth = this.getDuiJiaAzimuth(myAzimuth);
        let shangJiaAzimuth = this.getShangJiaAzimuth(myAzimuth);
        let xiaJiaAzimuth = this.getXiaJiaAzimuth(myAzimuth);

        if (duiJiaAzimuth == azimuthType) {
            return "对家";
        } else if (shangJiaAzimuth == azimuthType) {
            return "上家";
        } else if (xiaJiaAzimuth == azimuthType) {
            return "下家";
        }
        return "自己";
    }

    /**
     * 获得对家方位
     * 
     * @param myAzimuth
     * @return
     */
    getDuiJiaAzimuth(myAzimuth: number) {
        if (myAzimuth === 0) {
            return 2;
        } else if (myAzimuth === 1) {
            return 3;
        } else if (myAzimuth === 2) {
            return 0;
        } else if (myAzimuth === 3) {
            return 1;
        }
        return 0;
    }

    /**
     * 获得上家方位
     * 
     * @param myAzimuth
     * @return
     */
    getShangJiaAzimuth(myAzimuth: number) {
        let index = myAzimuth - 1;
        if (index < 0) {
            index = 3;
        }

        return index;
    }

    /**
     * 获得上家方位
     * 
     * @param myAzimuth
     * @return
     */
    getXiaJiaAzimuth(myAzimuth: number) {
        let index = myAzimuth + 1;
        if (index > 3) {
            index = 0;
        }

        return index;
    }
}