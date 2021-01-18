
import { INotification } from "../../Framework/interfaces/INotification";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import BaseMediator from "../Mediator/BaseMediator"
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { DeskProxy } from "../Proxy/DeskProxy"
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy"
import { DymjProxy } from '../Proxy/DymjProxy';
import DeskPanelView from "../Component/DeskPanelView";
import { PlayerInfo } from "../repositories/DeskRepository";
import { DymjOperationType } from "../GameData/Dymj/DymjOperationType";
import { DymjGang } from "../GameData/Dymj/s2c/DymjGang";
import { DymjPeng } from "../GameData/Dymj/s2c/DymjPeng";
import { DymjHu } from "../GameData/Dymj/s2c/DymjHu";

export class DeskMediator extends BaseMediator {

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }
    protected prefabSource(): string {
        return PrefabDefine.DeskPanel;
    }
    private DeskPanelViewScript: DeskPanelView = null;
    private deskPanel: cc.Node = null;
    private deskProxy: DeskProxy;
    /** 结算面板 */
    private recordAlterNode: cc.Node = null;
    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [
            //PrefabDefine.DeskPanel,
            PrefabDefine.RecordAlert
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
            CommandDefine.ReStartGamePush
        ];
    }

    public openRecordAlter(data) {
        let recordAlterResource = cc.loader.getRes(PrefabDefine.RecordAlert, cc.Prefab);
        this.recordAlterNode = <cc.Node>cc.instantiate(recordAlterResource);
        this.view.addChild(this.recordAlterNode);
        let script = this.recordAlterNode.getComponent("RecordAlert");
        script.buildData(data);
    }

    public async handleNotification(notification: INotification) {

        const gameData = this.getDeskProxy().getGameData();
        const deskData = this.getDeskProxy().getDeskData();
        console.log('gameData', gameData);
        console.log('deskData', deskData);
        switch (notification.getName()) {
            case CommandDefine.InitDeskPanel:
                await this.init();
                this.deskPanel = this.viewComponent.getChildByName('deskView');
                this.DeskPanelViewScript = this.deskPanel.getComponent('DeskPanelView') as DeskPanelView;
                this.getDeskProxy().updateDeskInfo(notification.getBody().dymjS2CEnterRoom);


                this.DeskPanelViewScript.bindDskOpreationEvent(node => {
                    if (node.name === 'exitIcon') {
                        //退出房间
                        const { gameRoundNum, totalRound } = this.getDeskProxy().repository.deskData.gameSetting;
                        if (gameRoundNum !== totalRound) {
                            this.sendNotification(CommandDefine.OpenToast, { content: '抱歉，牌局未完成，请勿退出牌局' });
                        } else {
                            this.getDymjProxy().logout();
                            this.sendNotification(CommandDefine.ExitDeskPanel);
                        }
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
                        this.getDymjProxy().operation(DymjOperationType.HU, (correlationInfoData.hu as DymjHu).mjValue);
                    } else if (node.name === 'baoHu') {
                        //报胡
                        this.getDymjProxy().operation(DymjOperationType.TING, 0);
                    } else if (node.name === 'qingHu') {
                        //请胡
                        //this.sendNotification(CommandDefine.ShowCard, { cardNumber: (correlationInfoData.qingHu as DymjHu).mjValue, isQingHu: true })
                        this.getDymjProxy().operation(DymjOperationType.QING_HU, (correlationInfoData.qingHu as DymjHu).mjValue);
                    } else if (node.name === 'pass') {
                        //过
                        this.getDymjProxy().operation(DymjOperationType.XIAO, 0);
                    }


                });
                // 发送准备
                this.getDymjProxy().ready();
                break;
            case CommandDefine.OpenRecordAlter:
                this.openRecordAlter(notification.getBody());
                break;
            case CommandDefine.RefreshPlayerPush:
                this.DeskPanelViewScript.updatePlayerHeadView();
                break;
            case CommandDefine.ExitDeskPanel:
                this.deskPanel.destroy();
                break;
            case CommandDefine.LicensingCardPush://发牌
                this.DeskPanelViewScript.updateRoomInfo();
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateOutCard();
                this.sendNotification(CommandDefine.ShowCenterEffect);
                //在这里加入发牌动画
                this.getDymjProxy().dealOver();
                this.DeskPanelViewScript.updatedDeskAiming();
                break;
            case CommandDefine.ReStartGamePush://下一局
                // 开始游戏前关掉结算信息界面
                if (this.recordAlterNode) {
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
                const { givePlayer, giveCard } = notification.getBody();
                givePlayer && giveCard && this.DeskPanelViewScript.deleteOutCard(givePlayer.gameIndex, giveCard);//去除outcard
                this.sendNotification(CommandDefine.ShowCenterEffect);
                break;
            case CommandDefine.ShowCardNotificationPush://通知出牌
                this.DeskPanelViewScript.updateMyOperationBtu();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateCountDown();//更新倒计时
                break;
            case CommandDefine.ShowMyEventPush://通知本方有事件
                this.DeskPanelViewScript.updateMyOperationBtu();
                break;
            case CommandDefine.ShowCard://本方出牌
                const { cardNumber, isQingHu } = notification.getBody();
                this.getDymjProxy().putMahkjong(cardNumber, isQingHu);
                break;
            case CommandDefine.ShowCenterEffect://显示中间大字
                this.DeskPanelViewScript.updateEventWran(() => {
                    this.getDeskProxy().clearDeskGameEvent();
                });
                break;
        }
    }
}
