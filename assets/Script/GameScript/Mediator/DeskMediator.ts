
import { INotification } from "../../Framework/interfaces/INotification";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import BaseMediator from "../Mediator/BaseMediator"
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { DeskProxy } from "../Proxy/DeskProxy"
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy"
import { DymjProxy } from '../Proxy/DymjProxy';
import DeskPanelView from "../Component/DeskPanelView";
import { DeskEventName, PlayerInfo } from "../repositories/DeskRepository";
import { DymjOperationType } from "../GameData/Dymj/DymjOperationType";
import { DymjGang } from "../GameData/Dymj/s2c/DymjGang";
import { DymjPeng } from "../GameData/Dymj/s2c/DymjPeng";
import { DymjHu } from "../GameData/Dymj/s2c/DymjHu";
import { DymjTing } from "../GameData/Dymj/s2c/DymjTing";
import { DymjGameResult } from "../GameData/Dymj/s2c/DymjGameResult";
import { DymjMusicManager } from '../Other/DymjMusicManager';
import { DeskPanelViewEventDefine } from "../GameConst/Event/DeskPanelViewEventDefine";
import ChatBox, { MsgObj } from "../Component/ChatBox";

export class DeskMediator extends BaseMediator {

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
        this.listenerEvent();
    }

    private listenerEvent() {
        // 加载完成事件
        this.viewComponent.on(DeskPanelViewEventDefine.DeskPanelViewOnLoadComplate, () => {
            this.getDymjProxy().ready();
        });
    }

    protected prefabSource(): string {
        return PrefabDefine.DeskPanel;
    }
    private DeskPanelViewScript: DeskPanelView = null;
    private deskPanel: cc.Node = null;
    private deskProxy: DeskProxy;
    private dymjGameResult: DymjGameResult = null;
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
            PrefabDefine.RecordAlert,
            PrefabDefine.ChatBox
        ];
    }
    public getDeskProxy(): DeskProxy {
        return <DeskProxy>this.facade.retrieveProxy(ProxyDefine.Desk);
    }

    public getDymjProxy(): DymjProxy {
        return <DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj);
    }
    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitDeskPanel,
            CommandDefine.RefreshPlayerPush,
            CommandDefine.LicensingCardPush,
            CommandDefine.ExitDeskPanel,
            CommandDefine.GetGameCardPush,
            CommandDefine.ShowCard,
            CommandDefine.ShowCardPush,
            CommandDefine.ShowCardNotificationPush,
            CommandDefine.ShowMyEventPush,
            CommandDefine.EventDonePush,
            CommandDefine.OpenRecordAlter,
            CommandDefine.ShowCenterEffect,
            CommandDefine.ReStartGamePush,
            CommandDefine.ShowCardEffect,
            CommandDefine.Entrust,
            CommandDefine.EntrustNotice,
            CommandDefine.OpenEntrustPanel,
            CommandDefine.OpenChatBox,
            CommandDefine.ShowDeskChatMsg,
            CommandDefine.WebSocketReconnect
        ];
    }

    public openRecordAlter(data) {
        if (this.recordAlterNode && this.recordAlterNode.isValid) {
            this.recordAlterNode.destroy();
        }
        let recordAlterResource = cc.loader.getRes(PrefabDefine.RecordAlert, cc.Prefab);
        this.recordAlterNode = <cc.Node>cc.instantiate(recordAlterResource);
        this.view.addChild(this.recordAlterNode);
        let script = this.recordAlterNode.getComponent("RecordAlert");
        script.buildData(data);
    }

    public playEventSound(eventName: DeskEventName, cardNumber?: number) {
        if (cardNumber) {
            DymjMusicManager.put(cardNumber - 1, 1);
        } else {
            switch (eventName) {
                case 'bar': DymjMusicManager.gang(1); break;
                case 'touch': DymjMusicManager.peng(1); break;
                case 'zimo': DymjMusicManager.ziMo(1); break;
                case 'ting':
                    //const _correlationInfoData = this.getDeskProxy().repository.gameData.eventData.gameEventData.deskGameEvent.correlationInfoData;
                    DymjMusicManager.baoHu(1);
                    break;
                case 'qingHu': DymjMusicManager.qingHu(1); break;
                case 'hu': DymjMusicManager.dianPao(1); break;
            }
        }

    }

    public async handleNotification(notification: INotification) {

        // const gameData = this.getDeskProxy().getGameData();
        // const deskData = this.getDeskProxy().getDeskData();
        // console.log('gameData', gameData);
        // console.log('deskData', deskData);

        switch (notification.getName()) {
            case CommandDefine.InitDeskPanel:
                this.roundMark = notification.getBody().dymjS2CEnterRoom.roundMark;
                this.sendNotification(CommandDefine.CloseLoadingPanel);
                await this.init();
                this.deskPanel = this.viewComponent.getChildByName('deskView');
                this.DeskPanelViewScript = this.deskPanel.getComponent('DeskPanelView') as DeskPanelView;
                this.getDeskProxy().updateDeskInfo(notification.getBody().dymjS2CEnterRoom);
                this.DeskPanelViewScript.updateRoomInfo();
                this.DeskPanelViewScript.bindDskOpreationEvent(node => {
                    if (node.name === 'exitIcon') {
                        //退出房间
                        const { playerList } = this.getDeskProxy().repository.deskData;
                        if (playerList.length === 1) {
                            this.getDymjProxy().logout();
                            this.sendNotification(CommandDefine.ExitDeskPanel);
                        } else {
                            this.sendNotification(CommandDefine.OpenToast, { content: '抱歉，牌局未完成，请勿退出牌局' });
                        }
                    } else if (node.name === 'recordIcon') {
                        // if (this.dymjGameResult) {
                        //     this.openRecordAlter(this.dymjGameResult);
                        // } else {
                        //     this.sendNotification(CommandDefine.OpenToast, { content: '抱歉，暂无对战记录~' });
                        // }
                        this.sendNotification(CommandDefine.OpenRecordDetailList, this.roundMark, "");
                    } else if (node.name === 'helpIcon') {
                        this.DeskPanelViewScript.openHelperAlert();
                    } else if (node.name === 'setIcon') {
                        this.sendNotification(CommandDefine.OpenSetting);
                    } else if (node.name === 'chatIcon') {
                        this.sendNotification(CommandDefine.OpenChatBox);
                    }
                });
                /**出牌事件 */
                this.DeskPanelViewScript.bindShowCardEvent(cardNumber => {
                    this.sendNotification(CommandDefine.ShowCard, { cardNumber })
                });
                this.DeskPanelViewScript.bindGameOpreationEvent((node, correlationInfoData) => {
                    if (node.name === "bar") {
                        //杠
                        this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getDymjProxy().operation(DymjOperationType.GANG, card); });
                    } else if (node.name === "touch") {
                        //碰
                        this.getDymjProxy().operation(DymjOperationType.PENG, (correlationInfoData.peng as DymjPeng).mjValue);
                    } else if (node.name === 'hu') {
                        //胡
                        if (correlationInfoData.hu.isTianHu) {
                            //天胡
                            this.getDymjProxy().operation(DymjOperationType.TING, 0);
                        } else {
                            this.getDymjProxy().operation(DymjOperationType.HU, (correlationInfoData.hu as DymjHu).mjValue);
                        }

                    } else if (node.name === 'baoHu') {
                        //一般报胡
                        if (this.getDeskProxy().repository.gameData.myCards.cardsChoose.length === 0) {
                            //有可能是没有摸牌的情况下报牌
                            this.getDymjProxy().operation(DymjOperationType.TING, 0);
                        } else {
                            this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getDymjProxy().operation(DymjOperationType.TING, card); });
                        }
                    } else if (node.name === 'baoQingHu') {
                        //报请胡
                        if (this.getDeskProxy().repository.gameData.myCards.cardsChoose.length === 0) {
                            //有可能是没有摸牌的情况下报牌
                            this.getDymjProxy().operation(DymjOperationType.TING, 0);
                        } else {
                            this.DeskPanelViewScript.updateChooseCardsAndHandler(card => { this.getDymjProxy().operation(DymjOperationType.TING, card); });
                        }
                    } else if (node.name === 'qingHu') {
                        //请胡
                        //this.sendNotification(CommandDefine.ShowCard, { cardNumber: (correlationInfoData.qingHu as DymjHu).mjValue, isQingHu: true })
                        this.getDymjProxy().operation(DymjOperationType.QING_HU, (correlationInfoData.qingHu as DymjHu).mjValue);
                    } else if (node.name === 'pass') {
                        //过
                        this.getDymjProxy().operation(DymjOperationType.XIAO, 0);
                    }
                });
                break;
            case CommandDefine.OpenRecordAlter:
                this.dymjGameResult = notification.getBody();
                this.DeskPanelViewScript.scheduleOnce(() => {
                    this.openRecordAlter(notification.getBody());
                }, 2);

                // 结束就立马关闭托管面板
                this.DeskPanelViewScript.closeEntrustMask();
                this.DeskPanelViewScript.updatePlayerHeadView();
                break;
            case CommandDefine.RefreshPlayerPush:
                this.DeskPanelViewScript && this.DeskPanelViewScript.updatePlayerHeadView();
                break;
            case CommandDefine.ExitDeskPanel:
                this.deskPanel.destroy();
                break;
            case CommandDefine.LicensingCardPush://发牌
                this.DeskPanelViewScript.updateRoomInfo();
                this.sendNotification(CommandDefine.ShowCenterEffect, { isMe: undefined });
                this.DeskPanelViewScript.updatedDeskAiming();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateCountDown();
                this.DeskPanelViewScript.updateMyCurCardList(() => {
                    this.DeskPanelViewScript.updateHandCardAndHuCard();
                    this.DeskPanelViewScript.updateOutCard();
                    //在这里加入发牌动画
                    this.getDymjProxy().dealOver();
                });
                break;
            case CommandDefine.ReStartGamePush://下一局
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
                break;
            case CommandDefine.GetGameCardPush://摸牌
                this.DeskPanelViewScript.updateHandCardAndHuCard();//更新手牌
                this.DeskPanelViewScript.updateMyOperationBtu();//可能有杠/胡
                this.DeskPanelViewScript.updatedDeskAiming();
                this.DeskPanelViewScript.updateCountDown();
                break;
            case CommandDefine.ShowCardPush://玩家出牌推送
                const { playerInfo, showCard } = notification.getBody();
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.createOutCard((playerInfo as PlayerInfo).gameIndex);
                this.playEventSound('', showCard);
                this.DeskPanelViewScript.closeChooseCardPanel();
                break;
            case CommandDefine.EventDonePush://玩家处理操作之后的推送
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateMyBarAndTouchCard();
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updatedDeskAiming();
                // const givePlayer: PlayerInfo = notification.getBody().givePlayer;
                // const giveCard: number = notification.getBody().giveCard;
                const _body = <{ givePlayer: PlayerInfo, giveCard: number, isMe: boolean, eventName: DeskEventName }>notification.getBody();
                const { givePlayer, giveCard, eventName } = _body;
                this.playEventSound(eventName);
                givePlayer && giveCard && this.DeskPanelViewScript.deleteOutCard(givePlayer.gameIndex, giveCard);//去除outcard
                this.sendNotification(CommandDefine.ShowCenterEffect, { isMe: _body.isMe });
                break;
            case CommandDefine.ShowCardNotificationPush://通知出牌
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateCountDown();//更新倒计时
                this.DeskPanelViewScript.updatedDeskAiming();
                break;
            case CommandDefine.ShowMyEventPush://通知本方有事件
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.playEventSound(notification.getBody().eventName);
                break;
            case CommandDefine.ShowCard://本方出牌
                const { cardNumber, isQingHu } = notification.getBody();
                this.getDymjProxy().putMahkjong(cardNumber, isQingHu);
                break;
            case CommandDefine.ShowCenterEffect://显示中间大字
                const { isMe } = notification.getBody();
                this.DeskPanelViewScript.updateEventWran(isMe, () => {
                    this.getDeskProxy().clearDeskGameEvent();
                });
                break;
            case CommandDefine.ShowCardEffect://显示打出的牌
                const body = notification.getBody();
                this.DeskPanelViewScript.showCardAlert(body.gameIndex, body.cardNumber)
                break;
            case CommandDefine.OpenEntrustPanel://打开托管提示面板
                this.DeskPanelViewScript && this.DeskPanelViewScript.openEntrustMask();
                this.isEntrust = true;
                break;
            case CommandDefine.Entrust:
                this.getDymjProxy().entrust(notification.getBody().command || false);
                break;
            case CommandDefine.EntrustNotice://点击取消托管后收到的消息
                // const { entrustState } = notification.getBody();
                // if (entrustState) this.DeskPanelViewScript.closeEntrustMask();
                this.DeskPanelViewScript.closeEntrustMask();
                this.isEntrust = false;
                break;
            case CommandDefine.OpenChatBox://打开聊天窗口 
                const cartBox = cc.loader.getRes(PrefabDefine.ChatBox, cc.Prefab);
                const cartBoxNode: cc.Node = cc.instantiate(cartBox)
                this.viewComponent.addChild(cartBoxNode);
                const chatBoxScript = (cartBoxNode.getComponent("ChatBox") as ChatBox)
                chatBoxScript.show();
                chatBoxScript.bindSendHandler((msgObj: MsgObj) => {
                    //console.log(JSON.stringify(msgObj));
                    this.getDymjProxy().sendInteractMsg(JSON.stringify(msgObj));
                });
                break;
            case CommandDefine.ShowDeskChatMsg:
                const { msgContent } = notification.getBody();
                this.DeskPanelViewScript.openChatMsgNotice(JSON.parse(msgContent));
                break;
            case CommandDefine.WebSocketReconnect://重连
                this.sendNotification(CommandDefine.OpenToast, { content: "准备重连" })
                // location.reload();
                // this.sendNotification(CommandDefine.OpenToast, { content: '开始重连' });
                // window.setTimeout(() => { 
                //     this.DeskPanelViewScript.openReloadPanel();
                // }, 2000)
                this.getDymjProxy().loginGame(this.getDeskProxy().getDeskData().gameSetting.roomId);
                break;
        }
    }
}
