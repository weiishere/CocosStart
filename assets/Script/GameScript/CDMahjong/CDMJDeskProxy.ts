// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import BaseProxy from '../Proxy/BaseProxy';
import { DeskRepository, GameData, DeskData, PlayerInfo, BarType, RecordType, PartnerCard, MayHuCard, DeskEventName } from './CDMJDeskRepository';
import { XzddPlayerInfo } from '../GameData/Xzdd/s2c/XzddPlayerInfo';
import { CDMJCommandDefine } from "./CDMJConst/CDMJCommandDefine";
import { XzddS2CBeginDealData } from '../GameData/Xzdd/s2c/XzddS2CBeginDealData';
import { XzddOperation } from '../GameData/Xzdd/s2c/XzddOperation';
import { XzddOperationType } from '../GameData/Xzdd/XzddOperationType';
import { XzddS2CPlayerGet } from '../GameData/Xzdd/s2c/XzddS2CPlayerGet';
import { CDMJProxyDefine } from './CDMJConst/CDMJProxyDefine'
import { XzddProxy } from './XzddProxy';
import { XzddS2CShowOperation } from '../GameData/Xzdd/s2c/XzddS2CShowOperation';
import { XzddS2CDoNextOperation } from '../GameData/Xzdd/s2c/XzddS2CDoNextOperation';
import { XzddGameOperation } from '../GameData/Xzdd/s2c/XzddGameOperation';
import { DymjOperationType } from '../GameData/Dymj/DymjOperationType';
import { XzddS2COpPutRsp } from '../GameData/Xzdd/s2c/XzddS2COpPutRsp';
import { XzddUpdateUserCredit } from '../GameData/Xzdd/s2c/XzddUpdateUserCredit';
import { XzddGameResult } from '../GameData/Xzdd/s2c/XzddGameResult';
import { XzddGameReconnData } from '../GameData/Xzdd/s2c/XzddGameReconnData';
import { XzddGameUIResultItem } from '../GameData/Xzdd/s2c/XzddGameUIResultItem';
import { XzddS2CEnterRoom } from '../GameData/Xzdd/s2c/XzddS2CEnterRoom';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { XzddShowDingZhangMahjongs } from '../GameData/Xzdd/s2c/XzddShowDingZhangMahjongs';
import { XzddOpDingZhangMahjongsRsp } from '../GameData/Xzdd/s2c/XzddOpDingZhangMahjongsRsp';
import { XzddOpDingZhangMahjongsBroadCast } from '../GameData/Xzdd/s2c/XzddOpDingZhangMahjongsBroadCast';
import { XzddOpHuan3ZhangMahjongsRsp } from '../GameData/Xzdd/s2c/XzddOpHuan3ZhangMahjongsRsp';
import { XzddOpHuan3ZhangMahjongsBroadCast } from '../GameData/Xzdd/s2c/XzddOpHuan3ZhangMahjongsBroadCast';
import { XzddS2CCheckHu } from '../GameData/Xzdd/s2c/XzddS2CCheckHu';
import { CommandDefine } from '../MahjongConst/CommandDefine';

export class CDMJDeskProxy extends BaseProxy {
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
    updateUserInfo(players: Array<XzddPlayerInfo>) {
        let playerInfos = [];
        this.repository.gameData.partnerCardsList = [];
        players.forEach(p => {
            let playerInfo: PlayerInfo = {
                playerId: p.username,
                playerGold: p.credit,
                playerChangeGold: 0,
                playerHeadImg: p.head,
                playerName: p.nickname,
                master: false,
                playerGender: 0,
                gameIndex: p.azimuth,
                location: {
                    /** 经度 */
                    longitude: p.longitude,
                    /** 纬度 */
                    latitude: p.latitude
                }
            }
            console.log(p.longitude + '--' + p.latitude);
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
                        "setFace": -1,
                        "status": {
                            "isHadHu": false,
                            "huType": -1,
                            "giveHuPlayerIndex": -1,
                            "isBaoHu": false
                        }
                    }
                });
            }
        })

        this.getDeskData().playerList = playerInfos;
        this.facade.sendNotification(CDMJCommandDefine.RefreshPlayerPush, {}, '');
    }

    /**
     * 开始游戏，发牌
     */
    beginGame(xsddS2CBeginDealData: XzddS2CBeginDealData) {
        this.clearGameData();//发牌之前先清理gameData
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        this.getGameData().countDownTime = xsddS2CBeginDealData.time;//倒计时
        const self = this;
        xsddS2CBeginDealData.players.forEach(user => {
            const result = self.getPlayerInfo(user.name);
            if (result) {
                result.master = user.isBank;
            } else {
                console.warn('getPlayerInfo err', user.name);
            }
            if (this.isMy(user.name)) {
                self.getGameData().myCards.curCardList = user.initSpValuesSorted;
                if (user.isBank) {
                    // const lastCard = self.getGameData().myCards.curCardList.pop();
                    // self.getGameData().myCards.handCard = lastCard;
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
                    } else {
                        partnerCard.partnerCards.isHandCard = false;
                    }
                }

            }

        })
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = 'gameBegin';
        this.getDeskData().gameSetting.gameRoundNum = xsddS2CBeginDealData.currentGameCount;
        this.sendNotification(CDMJCommandDefine.LicensingCardPush);
    }
    sureSwitchCard(switchCardArr: Array<number>) {
        this.getGameData().myCards.switchOutCardDefault = switchCardArr;
        (<XzddProxy>this.facade.retrieveProxy(ProxyDefine.Xzdd)).huanSanZhang(switchCardArr);
    }
    private doEventData(oprts: Array<XzddOperation>) {
        oprts.forEach(op => {
            const _eventName = this.getGameData().eventData.gameEventData.myGameEvent.eventName;
            const _correlationInfoData = this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData;

            if (op.oprtType === XzddOperationType.GANG) {
                _eventName.push("bar");
                this.getGameData().myCards.cardsChoose = op.gang.mjValues;
                _correlationInfoData['gang'] = op.gang;
            } else if (op.oprtType === XzddOperationType.PENG) {
                _eventName.push("touch");
                _correlationInfoData['peng'] = op.peng;
            } else if (op.oprtType === XzddOperationType.HU) {
                _eventName.push("hu");
                //if (op.hu.isQingHu) this.getGameData().eventData.deskEventData.eventName = "otherQingHu";
                _correlationInfoData['hu'] = op.hu;
                if (op.hu.huType === 1) {
                    this.getGameData().myCards.mayHuCards = [];//自摸的时候不显示
                }
            } else if (op.oprtType === XzddOperationType.PUT) {
                _eventName.push("show");
                //_correlationInfoData;
            } else if (op.oprtType === XzddOperationType.TING) {
                //_correlationInfoData['ting'] = op.ting;
                if (op.ting.isHu) {
                    //天胡牌
                    _eventName.push("hu");
                    _correlationInfoData['hu'] = Object.assign(op.ting, { isTianHu: true });
                }
                // else if (op.ting.isBaoQingHu) {
                //     //报请胡
                //     _eventName.push("tingQingHu");
                //     _correlationInfoData['ting'] = Object.assign(op.ting, { isBaoQingHu: true });
                //     this.getGameData().myCards.cardsChoose = [];//可能有多种报牌方式
                //     op.ting.list && op.ting.list.forEach(item => this.getGameData().myCards.cardsChoose.push(item.putValue));//list为空表示没有出牌情况下的报牌
                // } 
                else {
                    //一般报牌
                    _eventName.push("ting");
                    _correlationInfoData['ting'] = Object.assign(op.ting, { isBaoHu: true });
                    this.getGameData().myCards.cardsChoose = [];//可能有多种报牌方式
                    op.ting.list && op.ting.list.forEach(item => this.getGameData().myCards.cardsChoose.push(item.putValue));
                }
            } else if (op.oprtType === XzddOperationType.DINGZHANG) {

                _eventName.push("setFace");
            }
            // else if (op.oprtType === XzddOperationType.QING_HU) {
            //     _eventName.push("qingHu");
            //     _correlationInfoData['qingHu'] = op.hu;
            // }
        });
    }
    /**
     * 玩家摸牌
     * @param dymjS2CPlayerGet 
     */
    drawCard(xzddS2CPlayerGet: XzddS2CPlayerGet) {
        // 设置剩余牌
        this.getGameData().remainCard = xzddS2CPlayerGet.cardRemainCount;
        let playerInfo = this.getPlayerByGameIndex(xzddS2CPlayerGet.playerAzimuth);
        this.getGameData().positionIndex = xzddS2CPlayerGet.playerAzimuth;
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().myCards.handCard = xzddS2CPlayerGet.getMjValue;
            if (xzddS2CPlayerGet.nextStep.oprts) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                this.doEventData(xzddS2CPlayerGet.nextStep.oprts);
            } else {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            }
            //不能出的牌(用户报胡之后)
            this.getGameData().myCards.disableCard = xzddS2CPlayerGet.nextStep.datas || [];
            const huList = (xzddS2CPlayerGet.nextStep.args && xzddS2CPlayerGet.nextStep.args.list) ? xzddS2CPlayerGet.nextStep.args.list : [];
            this.getGameData().myCards.mayHuCards = huList.map(item => ({ putCard: item.putValue, huList: item.huList.map(hu => ({ huCard: hu.huValue, fanShu: hu.fanNum, remainNum: hu.remainNum })) }));
            console.log(this.getGameData().myCards.mayHuCards);

            if (this.getGameData().myCards.status.isBaoHu && !xzddS2CPlayerGet.nextStep.oprts) {
                window.setTimeout(() => {
                    (<XzddProxy>this.facade.retrieveProxy(ProxyDefine.Xzdd)).putMahkjong(xzddS2CPlayerGet.getMjValue);
                }, 800);
            }
            // else if (this.getGameData().myCards.status.isBaoQingHu && !xzddS2CPlayerGet.nextStep.oprts) {
            //     const arr = this.getGameData().myCards.curCardList.filter(card => this.getGameData().myCards.disableCard.some(item => item === card) ? false : true);
            //     window.setTimeout(() => {
            //         (<DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj)).putMahkjong(arr.length === 0 ? dymjS2CPlayerGet.getMjValue : arr[0]);
            //     }, 800);
            // }
        } else {
            //console.log('dymjS2CPlayerGet.getMjValue', dymjS2CPlayerGet.getMjValue);
            this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
            let { partnerCards } = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCards.isHandCard = true;
            partnerCards.handCard = xzddS2CPlayerGet.getMjValue;
        }

        this.sendNotification(CDMJCommandDefine.GetGameCardPush);
    }

    /**
     * 有人出牌或者发牌之后，提示自己的碰、杠、胡、听等
     * @param dymjS2CShowOperation 
     */
    updateOperationEvent(xzddS2CShowOperation: XzddS2CShowOperation) {
        let playerInfo = this.getPlayerByGameIndex(xzddS2CShowOperation.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (xzddS2CShowOperation.oprts) {
                console.log('xzddS2CShowOperation.oprts----------', xzddS2CShowOperation.oprts);
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
                this.doEventData(xzddS2CShowOperation.oprts);
            }
            const isZhuaQinghu = false;//this.getGameData().eventData.deskEventData.eventName === 'otherQingHu' ? true : false;
            this.getGameData().eventData.deskEventData.eventName = '';
            this.sendNotification(CDMJCommandDefine.ShowMyEventPush, { eventName: this.getGameData().eventData.gameEventData.myGameEvent.eventName, isZhuaQinghu });
        }
    }
    /**推送定章提示信息 */
    updateDingZhangOperationEvent(xzddShowDingZhangMahjongs: XzddShowDingZhangMahjongs) {
        if (this.getGameData().myCards.setFace !== -1) {
            //本局已经完成了定章
            return;
        }
        console.log('-----------弹出定章推送------------')
        this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['setFace'];
        this.getGameData().eventData.deskEventData.eventName = '';
        this.sendNotification(CDMJCommandDefine.ShowMyEventPush, { eventName: this.getGameData().eventData.gameEventData.myGameEvent.eventName, suggestFaceSetType: xzddShowDingZhangMahjongs.queTypes[0] });
    }
    /**玩家自己完成定章 */
    playerSelfDingzhangDone(xzddOpDingZhangMahjongsRsp: XzddOpDingZhangMahjongsRsp) {
        //console.log(xzddOpDingZhangMahjongsRsp.dingzhangType);
        this.getGameData().myCards.setFace = xzddOpDingZhangMahjongsRsp.dingzhangType;
        this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
        //this.getGameData().myCards.curCardList.sort((a, b) => a - b);
        this.getGameData().myCards.curCardList = xzddOpDingZhangMahjongsRsp.spValuesSorted;
        this.sendNotification(CDMJCommandDefine.DingzhangDone);
    }
    /**所有玩家完成定章 */
    allPlayerDingZhangDone(xzddOpDingZhangMahjongsBroadCast: XzddOpDingZhangMahjongsBroadCast) {
        xzddOpDingZhangMahjongsBroadCast.dingzhangType.forEach((item, index) => {
            const player = this.getDeskData().playerList.find(i => i.gameIndex === index);
            if (this.isMy(player.playerId)) {
                this.getGameData().myCards.setFace = item;
            } else {
                const partner = this.getGameData().partnerCardsList.find(i => i.playerId === player.playerId);
                if (partner) {
                    partner.partnerCards.setFace = item;
                }
            }
        });
        this.sendNotification(CDMJCommandDefine.AllDingzhangDone);
    }

    /**
     * 通知下一步有哪些操作动作(广播有事件)
     * @param dymjS2CDoNextOperation 
     */
    updateNextOperationEvent(xzddS2CDoNextOperation: XzddS2CDoNextOperation) {
        let playerInfo = this.getPlayerByGameIndex(xzddS2CDoNextOperation.playerAzimuth);
        //this.getGameData().countDownTime = dymjS2CDoNextOperation.nextStep.time;
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            if (xzddS2CDoNextOperation.nextStep.type === 1) {
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ["show"];
                this.getGameData().eventData.gameEventData.myGameEvent.correlationInfoData = {};
                //不能出的牌(用户报胡之后/定缺后不能出的牌)
                //this.getGameData().myCards.disableCard = xzddS2CDoNextOperation.nextStep.datas || [];
            } else if (xzddS2CDoNextOperation.nextStep.type === 2) {
                //碰杠胡
                this.doEventData(xzddS2CDoNextOperation.nextStep.oprts);
            }
            //console.log('xzddS2CDoNextOperation.nextStep.datas=====', xzddS2CDoNextOperation.nextStep.datas);
            this.getGameData().myCards.disableCard = xzddS2CDoNextOperation.nextStep.datas || [];
            const huList = (xzddS2CDoNextOperation.nextStep.args && xzddS2CDoNextOperation.nextStep.args.list) ? xzddS2CDoNextOperation.nextStep.args.list : [];
            this.getGameData().myCards.mayHuCards = huList.map(item => ({ putCard: item.putValue, huList: item.huList.map(hu => ({ huCard: hu.huValue, fanShu: hu.fanNum, remainNum: hu.remainNum })) }));
            console.log(this.getGameData().myCards.mayHuCards);
            //this.doEventData(dymjS2CDoNextOperation.nextStep.oprts);
        }
        this.sendNotification(CDMJCommandDefine.ShowCardNotificationPush);
    }

    /** 碰，杠，胡，报胡 游戏事件(对家和自己处理后才接受的数) */
    updateDeskEvent(xzddGameOperation: XzddGameOperation) {
        let playerInfo = this.getPlayerByGameIndex(xzddGameOperation.playerAzimuth);
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

            if (xzddGameOperation.oprtType === XzddOperationType.PENG) {
                this.getGameData().myCards.touchCard.push(xzddGameOperation.peng.mjValue);
                _deskEventName = 'touch';
                _deskEventCorrelationInfoData = correlationInfoData = xzddGameOperation.peng;
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.peng.playerAzimuth);
                giveCard = xzddGameOperation.peng.mjValue;
                this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();//去掉引碰者出牌
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            } else if (xzddGameOperation.oprtType === DymjOperationType.GANG) {
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.gang.playerAzimuth);
                const barType: BarType = { barCard: xzddGameOperation.gang.mjValues[0], barType: xzddGameOperation.gang.gangType as 0 | 1 | 2 };
                this.getGameData().myCards.barCard.push(barType);
                _deskEventName = 'bar';
                _deskEventCorrelationInfoData = correlationInfoData = xzddGameOperation.gang;
                giveCard = xzddGameOperation.gang.mjValues[0];
                switch (xzddGameOperation.gang.gangType) {
                    case 0: _deskEventName = 'guafeng';
                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();//去掉引杠者出牌
                        break;
                    case 1:
                        _deskEventName = 'bar';
                        this.getGameData().myCards.handCard = 0;
                        this.getGameData().myCards.touchCard = this.getGameData().myCards.touchCard.filter(item => item !== giveCard);
                        break;
                    case 2: _deskEventName = 'xiayu';
                        this.getGameData().myCards.handCard = 0;
                        break;
                }

                // if (barType.barType === 1) {
                //     this.getGameData().myCards.touchCard = this.getGameData().myCards.touchCard.filter(item => item !== giveCard);
                // }
                this.getGameData().eventData.gameEventData.myGameEvent.eventName = ['show'];
            } else if (xzddGameOperation.oprtType === DymjOperationType.HU) {
                _deskEventCorrelationInfoData = correlationInfoData = xzddGameOperation.hu;
                this.getGameData().myCards.hadHuCard = xzddGameOperation.hu.mjValue;
                giveCard = xzddGameOperation.hu.mjValue;
                if (xzddGameOperation.hu.huType === 1) {
                    //自摸（去掉摸牌，因为已经转移到了胡牌）
                    _deskEventName = 'zimo';
                    this.getGameData().myCards.handCard = 0;
                } else if (xzddGameOperation.hu.huType === 2) {
                    //抢杠（抢胡）======================================================
                    _deskEventName = 'hu';
                    givePlayer = this.getPlayerByGameIndex(xzddGameOperation.hu.playerAzimuth);
                    const partnerCards = this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards;
                    partnerCards.barCard = partnerCards.barCard.filter(card => card.barCard !== xzddGameOperation.hu.mjValue);
                    partnerCards.touchCard.push(xzddGameOperation.hu.mjValue);
                } else if (xzddGameOperation.hu.huType === 0) {
                    //别人点炮
                    givePlayer = this.getPlayerByGameIndex(xzddGameOperation.hu.playerAzimuth);//引炮者
                    this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();//去掉引炮者出牌
                    this.getGameData().myCards.status.giveHuPlayerIndex = xzddGameOperation.hu.playerAzimuth;
                    _deskEventName = 'hu';
                }
                this.getGameData().myCards.status.isHadHu = true;
                this.getGameData().myCards.status.huType = xzddGameOperation.hu.huType;
            } else if (xzddGameOperation.oprtType === DymjOperationType.TING) {
                _deskEventName = 'ting';
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.ting.playerAzimuth);
                giveCard = xzddGameOperation.ting.mjValue;
                _deskEventCorrelationInfoData = correlationInfoData = xzddGameOperation.ting;
                if (xzddGameOperation.ting) {
                    this.getGameData().myCards.status.isBaoHu = true;
                }
            }
            // 自己剩下的牌
            this.getGameData().myCards.curCardList = xzddGameOperation.spValuesSorted;
            // const huList = xzddGameOperation.huList;
            // this.getGameData().myCards.mayHuCards = huList.map(item => ({ putCard: item., huList: item.huList.map(hu => ({ huCard: hu.huValue, fanShu: hu.fanNum, remainNum: hu.remainNum })) }));

        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            _deskEventName = '';//别人的事件
            if (xzddGameOperation.oprtType === DymjOperationType.PENG) {
                _deskEventName = 'touch'
                _deskEventCorrelationInfoData = xzddGameOperation.peng;
                giveCard = xzddGameOperation.peng.mjValue;
                partnerCard.partnerCards.touchCard.push(xzddGameOperation.peng.mjValue);
                partnerCard.partnerCards.curCardCount -= 2;
                let count = 0;
                partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                    if (item === xzddGameOperation.peng.mjValue && count <= 1) { count++; return false; } else { return true; }
                });
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.peng.playerAzimuth);//引碰者
                if (this.isMy(givePlayer.playerId)) {
                    this.getGameData().myCards.outCardList.pop();
                } else {
                    this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                }
            } else if (xzddGameOperation.oprtType === XzddOperationType.GANG) {
                _deskEventCorrelationInfoData = xzddGameOperation.gang;
                giveCard = xzddGameOperation.gang.mjValues[0];
                const burObj: BarType = { barCard: xzddGameOperation.gang.mjValues[0], barType: xzddGameOperation.gang.gangType as 0 | 1 | 2 };
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.gang.playerAzimuth);//引杠者
                _deskEventName = 'bar';
                if (xzddGameOperation.gang.gangType === 0) {
                    //点杠
                    _deskEventName = 'guafeng'
                    partnerCard.partnerCards.curCardCount -= 3;
                    let count = 0;
                    partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                        if (item === xzddGameOperation.gang.mjValues[0] && count <= 3) { count++; return false; } else { return true; }
                    });
                    if (this.isMy(givePlayer.playerId)) {
                        this.getGameData().myCards.outCardList.pop();
                    } else {
                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                    }
                } else if (xzddGameOperation.gang.gangType === 1) {
                    //抢杠
                    _deskEventName = 'bar';
                    partnerCard.partnerCards.isHandCard = false;
                    partnerCard.partnerCards.handCard = 0;
                    if (this.isMy(givePlayer.playerId)) {
                        this.getGameData().myCards.outCardList.pop();
                    } else {
                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                    }
                    const partnerCards = this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards;
                    partnerCards.touchCard = partnerCards.touchCard.filter(item => item !== giveCard);

                } else if (xzddGameOperation.gang.gangType === 2) {
                    //暗杠
                    _deskEventName = 'xiayu'
                    partnerCard.partnerCards.curCardCount -= 4;
                    let count = 0;
                    partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                        if (item === xzddGameOperation.gang.mjValues[0] && count <= 3) { count++; return false; } else { return true; }
                    });
                    partnerCard.partnerCards.isHandCard = false;
                    partnerCard.partnerCards.handCard = 0;
                }
                partnerCard.partnerCards.barCard.push(burObj);
            } else if (xzddGameOperation.oprtType === DymjOperationType.HU) {
                partnerCard.partnerCards.hadHuCard = xzddGameOperation.hu.mjValue;
                partnerCard.partnerCards.isHandCard = false;
                partnerCard.partnerCards.handCard = 0;
                partnerCard.partnerCards.status.isHadHu = true;
                partnerCard.partnerCards.status.huType = xzddGameOperation.hu.huType;
                this.getGameData().myCards.status.giveHuPlayerIndex = xzddGameOperation.hu.playerAzimuth;
                _deskEventName = xzddGameOperation.hu.huType === 1 ? 'zimo' : 'hu';
                _deskEventCorrelationInfoData = xzddGameOperation.hu;
                giveCard = xzddGameOperation.hu.mjValue;
                givePlayer = this.getPlayerByGameIndex(xzddGameOperation.hu.playerAzimuth);//点炮者
                if (xzddGameOperation.hu.huType === 2) {
                    //被抢杠了
                    this.getGameData().myCards.barCard = this.getGameData().myCards.barCard.filter(card => card.barCard !== xzddGameOperation.hu.mjValue);
                    this.getGameData().myCards.touchCard.push(xzddGameOperation.hu.mjValue);
                } else if (xzddGameOperation.hu.huType === 0) {
                    if (this.isMy(givePlayer.playerId)) {
                        this.getGameData().myCards.outCardList.pop();
                    } else {

                        this.getGameData().partnerCardsList.find(item => item.playerId === givePlayer.playerId).partnerCards.outCardList.pop();
                    }
                }
            } else if (xzddGameOperation.oprtType === DymjOperationType.TING) {
                _deskEventName = 'ting';
                _deskEventCorrelationInfoData = xzddGameOperation.ting;
                partnerCard.partnerCards.status.isBaoHu = true;
                giveCard = xzddGameOperation.ting.mjValue;
            }
        }
        //更新方向
        this.getGameData().positionIndex = xzddGameOperation.playerAzimuth;
        //更新中间大字数据
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = _deskEventName;
        this.getGameData().eventData.gameEventData.deskGameEvent.correlationInfoData = _deskEventCorrelationInfoData;
        //this.sendNotification(CDMJCommandDefine.RefreshPlayerPush);
        this.sendNotification(CDMJCommandDefine.EventDonePush, { givePlayer, giveCard, playerGameIndex: playerInfo.gameIndex, isMe: this.isMy(playerInfo.playerId), eventName: _deskEventName });
    }

    /** 自己和对家出牌（出牌之后） */
    updateOutCard(xzddS2COpPutRsp: XzddS2COpPutRsp) {
        let playerInfo = this.getPlayerByGameIndex(xzddS2COpPutRsp.playerAzimuth);
        // 如果是自己
        if (this.isMy(playerInfo.playerId)) {
            this.getGameData().eventData.gameEventData.myGameEvent.eventName = [];
            this.getGameData().myCards.outCardList.push(xzddS2COpPutRsp.putMjValue);
            this.getGameData().myCards.handCard = 0;
            this.getGameData().myCards.curCardList = xzddS2COpPutRsp.spValuesSorted;

        } else {
            let partnerCard = this.getGameData().partnerCardsList.find(partener => partener.playerId === playerInfo.playerId);
            partnerCard.partnerCards.outCardList.push(xzddS2COpPutRsp.putMjValue);

            if (!partnerCard.partnerCards.isHandCard) {
                partnerCard.partnerCards.curCardCount--;
                // let count = 0;
                // //确保只删除打出的牌
                // partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                //     if (item === xzddS2COpPutRsp.putMjValue && count === 0) { count++; return false; } else { return true; }
                // });
            } else {
                //如果有手牌，这里要注意看打出的牌是否等于手牌
                if (partnerCard.partnerCards.handCard !== xzddS2COpPutRsp.putMjValue) {
                    //出的不是手牌
                    let count = 0;
                    // partnerCard.partnerCards.curCardList = partnerCard.partnerCards.curCardList.filter((item, index) => {
                    //     if (item === xzddS2COpPutRsp.putMjValue && count === 0) { count++; return false; } else { return true; }
                    // });
                    // partnerCard.partnerCards.handCard !== 0 && partnerCard.partnerCards.curCardList.push(partnerCard.partnerCards.handCard + 0);
                    // partnerCard.partnerCards.curCardList.sort((a, b) => a - b);
                }
            }
            partnerCard.partnerCards.curCardList = xzddS2COpPutRsp.spValuesSorted

            partnerCard.partnerCards.isHandCard = false;
            partnerCard.partnerCards.handCard = 0;
        }
        //暂时这里只显示对家的出票，为了游戏流畅性，玩家出牌在放手后就调用（其他地方），而不等返回了
        if (!this.isMy(this.getPlayerByGameIndex(xzddS2COpPutRsp.playerAzimuth).playerId)) this.sendNotification(CDMJCommandDefine.ShowCardEffect, { gameIndex: xzddS2COpPutRsp.playerAzimuth, cardNumber: xzddS2COpPutRsp.putMjValue });
        this.sendNotification(CDMJCommandDefine.ShowCardPush, { playerInfo, showCard: xzddS2COpPutRsp.putMjValue });
    }

    /**收到换三张的提示信息 */
    chooseSwitchOutCard(chooseCardList: Array<number>): void {
        if (this.getGameData().myCards.switchInCard.length !== 0) return;
        this.getGameData().switchCardCountDown = 30;
        //this.getGameData().myCards.switchOutCard = chooseCardList;
        this.sendNotification(CDMJCommandDefine.SwitchOutCard);
    }
    /**收到换三张的结果信息 */
    chooseSwitchInCard(xzddOpHuan3ZhangMahjongsBroadCast: XzddOpHuan3ZhangMahjongsBroadCast) {
        this.getGameData().switchCardCountDown = 0;
        this.getGameData().myCards.switchInCard = xzddOpHuan3ZhangMahjongsBroadCast.newMahjongs;
        this.getGameData().myCards.curCardList = xzddOpHuan3ZhangMahjongsBroadCast.spValuesSorted;
        // console.log('newMahjongs--------------', this.getGameData().myCards.switchInCard);
        this.sendNotification(CDMJCommandDefine.SwitchCardDonePush);
    }
    /** 更新玩家金币 */
    updatePlayerGold(xzddUpdateUserCredit: XzddUpdateUserCredit) {
        xzddUpdateUserCredit.players.forEach(updatePlayer => {
            const player = this.getPlayerByGameIndex(updatePlayer.azimuth);
            if (player) {
                const deskPlayer = this.getDeskData().playerList.find(item => item.playerId === player.playerId);
                if (deskPlayer) {
                    deskPlayer.playerGold = updatePlayer.credit;
                    deskPlayer.playerChangeGold = updatePlayer.changeCredit;
                }
            }
        });
        this.sendNotification(CDMJCommandDefine.ChangePlayerGold);
        //恢复
        window.setTimeout(() => {
            this.getDeskData().playerList.forEach(item => item.playerChangeGold = 0);
        }, 2000);
    }
    /**更新实时的可胡牌 */
    updateRtMayHuCard(content: XzddS2CCheckHu) {
        this.getGameData().myCards.mayHuCardsRT = content.huList;
        if (this.getGameData().myCards.mayHuCardsRT.length === 0) {
            this.sendNotification(CommandDefine.OpenToast, { content: "您暂无可胡牌~" });
            return;
        }
        this.sendNotification(CDMJCommandDefine.HuCardListPush);
    }
    private clearGameData() {
        //清空数据
        let _partnerCardsList = [];
        const { playerList } = this.repository.deskData
        playerList.forEach(element => {
            if (!this.isMy(element.playerId)) {
                _partnerCardsList.push({
                    playerId: element.playerId,
                    partnerCards: {
                        curCardCount: 0,
                        curCardList: [],
                        isHandCard: false,
                        handCard: 0,
                        touchCard: [],
                        barCard: [],
                        hadHuCard: 0,
                        outCardList: [],
                        setFace: -1,
                        status: {
                            isHadHu: false,
                            huType: -1,
                            giveHuPlayerIndex: -1,
                            isBaoHu: false
                        }
                    }
                })
            }
        });
        this.repository.gameData = JSON.parse(JSON.stringify(this.dataBackup.gameData));//Object.assign({}, this.dataBackup.gameData);
        this.repository.gameData.partnerCardsList = _partnerCardsList;
    }
    /**清理事件列表 */
    clearEventList() {
        let eventName = this.getGameData().eventData.gameEventData.myGameEvent.eventName;
        this.getGameData().eventData.gameEventData.myGameEvent.eventName = eventName.indexOf('show') === -1 ? [] : ['show'];
    }
    /** 游戏结束 */
    gameOver(dymjGameResult: XzddGameResult) {
        this.getGameData().eventData.gameEventData.deskGameEvent.eventName = 'gameEnd';
        this.clearGameData();

        //更新用户金币
        dymjGameResult.players.forEach(player => {
            this.repository.deskData.playerList.find(item => item.playerId === player.userName).playerGold = player.credit;
        })
        this.getGameData().myCards.mayHuCardsRT = [];
        this.sendNotification(CDMJCommandDefine.OpenRecordAlter, dymjGameResult);
    }

    /**
     * 游戏重连
     */
    gameReconnect(dymjGameReconnData: XzddGameReconnData) {
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
                playerChangeGold: 0,
                playerGender: 0,
                playerHeadImg: player.playerInfo.head,
                playerName: player.playerInfo.nickname,
                master: player.isBank,
                location: {
                    /** 经度 */
                    longitude: player.playerInfo.longitude,
                    /** 纬度 */
                    latitude: player.playerInfo.latitude
                }
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
                    setFace: player.dingzhang ? player.dingzhang.dingzhangType : -1,
                    handCard: handCard,
                    cardsChoose: [],
                    disableCard: [],
                    mayHuCards: [],
                    mayHuCardsRT: [],
                    status: {
                        isHadHu: huCard > 0,
                        huType: player.huValues.length !== 0 ? player.huValues[0].huType : -1,
                        giveHuPlayerIndex: player.huValues.length !== 0 ? player.huValues[0].playerAzimuth : -1,
                        isBaoHu: isBaoHu
                    },
                    switchOutCardDefault: [],
                    //switchOutCard: [],
                    switchInCard: []
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
                        setFace: player.dingzhang ? player.dingzhang.dingzhangType : -1,
                        /**对家的状态 */
                        status: {
                            /**对家是否已经胡牌 */
                            isHadHu: huCard > 0,
                            huType: player.huValues.length !== 0 ? player.huValues[0].huType : -1,
                            giveHuPlayerIndex: player.huValues.length !== 0 ? player.huValues[0].playerAzimuth : -1,
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
            (<XzddProxy>this.facade.retrieveProxy(ProxyDefine.Xzdd)).goOn();
        }
        this.sendNotification(CDMJCommandDefine.ReStartGamePush, null);
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

    getResultDesc(list: XzddGameUIResultItem[]) {
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
    updateDeskInfo(dymjS2CEnterRoom: XzddS2CEnterRoom) {
        this.getDeskData().gameSetting.gameRoundNum = dymjS2CEnterRoom.currentRoundNo;
        this.getDeskData().gameSetting.totalRound = dymjS2CEnterRoom.totalRound;
        this.getDeskData().gameSetting.baseScore = dymjS2CEnterRoom.value;
        this.getDeskData().gameSetting.fanTime = dymjS2CEnterRoom.fanNum;
        this.getDeskData().gameSetting.roomId = dymjS2CEnterRoom.roomId;
        this.getDeskData().gameSetting.seatNumber = dymjS2CEnterRoom.seatNumber;
        this.getDeskData().gameSetting.roomName = dymjS2CEnterRoom.roomName;
        this.updateUserInfo(dymjS2CEnterRoom.players);
    }

    /**
     * 收到玩家互动消息
     * @param msgContent 
     */
    playerInteractMsg(msgContent: string) {
        this.sendNotification(CDMJCommandDefine.ShowDeskChatMsg, { msgContent })
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