import BaseProxy from "./BaseProxy";
import { DeskRepository, GameData, DeskData, PlayerInfo, BarType, RecordType, PartnerCard, MayHuCard, DeskEventName } from '../repositories/DeskRepository';
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
import { DymjOperation } from "../GameData/Dymj/s2c/DymjOperation";
import { DymjGameReconnData } from '../GameData/Dymj/s2c/DymjGameReconnData';
import { DymjProxy } from "./DymjProxy";


export class DeskProxy extends BaseProxy {
    public repository: DeskRepository;
    private dataBackup: { gameData: GameData, deskData: DeskData } = null;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new DeskRepository();
        this.dataBackup = JSON.parse(JSON.stringify(this.repository));//Object.assign({}, { gameData: this.repository.gameData, deskData: this.repository.deskData });
    }
    /**清除桌面事件数据，主要用于展示几秒钟之后需要清除 */
    clearDeskGameEvent() {
        this.getGameData().eventData.deskEventData.eventName = '';
        //this.sendNotification(CommandDefine.ShowCenterEffect);
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
                        "handCard": 0,
                        "curCardCount": 0,
                        "isHandCard": false,
                        "touchCard": [],
                        "barCard": [],
                        "hadHuCard": 0,
                        "outCardList": [],
                        "setFace": 0,
                        "status": {
                            "isHadHu": false,
                            "isBaoQingHu": false,
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
        this.clearGameData();//发牌之前先清理gameData
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        this.getGameData().countDownTime = dymjS2CBeginDealData.time;//倒计时
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
                if (partnerCard) {
                    partnerCard.partnerCards.curCardCount = user.initSpValuesSorted.length;
                    partnerCard.partnerCards.curCardList = user.initSpValuesSorted;
                    if (user.isBank) {
                        partnerCard.partnerCards.curCardCount--;
                        partnerCard.partnerCards.handCard = partnerCard.partnerCards.curCardList.pop();
                        partnerCard.partnerCards.isHandCard = true;
                        //toushi
                        //if (user.initSpValuesSorted[0] !== 0) partnerCard.partnerCards.handCard = partnerCard.partnerCards.curCardList.pop();
                    }
                }

            }

        })
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = 'gameBegin';
        this.getDeskData().gameSetting.gameRoundNum = dymjS2CBeginDealData.currentGameCount;
        this.sendNotification(CommandDefine.LicensingCardPush);
    }
    private doEventData(oprts: Array<DymjOperation>) {

        oprts.forEach(op => {
            const _eventName = this.getGameData().eventData.gameEventData.myGameEvent.eventName;
            const _correlationInfoData = this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData;
            if (op.oprtType === DymjOperationType.GANG) {
                _eventName.push("bar");
                this.getGameData().myCards.cardsChoose = op.gang.mjValues;
                _correlationInfoData['gang'] = op.gang;
            } else if (op.oprtType === DymjOperationType.PENG) {
                _eventName.push("touch");
                _correlationInfoData['peng'] = op.peng;
            } else if (op.oprtType === DymjOperationType.HU) {
                _eventName.push("hu");
                _correlationInfoData['hu'] = op.hu;
            } else if (op.oprtType === DymjOperationType.PUT) {
                _eventName.push("show");
                //_correlationInfoData;
            } else if (op.oprtType === DymjOperationType.TING) {
                //_correlationInfoData['ting'] = op.ting;
                if (op.ting.isHu) {
                    //天胡牌
                    _eventName.push("hu");
                    _correlationInfoData['hu'] = Object.assign(op.ting, { isTianHu: true });
                } else if (op.ting.isBaoQingHu) {
                    //报请胡
                    _eventName.push("tingQingHu");
                    _correlationInfoData['ting'] = Object.assign(op.ting, { isBaoQingHu: true });
                    this.getGameData().myCards.cardsChoose = [];//可能有多种报牌方式
                    op.ting.list && op.ting.list.forEach(item => this.getGameData().myCards.cardsChoose.push(item.putValue));//list为空表示没有出牌情况下的报牌
                } else {
                    //一般报牌
                    _eventName.push("ting");
                    _correlationInfoData['ting'] = Object.assign(op.ting, { isBaoHu: true });
                    this.getGameData().myCards.cardsChoose = [];//可能有多种报牌方式
                    op.ting.list && op.ting.list.forEach(item => this.getGameData().myCards.cardsChoose.push(item.putValue));
                }
            } else if (op.oprtType === DymjOperationType.QING_HU) {
                _eventName.push("qingHu");
                _correlationInfoData['qingHu'] = op.hu;
            }
        });
    }
    /**
     * 玩家摸牌
     * @param dymjS2CPlayerGet 
     */
    drawCard(dymjS2CPlayerGet: DymjS2CPlayerGet) {
        // 设置剩余牌
        this.getGameData().remainCard = dymjS2CPlayerGet.cardRemainCount;
        let playerInfo = this.getPlayerByGameIndex(dymjS2CPlayerGet.playerAzimuth);
        this.getGameData().positionIndex = dymjS2CPlayerGet.playerAzimuth;
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().myCards.handCard = dymjS2CPlayerGet.getMjValue;
            if (dymjS2CPlayerGet.nextStep.oprts) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                this.doEventData(dymjS2CPlayerGet.nextStep.oprts);
            } else {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            }
            //不能出的牌(用户报胡之后)
            this.getGameData().myCards.disableCard = dymjS2CPlayerGet.nextStep.datas || [];
            const huList = (dymjS2CPlayerGet.nextStep.args && dymjS2CPlayerGet.nextStep.args.list) ? dymjS2CPlayerGet.nextStep.args.list : [];
            this.getGameData().myCards.mayHuCards = huList.map(item => ({ putCard: item.putValue, huList: item.huList.map(hu => ({ huCard: hu.huValue, fanShu: hu.fanNum, remainNum: hu.remainNum })) }));
            if (this.getGameData().myCards.status.isBaoHu && !dymjS2CPlayerGet.nextStep.oprts) {
                window.setTimeout(() => {
                    (<DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj)).putMahkjong(dymjS2CPlayerGet.getMjValue);
                }, 800);
            } else if (this.getGameData().myCards.status.isBaoQingHu && !dymjS2CPlayerGet.nextStep.oprts) {
                const arr = this.getGameData().myCards.curCardList.filter(card => this.getGameData().myCards.disableCard.some(item => item === card) ? false : true);
                window.setTimeout(() => {
                    (<DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj)).putMahkjong(arr.length === 0 ? dymjS2CPlayerGet.getMjValue : arr[0]);
                }, 800);
            }
        } else {
            console.log('dymjS2CPlayerGet.getMjValue', dymjS2CPlayerGet.getMjValue);
            let { partnerCards } = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCards.isHandCard = true;
            partnerCards.handCard = dymjS2CPlayerGet.getMjValue;
        }

        this.sendNotification(CommandDefine.GetGameCardPush);
    }

    /**
     * 有人出牌或者发牌之后，提示自己的碰、杠、胡、听等
     * @param dymjS2CShowOperation 
     */
    updateOperationEvent(dymjS2CShowOperation: DymjS2CShowOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2CShowOperation.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (dymjS2CShowOperation.oprts) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                this.doEventData(dymjS2CShowOperation.oprts);
                // dymjS2CShowOperation.oprts.forEach(op => {
                //     if (op.oprtType === DymjOperationType.GANG) {
                //         this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("bar");
                //         this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.gang;
                //     } else if (op.oprtType === DymjOperationType.HU) {
                //         this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("hu");
                //         this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.hu;
                //     } else if (op.oprtType === DymjOperationType.PENG) {
                //         this.getGameData().eventData.gameEventData.myGameEvent.eventName.push("touch");
                //         this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = op.peng;
                //     }
                // });
            }
            this.sendNotification(CommandDefine.ShowMyEventPush, { eventName: this.getGameData().eventData.gameEventData.myGameEvent.eventName });
        }
    }

    /**
     * 通知下一步有哪些操作动作(广播有事件)
     * @param dymjS2CDoNextOperation 
     */
    updateNextOperationEvent(dymjS2CDoNextOperation: DymjS2CDoNextOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2CDoNextOperation.playerAzimuth);
        //this.getGameData().countDownTime = dymjS2CDoNextOperation.nextStep.time;
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (dymjS2CDoNextOperation.nextStep.type === 1) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ["show"];
                this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = {};
                //不能出的牌(用户报胡之后)
                this.getGameData().myCards.disableCard = dymjS2CDoNextOperation.nextStep.datas || [];
            } else if (dymjS2CDoNextOperation.nextStep.type === 2) {
                //碰杠胡
                this.doEventData(dymjS2CDoNextOperation.nextStep.oprts);
            }
            //this.doEventData(dymjS2CDoNextOperation.nextStep.oprts);
        }
        this.sendNotification(CommandDefine.ShowCardNotificationPush);
    }

    /** 碰，杠，胡，报胡 游戏事件(对家和自己处理后才接受的数) */
    updateDeskEvent(dymjGameOperation: DymjGameOperation) {
        let playerInfo = this.getPlayerByGameIndex(dymjGameOperation.playerAzimuth);
        let _deskEventName: DeskEventName = '';
        let _deskEventCorrelationInfoData: any = {}
        let givePlayer: PlayerInfo = null;
        let giveCard: number = 0;
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
            //let correlationInfoData = this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData;//清空可能的杠选牌
            this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = {};//清空可能的杠选牌
            let correlationInfoData = {};

            if (dymjGameOperation.oprtType === DymjOperationType.PENG) {
                this.getGameData().myCards.touchCard.push(dymjGameOperation.peng.mjValue);
                _deskEventName = 'touch';
                _deskEventCorrelationInfoData = correlationInfoData = dymjGameOperation.peng;
                givePlayer = this.getPlayerByGameIndex(dymjGameOperation.peng.playerAzimuth);
                giveCard = dymjGameOperation.peng.mjValue;
                this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();//去掉引碰者出牌
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            } else if (dymjGameOperation.oprtType === DymjOperationType.GANG) {
                const barType: BarType = { barCard: dymjGameOperation.gang.mjValues[0], barType: dymjGameOperation.gang.gangType as 0 | 1 | 2 };
                this.getGameData().myCards.barCard.push(barType);
                _deskEventName = 'bar';
                _deskEventCorrelationInfoData = correlationInfoData = dymjGameOperation.gang;
                givePlayer = this.getPlayerByGameIndex(dymjGameOperation.gang.playerAzimuth);
                giveCard = dymjGameOperation.gang.mjValues[0];
                if (barType.barType === 1) {
                    this.getGameData().myCards.touchCard = this.getGameData().myCards.touchCard.filter(item => item !== giveCard);
                }
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            } else if (dymjGameOperation.oprtType === DymjOperationType.HU) {
                _deskEventCorrelationInfoData = correlationInfoData = dymjGameOperation.hu;
                this.getGameData().myCards.hadHuCard = dymjGameOperation.hu.mjValue;
                giveCard = dymjGameOperation.hu.mjValue;
                if (dymjGameOperation.hu.huType === 1) {
                    //自摸（去掉摸牌，因为已经转移到了胡牌）
                    _deskEventName = 'zimo';
                    this.getGameData().myCards.handCard = 0;

                } else if (dymjGameOperation.hu.huType === 2) {
                    //抢杠（抢胡）======================================================
                    _deskEventName = 'hu';
                    givePlayer = this.getPlayerByGameIndex(dymjGameOperation.hu.playerAzimuth);
                    const partnerCards = this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards;
                    partnerCards.barCard = partnerCards.barCard.filter(card => card.barCard !== dymjGameOperation.hu.mjValue);
                    partnerCards.touchCard.push(dymjGameOperation.hu.mjValue);
                } else {
                    //别人点炮
                    givePlayer = this.getPlayerByGameIndex(dymjGameOperation.hu.playerAzimuth);//引炮者
                    this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();//去掉引炮者出牌
                    _deskEventName = 'hu';
                }
            } else if (dymjGameOperation.oprtType === DymjOperationType.TING) {
                _deskEventName = 'ting';
                givePlayer = this.getPlayerByGameIndex(dymjGameOperation.ting.playerAzimuth);
                giveCard = dymjGameOperation.ting.mjValue;
                _deskEventCorrelationInfoData = correlationInfoData = dymjGameOperation.ting;
                if (dymjGameOperation.ting.isBaoQingHu) {
                    this.getGameData().myCards.status.isBaoQingHu = true;
                } else {
                    this.getGameData().myCards.status.isBaoHu = true;
                }
            }
            // 自己剩下的牌
            this.getGameData().myCards.curCardList = dymjGameOperation.spValuesSorted;
        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            _deskEventName = '';//别人的事件
            if (dymjGameOperation.oprtType === DymjOperationType.PENG) {
                _deskEventName = 'touch'
                _deskEventCorrelationInfoData = dymjGameOperation.peng;
                giveCard = dymjGameOperation.peng.mjValue;
                partnerCard.partnerCards.touchCard.push(dymjGameOperation.peng.mjValue);
                partnerCard.partnerCards.curCardCount -= 2;
                let count = 0;
                partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                    if (item === dymjGameOperation.peng.mjValue && count <= 1) { count++; return false; } else { return true; }
                });
                givePlayer = this.getPlayerByGameIndex(dymjGameOperation.peng.playerAzimuth);//引碰者
                if (this.isMy(givePlayer.playerId)) {
                    this.getGameData().myCards.outCardList.pop();
                } else {
                    this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                }
            } else if (dymjGameOperation.oprtType === DymjOperationType.GANG) {
                _deskEventName = 'bar';
                _deskEventCorrelationInfoData = dymjGameOperation.gang;
                giveCard = dymjGameOperation.gang.mjValues[0];
                const burObj: BarType = { barCard: dymjGameOperation.gang.mjValues[0], barType: dymjGameOperation.gang.gangType as 0 | 1 | 2 };
                givePlayer = this.getPlayerByGameIndex(dymjGameOperation.gang.playerAzimuth);//引杠者
                if (dymjGameOperation.gang.gangType === 0) {
                    //点杠
                    partnerCard.partnerCards.curCardCount -= 3;
                    let count = 0;
                    partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                        if (item === dymjGameOperation.gang.mjValues[0] && count <= 3) { count++; return false; } else { return true; }
                    });
                    if (this.isMy(givePlayer.playerId)) {
                        this.getGameData().myCards.outCardList.pop();
                    } else {
                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                    }
                } else if (dymjGameOperation.gang.gangType === 1) { 
                    //抢杠
                    partnerCard.partnerCards.isHandCard = false;
                    partnerCard.partnerCards.handCard = 0;
                    if (this.isMy(givePlayer.playerId)) {
                        this.getGameData().myCards.outCardList.pop();
                    } else {
                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop(); 
                    }
                    const partnerCards = this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards;
                    partnerCards.touchCard = partnerCards.touchCard.filter(item => item !== giveCard);

                } else if (dymjGameOperation.gang.gangType === 2) {
                    //暗杠
                    partnerCard.partnerCards.curCardCount -= 4;
                    let count = 0;
                    partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                        if (item === dymjGameOperation.gang.mjValues[0] && count <= 3) { count++; return false; } else { return true; }
                    });
                    partnerCard.partnerCards.isHandCard = false;
                    partnerCard.partnerCards.handCard = 0;
                }
                partnerCard.partnerCards.barCard.push(burObj);
            } else if (dymjGameOperation.oprtType === DymjOperationType.HU) {
                partnerCard.partnerCards.hadHuCard = dymjGameOperation.hu.mjValue;
                partnerCard.partnerCards.handCard = 0;
                _deskEventName = dymjGameOperation.hu.huType === 1 ? 'zimo' : 'hu';
                _deskEventCorrelationInfoData = dymjGameOperation.hu;
                giveCard = dymjGameOperation.hu.mjValue;
            } else if (dymjGameOperation.oprtType === DymjOperationType.TING) {
                _deskEventName = 'ting';
                _deskEventCorrelationInfoData = dymjGameOperation.ting;
                partnerCard.partnerCards.status.isBaoHu = true;
                giveCard = dymjGameOperation.ting.mjValue;
            }
        }
        //更新方向
        this.getGameData().positionIndex = dymjGameOperation.playerAzimuth;
        //更新中间大字数据
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = _deskEventName;
        this.getGameData().eventData.gameEventData.deskGameEvent.correlationInfoData = _deskEventCorrelationInfoData;
        this.sendNotification(CommandDefine.EventDonePush, { givePlayer, giveCard, isMe: this.isMy(playerInfo.playerId), eventName: _deskEventName });
    }

    /** 自己和对家出牌（出牌之后） */
    updateOutCard(dymjS2COpPutRsp: DymjS2COpPutRsp) {
        let playerInfo = this.getPlayerByGameIndex(dymjS2COpPutRsp.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
            this.getGameData().myCards.outCardList.push(dymjS2COpPutRsp.putMjValue);
            this.getGameData().myCards.handCard = 0;
            this.getGameData().myCards.curCardList = dymjS2COpPutRsp.spValuesSorted;

        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCard.partnerCards.outCardList.push(dymjS2COpPutRsp.putMjValue);
            //partnerCard.partnerCards.curCardCount--;

            if (!partnerCard.partnerCards.isHandCard) {
                partnerCard.partnerCards.curCardCount--;
                let count = 0;
                partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                    if (item === dymjS2COpPutRsp.putMjValue && count === 0) { count++; return false; } else { return true; }
                });
            } else {
                //如果有手牌，这里要注意看打出的牌是否等于手牌
                if (partnerCard.partnerCards.handCard !== dymjS2COpPutRsp.putMjValue) {
                    //出的不是手牌
                    let count = 0;
                    partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                        if (item === dymjS2COpPutRsp.putMjValue && count === 0) { count++; return false; } else { return true; }
                    });
                    // console.log('----------------------------')
                    // console.log(partnerCard.partnerCards.handCard);
                    // console.log('----------------------------')
                    partnerCard.partnerCards.handCard !== 0 && partnerCard.partnerCards.curCardList.push(partnerCard.partnerCards.handCard + 0);
                    partnerCard.partnerCards.curCardList.sort((a, b) => a - b);
                }
            }

            partnerCard.partnerCards.isHandCard = false;
            partnerCard.partnerCards.handCard = 0;
        }
        this.sendNotification(CommandDefine.ShowCardEffect, { gameIndex: dymjS2COpPutRsp.playerAzimuth, cardNumber: dymjS2COpPutRsp.putMjValue });
        this.sendNotification(CommandDefine.ShowCardPush, { playerInfo, showCard: dymjS2COpPutRsp.putMjValue });
    }

    /** 更新玩家金币 */
    updatePlayerGold(dymjUpdateUserCredit: DymjUpdateUserCredit) {

    }
    private clearGameData() {
        //清空数据
        const _partnerCardsList = JSON.parse(JSON.stringify(this.repository.gameData.partnerCardsList));
        (_partnerCardsList as Array<PartnerCard>).forEach(item => {
            item.partnerCards =
            {
                "curCardList": [],
                "handCard": 0,
                "curCardCount": 0,
                "isHandCard": false,
                "touchCard": [],
                "barCard": [],
                "hadHuCard": 0,
                "outCardList": [],
                "setFace": 0,
                "status": {
                    "isHadHu": false,
                    "isBaoQingHu": false,
                    "isBaoHu": false
                }
            }

        });
        this.repository.gameData = JSON.parse(JSON.stringify(this.dataBackup.gameData));//Object.assign({}, this.dataBackup.gameData);
        this.repository.gameData.partnerCardsList = _partnerCardsList;
    }

    /** 游戏结束 */
    gameOver(dymjGameResult: DymjGameResult) {
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = 'gameEnd';
        this.clearGameData();
        //更新用户金币
        dymjGameResult.players.forEach(player => {
            this.repository.deskData.playerList.find(item => item.playerId === player.userName).playerGold = player.credit;
        })

        this.sendNotification(CommandDefine.OpenRecordAlter, dymjGameResult);
    }

    /**
     * 游戏重连
     */
    gameReconnect(dymjGameReconnData: DymjGameReconnData) {
        const playerList: Array<PlayerInfo> = [
        ];

        this.getGameData().positionIndex = dymjGameReconnData.waitingPlayerAzimuth;
        this.getGameData().remainCard = dymjGameReconnData.lastCount;
        this.getGameData().countDownTime = dymjGameReconnData.waitingTime;//倒计时
        // this.getGameData().myCards.hadHuCard
        this.getGameData().partnerCardsList = [];
        dymjGameReconnData.players.forEach(player => {
            let playerInfo: PlayerInfo = {
                playerId: player.playerInfo.username,
                gameIndex: player.playerInfo.azimuth,
                playerGold: player.playerInfo.credit,
                playerGender: 0,
                playerHeadImg: player.playerInfo.head,
                playerName: player.playerInfo.nickname,
                master: player.isBank
            }

            let barCard: Array<BarType> = [];
            let outCard: Array<number> = [];
            let pengCard: Array<number> = [];
            let curCardList: Array<number> = [];
            let handCard: number = 0;
            let huCard: number = 0;
            let isBaoHu: boolean = false;
            let isBaoQingHu: boolean = false;

            if (player.gangValues) {
                player.gangValues.forEach(v => {
                    barCard.push({
                        barCard: v.mjValues[0],
                        barType: v.gangType as 0 | 1 | 2,
                    });
                });
            }

            if (player.chuValues) {
                outCard = player.chuValues;
            }
            if (player.huValues && player.huValues.length > 0) {
                huCard = player.huValues[0].mjValue;
            }
            if (player.pengValues) {
                player.pengValues.forEach(v => {
                    pengCard.push(v.mjValue);
                });
            }

            if (player.shouValues) {
                curCardList = player.shouValues;
            }

            isBaoHu = player.isTing;
            isBaoQingHu = player.isTingQingHu;

            if (curCardList.length === 2 || curCardList.length === 5 || curCardList.length === 8 || curCardList.length === 11) {
                handCard = curCardList[curCardList.length - 1];
            }

            if (this.isMy(player.playerInfo.username)) {
                this.getGameData().myCards = {
                    barCard,
                    hadHuCard: huCard,
                    outCardList: outCard,
                    touchCard: pengCard,
                    curCardList: (handCard > 0 ? curCardList.splice(0, curCardList.length - 1) : curCardList),//curCardList,
                    setFace: 0,
                    handCard: handCard,
                    cardsChoose: [],
                    disableCard: [],
                    mayHuCards: [],
                    status: {
                        isHadHu: huCard > 0,
                        isBaoQingHu: isBaoQingHu,
                        isBaoHu: isBaoHu
                    }
                }


            } else {
                let partnerCard: PartnerCard = {
                    /**对家ID */
                    playerId: player.playerInfo.username,
                    //gameIndex: number,
                    /**对家牌组 */
                    partnerCards: {
                        /**对家可操作牌列数 */
                        curCardCount: player.shouValues.length - (handCard > 0 ? 1 : 0),
                        /**对家可操作牌列数（可不传） */
                        curCardList: (handCard > 0 ? player.shouValues.splice(0, player.shouValues.length - 1) : player.shouValues),
                        /**是否收到新摸牌 */
                        isHandCard: handCard > 0,
                        /**新摸到的牌 */
                        handCard: handCard,
                        /**对家碰牌 */
                        touchCard: pengCard,
                        /**对家杠牌 */
                        barCard: barCard,
                        /**对家已经胡的牌 */
                        hadHuCard: huCard,
                        /**对家已经出的牌 */
                        outCardList: outCard,
                        /**对家定章 */
                        setFace: 0,
                        /**对家的状态 */
                        status: {
                            /**对家是否已经胡牌 */
                            isHadHu: huCard > 0,
                            isBaoQingHu: isBaoQingHu,
                            /** 是否报胡 */
                            isBaoHu: isBaoHu
                        }
                    },
                }
                this.getGameData().partnerCardsList.push(partnerCard);
            }
            playerList.push(playerInfo);
        });

        this.getDeskData().playerList = playerList;
        if (!dymjGameReconnData.isReady) {
            //说明断线重连处于两局之间，需要清理数据
            this.clearGameData();
            (<DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj)).goOn();
        }
        this.sendNotification(CommandDefine.ReStartGamePush, null);
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
        this.getDeskData().gameSetting.roomId = dymjS2CEnterRoom.roomId;
        this.updateUserInfo(dymjS2CEnterRoom.players);
    }

    /**
     * 收到玩家互动消息
     * @param msgContent 
     */
    playerInteractMsg(msgContent: string) {
        this.sendNotification(CommandDefine.ShowDeskChatMsg, { msgContent })
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