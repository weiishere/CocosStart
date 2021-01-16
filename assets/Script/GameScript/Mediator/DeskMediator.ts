
import { INotification } from "../../Framework/interfaces/INotification";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import BaseMediator from "../Mediator/BaseMediator"
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { DeskProxy } from "../Proxy/DeskProxy"
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy"
import { DymjProxy } from '../Proxy/DymjProxy';
import DeskPanelView from "../Component/DeskPanelView";

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
    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [
            //PrefabDefine.DeskPanel,
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
            CommandDefine.RefreshPlayer,
            CommandDefine.LicensingCard,
            CommandDefine.ExitDeskPanel,
            CommandDefine.getGameCard
        ];
    }

    public async handleNotification(notification: INotification) {

        const gameData = this.getDeskProxy().getGameData();
        const deskData = this.getDeskProxy().getDeskData();
        switch (notification.getName()) {
            case CommandDefine.InitDeskPanel:
                await this.init();
                this.deskPanel = this.viewComponent.getChildByName('deskView');
                this.DeskPanelViewScript = this.deskPanel.getComponent('DeskPanelView') as DeskPanelView;
                this.getDeskProxy().updateDeskInfo(notification.getBody().dymjS2CEnterRoom);
                this.DeskPanelViewScript.initMyJobPanel(gameData, deskData);
                this.DeskPanelViewScript.initFrontjobPanel(gameData, deskData);
                this.DeskPanelViewScript.bindDskOpreationEvent(node => {
                    if (node.name === 'exitIcon') {
                        //退出房间
                        this.getDymjProxy().logout();
                        this.facade.sendNotification(CommandDefine.ExitDeskPanel, {}, '');
                    }
                })
                // 发送准备
                this.getDymjProxy().ready();

                // script.initMyOpreationBtuShow(gameData);

                // const loginData = (<LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();
                // script.updatedDeskAiming(gameData, deskData, loginData);
                // break;
                // // this.DeskPanelViewScript = cc.loader.getRes(PrefabDefine.DeskPanel, cc.Prefab);
                // // this.viewComponent.addChild(cc.instantiate(this.DeskPanelViewScript));
                // // break;
                break;
            case CommandDefine.RefreshPlayer:
                this.DeskPanelViewScript.updatePlayerHeadView();
                break;
            case CommandDefine.ExitDeskPanel:
                this.deskPanel.destroy();
                break;
            case CommandDefine.LicensingCard://发牌
                this.DeskPanelViewScript.updateMyCurCardList();
                deskData.playerList.forEach(player => {
                    if (!this.deskProxy.isMy(player.playerId)) this.DeskPanelViewScript.updateOtherCurCardList(player.gameIndex);
                });
                break;
            case CommandDefine.getGameCard:
                this.DeskPanelViewScript.updateHandCardAndHuCard();
                break;
        }
    }
}
