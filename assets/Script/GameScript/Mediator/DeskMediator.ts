
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
            CommandDefine.EventDonePush
        ];
    }

    public openRecordAlter(data) {
        let recordAlterResource = cc.loader.getRes(PrefabDefine.RecordAlert, cc.Prefab);
        this.recordAlterNode = <cc.Node>cc.instantiate(recordAlterResource);
        this.view.addChild(this.recordAlterNode);
        let script = this.recordAlterNode.getComponent("RecordAlter");
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
                        this.getDymjProxy().logout();
                        this.facade.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
                    }
                });
                this.DeskPanelViewScript.bindShowCardEvent(cardNumber => {
                    this.sendNotification(CommandDefine.ShowCard, { cardNumber })
                });
                this.DeskPanelViewScript.bindGameOpreationEvent((node, correlationInfoData) => {
                    if (node.name === "bar") {
                        //杠
                        this.getDymjProxy().operation(DymjOperationType.GANG, (correlationInfoData as DymjGang).mjValues[0]);//---------------------注意这里是个数组
                    } else if (node.name === "touch") {
                        //碰
                        this.getDymjProxy().operation(DymjOperationType.PENG, (correlationInfoData as DymjPeng).mjValue);
                    } else if (node.name === 'hu') {
                        //胡
                        this.getDymjProxy().operation(DymjOperationType.HU, (correlationInfoData as DymjHu).mjValue);
                    }
                });
                // 发送准备
                this.getDymjProxy().ready();

                //this.DeskPanelViewScript.initMyJobPanel(gameData, deskData);

                // const loginData = (<LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();
                // script.updatedDeskAiming(gameData, deskData, loginData);
                // break;
                // // this.DeskPanelViewScript = cc.loader.getRes(PrefabDefine.DeskPanel, cc.Prefab);
                // // this.viewComponent.addChild(cc.instantiate(this.DeskPanelViewScript));
                // // break;
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
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                //在这里加入发牌动画


                this.getDymjProxy().dealOver();
                break;
            case CommandDefine.GetGameCardPush://摸牌
                this.DeskPanelViewScript.updateHandCardAndHuCard();//更新手牌
                break;
            case CommandDefine.ShowCardPush://玩家出牌推送
                const { playerInfo, showCard } = notification.getBody();
                this.DeskPanelViewScript.updateOutCard((playerInfo as PlayerInfo).gameIndex);
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                break;
            case CommandDefine.EventDonePush://玩家处理操作之后的推送
                this.DeskPanelViewScript.updateMyCurCardList();
                this.DeskPanelViewScript.updateOtherCurCardList();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                this.DeskPanelViewScript.updateMyBarAndTouchCard();
                this.DeskPanelViewScript.initMyOpreationBtuShow();
                break;
            case CommandDefine.ShowCardNotificationPush://通知出牌
                this.DeskPanelViewScript.initMyOpreationBtuShow();
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                break;
            case CommandDefine.ShowMyEventPush://通知本方有事件
                this.DeskPanelViewScript.updateMyOperationBtu();
                break;
            case CommandDefine.ShowCard://本方出牌
                const { cardNumber } = notification.getBody();
                this.getDymjProxy().putMahkjong(cardNumber);
                break;
        }
    }
}
