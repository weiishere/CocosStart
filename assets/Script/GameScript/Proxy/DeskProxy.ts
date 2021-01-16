import BaseProxy from "./BaseProxy";
import { DeskRepository, GameData, DeskData, PlayerInfo, BarType, RecordType } from '../repositories/DeskRepository';
import { ConfigProxy } from './ConfigProxy';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { HttpUtil } from '../Util/HttpUtil';
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import { ServerCode } from '../GameConst/ServerCode';
import { WebSockerProxy } from './WebSocketProxy';
import { LoginData } from '../GameData/LoginData';
import { ClubProxy } from './ClubProxy';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine";
import { DymjS2CEnterRoom } from "../GameData/Dymj/s2c/DymjS2CEnterRoom";
import { DymjEnterDeskPushPlyaerList } from "../GameData/Dymj/s2c/DymjEnterDeskPushPlyaerList";
import { DymjS2CBeginDealData } from '../GameData/Dymj/s2c/DymjS2CBeginDealData';
import { DymjPlayerInfo } from '../GameData/Dymj/s2c/DymjPlayerInfo';
import { DymjS2CPlayerGet } from '../GameData/Dymj/s2c/DymjS2CPlayerGet';
import { DymjOperationType } from '../GameData/Dymj/DymjOperationType';
import { DymjS2CShowOperation } from '../GameData/Dymj/s2c/DymjS2CShowOperation';
import { DymjGameOperation } from '../GameData/Dymj/s2c/DymjGameOperation';
import { DymjS2COpPutRsp } from '../GameData/Dymj/s2c/DymjS2COpPutRsp';
import { DymjGameResult } from '../GameData/Dymj/s2c/DymjGameResult';
import { DymjUpdateUserCredit } from '../GameData/Dymj/s2c/DymjUpdateUserCredit';
import { DymjGameUIResultItem } from '../GameData/Dymj/s2c/DymjGameUIResultItem';
import { DymjS2CDoNextOperation } from '../GameData/Dymj/s2c/DymjS2CDoNextOperation';


export class DeskProxy extends BaseProxy {
    public repository: DeskRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new DeskRepository();
    }

    /**更新用户信息 */
    updateUserInfo(players: Array<DymjPlayerInfo>) {
        let playerInfos = [];
        this.repository.gameData.partnerCardsList = [];
        players.forEach(p => {
            let playerInfo: PlayerInfo = {
                playerId: p.username,
                playerGold: p.credit,
                playerHeadImg: p.head,
                playerName: p.nickname,
                master: false,
                playerGender: 0,
                gameIndex: p.azimuth,
            }
            playerInfos.push(playerInfo);
            if (!this.isMy(p.username)) {
                this.repository.gameData.partnerCardsList.push({
                    "playerId": playerInfo.playerId,
                    "partnerCards":
                    {
                        "curCardList": [],
                        "curCardCount": 0,
                        "isHandCard": false,
                        "touchCard": [],
                        "barCard": [],
                        "hadHuCard": 0,
                        "outCardList": [],
                        "setFace": 0,
                        "status": {
                            "isHadHu": false,
                            "isBaoHu": false
                        }
                    }
                });
            }
        })

        this.getDeskData().playerList = playerInfos;
        this.facade.sendNotification(CommandDefine.RefreshPlayerPush, {}, '');
    }

    /**
     * 开始游戏，发牌
     */
    beginGame(dymjS2CBeginDealData: DymjS2CBeginDealData) {
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        const self = this;
        dymjS2CBeginDealData.players.forEach(user => {
            self.getPlayerInfo(user.name).master = user.isBank;
            if (this.isMy(user.name)) {
                self.getGameData().myCards.curCardList = user.initSpValuesSorted;
                if (user.isBank) {
                    const lastCard = self.getGameData().myCards.curCardList.pop();
                    self.getGameData().myCards.handCard = lastCard;
                }
            } else {
                let partnerCard = self.getGameData().partnerCardsList.find(partner => partner.playerId === user.name);

                partnerCard.partnerCards.curCardCount = user.initSpValuesSorted.length;
                partnerCard.partnerCards.curCardList = user.initSpValuesSorted;
                if (user.isBank) {
                    partnerCard.partnerCards.curCardCount--;
                    partnerCard.partnerCards.isHandCard = true;
                    //toushi
                    if (user.initSpValuesSorted[0] !== 0) partnerCard.partnerCards.handCard = partnerCard.partnerCards.curCardList.pop();
                }
            }

        })
        this.getDeskData().gameSetting.gameRoundNum = dymjS2CBeginDealData.currentGameCount;
        this.sendNotification(CommandDefine.LicensingCardPush)
    }

    /**
     * 玩家自己摸牌
     * @param dymjS2CPlayerGet 
     */
    drawCard(dymjS2CPlayerGet: DymjS2CPlayerGet) {
        // 设置剩余牌
        this.getGameData().remainCard = dymjS2CPlayerGet.cardRemainCount;
        let playerInfo = this.getPlayerByGameIndex(dymjS2CPlayerGet.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().myCards.handCard = dymjS2CPlayerGet.getMjValue;
            if (dymjS2CPlayerGet.nextStep.oprts) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                dymjS2CPlayerGet.nextStep.oprts.forEach(op => {
                    if (op.oprtType === DymjOperationType.GANG) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("bar");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.gang;
                    } else if (op.oprtType === DymjOperationType.HU) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("hu");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.hu;
                    } else if (op.oprtType === DymjOperationType.PUT) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("show");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData;
                    }
                });
            }
        } else {
            let { partnerCards } = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCards.isHandCard = true;
        }
        this.sendNotification(CommandDefine.GetGameCardPush);
    }

    /**
     * 有人出牌之后，提示自己的碰、杠、胡
     * @param dymjS2CShowOperation 
     */
    updateOperationEvent(dymjS2CShowOperation: DymjS2CShowOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2CShowOperation.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (dymjS2CShowOperation.oprts) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                dymjS2CShowOperation.oprts.forEach(op => {
                    if (op.oprtType === DymjOperationType.GANG) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("bar");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.gang;
                    } else if (op.oprtType === DymjOperationType.HU) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("hu");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.hu;
                    } else if (op.oprtType === DymjOperationType.PENG) {
                        this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("touch");
                        this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.peng;
                    }
                });
            }
            this.sendNotification(CommandDefine.ShowMyEventPush);
        }
    }

    /**
     * 通知下一步的操作动作(广播有事件处理完成)
     * @param dymjS2CDoNextOperation 
     */
    updateNextOperationEvent(dymjS2CDoNextOperation: DymjS2CDoNextOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2CDoNextOperation.playerAzimuth);
        
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (dymjS2CDoNextOperation.nextStep.type === 1) {
                //出牌
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ["show"];
                this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = null;
            } else if (dymjS2CDoNextOperation.nextStep.type === 2) {
                //碰杠胡

            }
            this.sendNotification(CommandDefine.ShowCardNotificationPush);
        }
    }

    /** 碰，杠，胡，报胡 游戏事件(对家和自己处理后才接受的数) */
    updateDeskEvent(dymjGameOperation: DymjGameOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjGameOperation.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (dymjGameOperation.oprtType === DymjOperationType.PENG) {
                this.getGameData().myCards.touchCard.push(dymjGameOperation.peng.mjValue);
            } else if (dymjGameOperation.oprtType === DymjOperationType.GANG) {
                const batType: BarType = { barCard: dymjGameOperation.gang.mjValues[0], barType: dymjGameOperation.gang.gangType as 0 | 1 | 2 };
                this.getGameData().myCards.barCard.push(batType);
            } else if (dymjGameOperation.oprtType === DymjOperationType.HU) {
                this.getGameData().myCards.hadHuCard = dymjGameOperation.hu.mjValue;
            } else if (dymjGameOperation.oprtType === DymjOperationType.TING) {
                this.getGameData().myCards.status.isBaoHu = true;
            }

            // 自己剩下的牌
            this.getGameData().myCards.curCardList = dymjGameOperation.spValuesSorted;
        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            if (dymjGameOperation.oprtType === DymjOperationType.PENG) {
                partnerCard.partnerCards.touchCard.push(dymjGameOperation.peng.mjValue);
            } else if (dymjGameOperation.oprtType === DymjOperationType.GANG) {
                const batType: BarType = { barCard: dymjGameOperation.gang.mjValues[0], barType: dymjGameOperation.gang.gangType as 0 | 1 | 2 };
                partnerCard.partnerCards.barCard.push(batType);
            } else if (dymjGameOperation.oprtType === DymjOperationType.HU) {
                partnerCard.partnerCards.hadHuCard = dymjGameOperation.hu.mjValue;
            } else if (dymjGameOperation.oprtType === DymjOperationType.TING) {
                partnerCard.partnerCards.status.isBaoHu = true;
            }
        }
        this.sendNotification(CommandDefine.EventDonePush);
    }

    /** 自己和对家出牌 */
    updateOutCard(dymjS2COpPutRsp: DymjS2COpPutRsp) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2COpPutRsp.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().myCards.outCardList.push(dymjS2COpPutRsp.putMjValue);
            this.getGameData().myCards.handCard = 0;
            this.getGameData().myCards.curCardList = dymjS2COpPutRsp.spValuesSorted;
        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCard.partnerCards.outCardList.push(dymjS2COpPutRsp.putMjValue);
            //partnerCard.partnerCards.curCardCount--;
            partnerCard.partnerCards.isHandCard = false;
            partnerCard.partnerCards.curCardList = dymjS2COpPutRsp.spValuesSorted;
        }
        this.sendNotification(CommandDefine.ShowCardPush, { playerInfo, showCard: dymjS2COpPutRsp.putMjValue });
    }

    /** 更新玩家金币 */
    updatePlayerGold(dymjUpdateUserCredit: DymjUpdateUserCredit) {

    }

    /** 游戏结束 */
    gameOver(dymjGameResult: DymjGameResult) {
        let recordType: RecordType = {
            roundIndex: dymjGameResult.currentGameCount,
            gameRoundArr: []
        }
        dymjGameResult.players.forEach(v => {
            let winlossScore = this.getResultWinloss(dymjGameResult.list, v.azimuth);
            let playerInfo = this.getPlayerByGameIndex(v.azimuth);
            let winType = "";
            if (v.huValues && v.huValues.length > 0) {
                if (v.huValues[0].type === 0) {
                    winType = "炮胡";
                } else if (v.huValues[0].type === 1) {
                    winType = "自摸";
                } else if (v.huValues[0].type === 2) {
                    winType = "抢杠";
                }
            }

            let barCardList = [];

            v.gangValues.forEach(v => {
                barCardList.push(v.value);
            });

            let huCardList = [];
            v.huValues.forEach(v => {
                huCardList.push(v.value);
            });

            let desc = this.getResultDesc(dymjGameResult.list);
            let gameRound = {
                /**玩家ID */
                playerId: playerInfo.playerId,
                /**胡牌类型 */
                winType: winType,
                /**描述 */
                desc: "",
                /** 牌组 */
                cardList: {
                    carCardList: v.shouValues,
                    touchCardList: v.pengValues,
                    barCardList: barCardList,
                    huCardList: huCardList,
                },
                /**输赢分数 */
                score: winlossScore,
            }

            recordType.gameRoundArr.push(gameRound);
        });
        this.getDeskData().roundRecordArr.push(recordType);
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

    getResultDesc(list: DymjGameUIResultItem[]) {
        for (const value of list) {
            if (value.itemType === 6 || value.itemType === 7) {
                return value.name;
            }
        }

        return "";
    }

    isMy(playerId: string) {
        return this.getLocalCacheDataProxy().getLoginData().userName === playerId;
    }

    getPlayerByGameIndex(gameIndex: number): PlayerInfo {
        return this.getDeskData().playerList.find(partner => partner.gameIndex === gameIndex);
    }

    getPlayerInfo(playerId: string): PlayerInfo {
        return this.getDeskData().playerList.find(partner => partner.playerId === playerId);
    }

    /**更新桌子信息 */
    updateDeskInfo(dymjS2CEnterRoom: DymjS2CEnterRoom) {
        this.getDeskData().gameSetting.gameRoundNum = dymjS2CEnterRoom.currentRoundNo;
        this.getDeskData().gameSetting.totalRound = dymjS2CEnterRoom.totalRound;
        this.getDeskData().gameSetting.baseScore = dymjS2CEnterRoom.value;
        this.getDeskData().gameSetting.fanTime = dymjS2CEnterRoom.fanNum;

        this.updateUserInfo(dymjS2CEnterRoom.players);
    }
    getGameData(): GameData {
        return this.repository.gameData;
    }
    getDeskData(): DeskData {
        return this.repository.deskData;
    }
    setGateData(gameData: GameData) {

    }
}