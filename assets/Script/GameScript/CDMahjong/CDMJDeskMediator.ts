import BaseMediator from "../Mediator/BaseMediator";
import { DeskPanelViewEventDefine } from "../GameConst/Event/DeskPanelViewEventDefine";
import { CDMJProxyDefine } from "./CDMJConst/CDMJProxyDefine";
import { XzddProxy } from "./XzddProxy"
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { CDMJDeskProxy } from "./CDMJDeskProxy"
import { PrefabDefine } from "../CDMahjong/CDMJConst/CDMJPrefabDefine";
import CDMJDeskPanelView from "./Component/CDMJDeskPanelView";
import { XzddGameResult } from "../GameData/Xzdd/s2c/XzddGameResult";
import { CDMJCommandDefine } from "./CDMJConst/CDMJCommandDefine";
import { GameNoDefine } from "../GameConst/GameNoDefine";
import { DeskEventName, PlayerInfo } from "./CDMJDeskRepository";
import { INotification } from "../../Framework/interfaces/INotification";
import { MusicManager } from "../Other/MusicManager";
import { AudioSourceDefine } from "../MahjongConst/AudioSourceDefine";
import { XzddOperationType } from "../GameData/Xzdd/XzddOperationType";
import { XzddPeng } from "../GameData/Xzdd/s2c/XzddPeng";
import { XzddHu } from "../GameData/Xzdd/s2c/XzddHu";
import ChatBox, { MsgObj } from "../Component/DdYiMahjong/ChatBox";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { CDMJMusicManager } from "./CDMJMusicManager";



export default class CDMJDeskMediator extends BaseMediator {
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.listenerEvent();
    }

    private listenerEvent() {
        // 加载完成事件
        this.viewComponent.on(DeskPanelViewEventDefine.CDMJDeskPanelViewOnLoadComplate, () => {
            this.getCdmjProxy().ready();
        });
    }

    protected prefabSource(): string {
        return PrefabDefine.CDMJDesk;
    }
    private DeskPanelViewScript: CDMJDeskPanelView = null;
    private deskPanel: cc.Node = null;
    private deskProxy: CDMJDeskProxy;
    private xzddGameResult: XzddGameResult = null;
    /** 结算面板 */
    private recordAlterNode: cc.Node = null;

    /** 根据这个值在游戏中查询战绩 */
    private roundMark: string;

    /** 是否托管 */
    private isEntrust: boolean;
    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [
            //PrefabDefine.DeskPanel,
            PrefabDefine.CDMJRecordAlert,
            PrefabDefine.ChatBox
        ];
    }
    public getDeskProxy(): CDMJDeskProxy {
        return <CDMJDeskProxy>this.facade.retrieveProxy(CDMJProxyDefine.CDMJDesk);
    }

    public getCdmjProxy(): XzddProxy {
        return <XzddProxy>this.facade.retrieveProxy(ProxyDefine.Xzdd);
    }
    public listNotificationInterests(): string[] {
        return [
            CDMJCommandDefine.InitDeskPanel,
            CDMJCommandDefine.RefreshPlayerPush,
            CDMJCommandDefine.LicensingCardPush,
            CDMJCommandDefine.ExitDeskPanel,
            CDMJCommandDefine.GetGameCardPush,
            CDMJCommandDefine.ShowCard,
            CDMJCommandDefine.ShowCardPush,
            CDMJCommandDefine.ShowCardNotificationPush,
            CDMJCommandDefine.ShowMyEventPush,
            CDMJCommandDefine.EventDonePush,
            CDMJCommandDefine.OpenRecordAlter,
            CDMJCommandDefine.ShowCenterEffect,
            CDMJCommandDefine.ReStartGamePush,
            CDMJCommandDefine.ShowCardEffect,
            CDMJCommandDefine.Entrust,
            CDMJCommandDefine.EntrustNotice,
            CDMJCommandDefine.OpenEntrustPanel,
            CDMJCommandDefine.OpenChatBox,
            CDMJCommandDefine.ShowDeskChatMsg,
            CDMJCommandDefine.WebSocketReconnect,
            CDMJCommandDefine.ChangePlayerGold,
            CDMJCommandDefine.DingzhangDone,
            CDMJCommandDefine.AllDingzhangDone,
            CDMJCommandDefine.SwitchOutCard,
            CDMJCommandDefine.SwitchCardDonePush,
            CDMJCommandDefine.SureSwitchCardPush,
            CDMJCommandDefine.SureSwitchCard
        ];
    }

    public openRecordAlter(data) {
        if (this.recordAlterNode && this.recordAlterNode.isValid) {
            this.recordAlterNode.destroy();
        }
        let recordAlterResource = cc.loader.getRes(PrefabDefine.CDMJRecordAlert, cc.Prefab);
        this.recordAlterNode = <cc.Node>cc.instantiate(recordAlterResource);
        this.view.addChild(this.recordAlterNode);
        let script = this.recordAlterNode.getComponent("CDMJRecordAlert");
        script.buildData(data, GameNoDefine.XUE_ZHAN_DAO_DI);
    }

    public playEventSound(eventName: DeskEventName, cardNumber?: number) {
        if (cardNumber) {
            CDMJMusicManager.put(cardNumber - 1, "boy");
        } else {
            switch (eventName) {
                case 'bar': CDMJMusicManager.gangGuaFeng("boy"); break;
                case 'guafeng': CDMJMusicManager.gangGuaFeng("boy"); break;
                case 'xiayu': CDMJMusicManager.gangXiaYu("boy"); break;
                case 'touch': CDMJMusicManager.peng("boy"); break;
                case 'zimo': CDMJMusicManager.ziMo("boy"); break;
                case 'ting':
                    //const _correlationInfoData = this.getDeskProxy().repository.gameData.eventData.gameEventData.deskGameEvent.correlationInfoData;
                    // CDMJMusicManager.baoHu(1);
                    break;
                //case 'qingHu': CDMJMusicManager.qingHu(1); break;
                case 'hu': CDMJMusicManager.dianPao("boy"); break;
            }
        }

    }

    public async handleNotification(notification: INotification) {

        const gameData = this.getDeskProxy().getGameData();
        const deskData = this.getDeskProxy().getDeskData();
        console.log('gameData', gameData);
        console.log('deskData', deskData);

        switch (notification.getName()) {
            case CDMJCommandDefine.InitDeskPanel:
                this.roundMark = notification.getBody().xzddS2CEnterRoom.roundMark;
                this.sendNotification(CommandDefine.CloseLoadingPanel);
                let isReconnect = true;
                if (!this.view || !this.view.isValid) {
                    isReconnect = false;
                    await this.init();
                }
                this.deskPanel = this.viewComponent.getChildByName('cdmjdeskView');
                this.DeskPanelViewScript = this.deskPanel.getComponent('CDMJDeskPanelView') as CDMJDeskPanelView;
                this.getDeskProxy().updateDeskInfo(notification.getBody().xzddS2CEnterRoom);
                this.DeskPanelViewScript.updateRoomInfo();
                this.DeskPanelViewScript.updatedDeskAiming();
                // 如果是重连，在这里发送准备消息
                if (isReconnect) {
                    this.getCdmjProxy().ready();
                    this.sendNotification(CDMJCommandDefine.ReStartGamePush);
                } else {
                    //this.musicManager.playMusic(AudioSourceDefine.BackMusic3);
                    MusicManager.getInstance().playMusic(AudioSourceDefine.BackMusic3);
                    this.DeskPanelViewScript.bindDskOpreationEvent(node => {
                        if (node.name === 'exitIcon') {
                            let seatNumber = this.getDeskProxy().getDeskData().gameSetting.seatNumber;
                            //退出房间
                            const { playerList } = this.getDeskProxy().repository.deskData;
                            if (playerList.length < seatNumber) {
                                this.getCdmjProxy().logout();
                                this.sendNotification(CDMJCommandDefine.ExitDeskPanel);
                            } else {
                                this.sendNotification(CommandDefine.OpenToast, { content: '抱歉，牌局未完成，请勿退出牌局' });
                            }
                        } else if (node.name === 'recordIcon') {
                            // if (this.dymjGameResult) {
                            //     this.openRecordAlter(this.dymjGameResult);
                            // } else {
                            //     this.sendNotification(CDMJCommandDefine.OpenToast, { content: '抱歉，暂无对战记录~' });
                            // }
                            this.sendNotification(CDMJCommandDefine.OpenRecordDetailList, this.roundMark, "");
                        } else if (node.name === 'helpIcon') {
                            this.DeskPanelViewScript.openHelperAlert();
                        } else if (node.name === 'setIcon') {
                            this.sendNotification(CDMJCommandDefine.OpenSetting);
                        } else if (node.name === 'chatIcon') {
                            this.sendNotification(CDMJCommandDefine.OpenChatBox);
                        }
                    });
                    /**出牌事件 */
                    this.DeskPanelViewScript.bindShowCardEvent(cardNumber => {
                        this.sendNotification(CDMJCommandDefine.ShowCard, { cardNumber })
                    });
                    this.DeskPanelViewScript.bindGameOpreationEvent((node, correlationInfoData) => {
                        if (node.name === "bar") {
                            //杠
                            this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getCdmjProxy().operation(XzddOperationType.GANG, card); });
                        } else if (node.name === "touch") {
                            //碰
                            this.getCdmjProxy().operation(XzddOperationType.PENG, (correlationInfoData.peng as XzddPeng).mjValue);
                        } else if (node.name === 'hu') {
                            //胡
                            if (correlationInfoData.hu.isTianHu) {
                                //天胡
                                this.getCdmjProxy().operation(XzddOperationType.TING, 0);
                            } else {
                                this.getCdmjProxy().operation(XzddOperationType.HU, (correlationInfoData.hu as XzddHu).mjValue);
                            }

                        } else if (node.name === 'baoHu') {
                            //一般报胡
                            if (this.getDeskProxy().repository.gameData.myCards.cardsChoose.length === 0) {
                                //有可能是没有摸牌的情况下报牌
                                this.getCdmjProxy().operation(XzddOperationType.TING, 0);
                            } else {
                                this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getCdmjProxy().operation(XzddOperationType.TING, card); });
                            }
                        } else if (node.name === 'baoQingHu') {
                            //报请胡
                            if (this.getDeskProxy().repository.gameData.myCards.cardsChoose.length === 0) {
                                //有可能是没有摸牌的情况下报牌
                                this.getCdmjProxy().operation(XzddOperationType.TING, 0);
                            } else {
                                this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getCdmjProxy().operation(XzddOperationType.TING, card); });
                            }
                        } else if (node.name === 'qingHu') {
                            //请胡
                            //this.sendNotification(CDMJCommandDefine.ShowCard, { cardNumber: (correlationInfoData.qingHu as DymjHu).mjValue, isQingHu: true })
                            this.getCdmjProxy().operation(XzddOperationType.QING_HU, (correlationInfoData.qingHu as XzddHu).mjValue);
                        } else if (node.name === 'pass') {
                            //过
                            this.getCdmjProxy().operation(XzddOperationType.XIAO, 0);
                        } else if (node.name === "ding-wan") {
                            this.getCdmjProxy().dingZhang(0);
                        } else if (node.name === "ding-tong") {
                            this.getCdmjProxy().dingZhang(1);
                        } else if (node.name === "ding-tiao") {
                            this.getCdmjProxy().dingZhang(2);
                        }
                    });
                }
                break;
            case CDMJCommandDefine.OpenRecordAlter:
                this.xzddGameResult = notification.getBody();
                this.DeskPanelViewScript.scheduleOnce(() => {
                    this.openRecordAlter(notification.getBody());
                }, 2);

                // 结束就立马关闭托管面板
                this.DeskPanelViewScript.closeEntrustMask();
                this.DeskPanelViewScript.updatePlayerHeadView();

                break;
            case CDMJCommandDefine.RefreshPlayerPush:
                this.DeskPanelViewScript && this.DeskPanelViewScript.updatePlayerHeadView();
                break;
            case CDMJCommandDefine.ExitDeskPanel:
                this.getDeskProxy().getDeskData().gameSetting.roomId = 0;
                this.deskPanel.destroy();
                //this.view && this.view.destroy();
                break;
            case CDMJCommandDefine.LicensingCardPush://发牌
                CDMJMusicManager.startGame();
                this.DeskPanelViewScript.updateRoomInfo();
                this.sendNotification(CDMJCommandDefine.ShowCenterEffect, { isMe: undefined, gameIndex: -1 });
                this.DeskPanelViewScript.updatedDeskAiming();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateCountDown();
                this.DeskPanelViewScript.updateMyCurCardList(() => {
                    this.DeskPanelViewScript.updateHandCardAndHuCard();
                    this.DeskPanelViewScript.updateOutCard();
                    //在这里加入发牌动画
                    this.getCdmjProxy().dealOver();
                });
                break;
            case CDMJCommandDefine.ReStartGamePush://下一局
                // 开始游戏前关掉结算信息界面
                if (this.recordAlterNode && this.recordAlterNode.isValid) {
                    this.recordAlterNode.destroy();
                    this.recordAlterNode = null;
                }
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateMyBarAndTouchCard();
                this.DeskPanelViewScript.updateOutCard();
                this.DeskPanelViewScript.updatedDeskAiming();
                this.DeskPanelViewScript.updateRoomInfo();
                this.DeskPanelViewScript.updateCountDown();
                this.DeskPanelViewScript.updateDingZhangView();
                break;
            case CDMJCommandDefine.GetGameCardPush://摸牌
                this.DeskPanelViewScript.updateHandCardAndHuCard();//更新手牌
                this.DeskPanelViewScript.updateMyOperationBtu();//可能有杠/胡
                this.DeskPanelViewScript.updatedDeskAiming();
                this.DeskPanelViewScript.updateCountDown();
                break;
            case CDMJCommandDefine.ShowCardPush://玩家出牌推送
                const { playerInfo, showCard } = notification.getBody();
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.createOutCard((playerInfo as PlayerInfo).gameIndex);
                this.playEventSound('', showCard);
                this.DeskPanelViewScript.closeChooseCardPanel();
                break;
            case CDMJCommandDefine.EventDonePush://玩家处理操作之后的推送
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                //this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateMyBarAndTouchCard();
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updatedDeskAiming();
                // const givePlayer: PlayerInfo = notification.getBody().givePlayer;
                // const giveCard: number = notification.getBody().giveCard;
                const _body = <{ givePlayer: PlayerInfo, playerGameIndex: number, giveCard: number, isMe: boolean, eventName: DeskEventName }>notification.getBody();
                const { givePlayer, giveCard, eventName, playerGameIndex } = _body;
                this.playEventSound(eventName);
                givePlayer && giveCard && this.DeskPanelViewScript.deleteOutCard(givePlayer.gameIndex, giveCard);//去除outcard
                this.sendNotification(CDMJCommandDefine.ShowCenterEffect, { isMe: _body.isMe, gameIndex: playerGameIndex });
                break;
            case CDMJCommandDefine.ShowCardNotificationPush://通知出牌
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateCountDown();//更新倒计时
                this.DeskPanelViewScript.updatedDeskAiming();
                break;
            case CDMJCommandDefine.ShowMyEventPush://通知本方有事件
                this.DeskPanelViewScript.updateMyOperationBtu(notification.getBody().suggestFaceSetType);
                //notification.getBody().isZhuaQinghu && this.playEventSound('qingHu');//有可能是对方请胡，自己要抓请胡，需要语音提示
                break;
            case CDMJCommandDefine.ShowCard://本方出牌
                const { cardNumber, isQingHu } = notification.getBody();
                this.getCdmjProxy().putMahkjong(cardNumber, isQingHu);
                break;
            case CDMJCommandDefine.ShowCenterEffect://显示中间大字
                const { isMe, gameIndex } = notification.getBody();
                this.DeskPanelViewScript.updateEventWran(isMe, gameIndex, () => {
                    this.getDeskProxy().clearDeskGameEvent();
                });
                break;
            case CDMJCommandDefine.ShowCardEffect://显示打出的牌
                const body = notification.getBody();
                this.DeskPanelViewScript.showCardAlert(body.gameIndex, body.cardNumber);
                break;
            case CDMJCommandDefine.OpenEntrustPanel://打开托管提示面板
                this.DeskPanelViewScript && this.DeskPanelViewScript.openEntrustMask();
                this.isEntrust = true;
                break;
            case CDMJCommandDefine.Entrust:
                this.getCdmjProxy().entrust(notification.getBody().command || false);
                break;
            case CDMJCommandDefine.EntrustNotice://点击取消托管后收到的消息
                // const { entrustState } = notification.getBody();
                // if (entrustState) this.DeskPanelViewScript.closeEntrustMask();
                this.DeskPanelViewScript.closeEntrustMask();
                this.isEntrust = false;
                break;
            case CDMJCommandDefine.OpenChatBox://打开聊天窗口 
                const cartBox = cc.loader.getRes(PrefabDefine.ChatBox, cc.Prefab);
                const cartBoxNode: cc.Node = cc.instantiate(cartBox)
                this.viewComponent.addChild(cartBoxNode);
                const chatBoxScript = (cartBoxNode.getComponent("ChatBox") as ChatBox)
                chatBoxScript.show();
                chatBoxScript.bindSendHandler((msgObj: MsgObj) => {
                    //console.log(JSON.stringify(msgObj));
                    this.getCdmjProxy().sendInteractMsg(JSON.stringify(msgObj));
                });
                break;
            case CDMJCommandDefine.ShowDeskChatMsg:
                const { msgContent } = notification.getBody();
                this.DeskPanelViewScript.openChatMsgNotice(JSON.parse(msgContent));
                break;
            case CDMJCommandDefine.WebSocketReconnect://重连
                if (this.getDeskProxy().getDeskData().gameSetting.roomId) {
                    this.getCdmjProxy().loginGame(this.getDeskProxy().getDeskData().gameSetting.roomId, true);
                }
                break;
            case CDMJCommandDefine.ChangePlayerGold://金币变化
                this.facade.sendNotification(CDMJCommandDefine.RefreshPlayerPush, {}, '');
                this.DeskPanelViewScript.showPlayerGlodChange();
                break;
            case CDMJCommandDefine.DingzhangDone://玩家定章完成
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updateMyCurCardList();
                break;
            case CDMJCommandDefine.AllDingzhangDone://全部玩家完成定章
                this.DeskPanelViewScript.updateDingZhangView();
                CDMJMusicManager.dingzhangOver();
                break;
            case CDMJCommandDefine.SwitchOutCard://选择要换的牌（执行一次）
                this.DeskPanelViewScript.showSwitchCardList();
                break;
            case CDMJCommandDefine.SwitchCardDonePush://全部玩家确认了换三张的牌
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.trggerSwitchingCardView(false);
                this.DeskPanelViewScript.switchCardDone();
                break;
            case CDMJCommandDefine.SureSwitchCardPush://玩家换三张牌选定点按钮后推送
                //打开切换动效
                this.DeskPanelViewScript.trggerSwitchingCardView(true);
                break;
            case CDMJCommandDefine.SureSwitchCard://换三张牌选定
                const { switchCardArr } = notification.getBody();
                this.getDeskProxy().sureSwitchCard(switchCardArr);
                break;
        }
    }
}
