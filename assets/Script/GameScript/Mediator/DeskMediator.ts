
import { INotification } from "../../Framework/interfaces/INotification";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { PrefabDefine } from "../MahjongConst/PrefabDefine";
import BaseMediator from "../Mediator/BaseMediator"
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { DeskProxy } from "../Proxy/DeskProxy"
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy"

export class DeskMediator extends BaseMediator {

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }
    protected prefabSource(): string {
        return PrefabDefine.DeskPanel;
    }
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
    public listNotificationInterests(): string[] {
        return [
            CommandDefine.InitDeskPanel
        ];
    }

    public async handleNotification(notification: INotification) {
        switch (notification.getName()) {
            case CommandDefine.InitDeskPanel:
                {

                    await this.init();
                    const deskPanel = this.viewComponent.getChildByName('deskView');
                    const script = deskPanel.getComponent('DeskPanelView');
                    const gameData = this.getDeskProxy().getGameData();
                    const deskData = this.getDeskProxy().getDeskData();
                    script.initMyJobPanel(gameData, deskData);
                    script.initFrontjobPanel(gameData, deskData);

                    script.initMyOpreationBtuShow(gameData);

                    const loginData = (<LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();
                    script.updatedDeskAiming(gameData, deskData, loginData);
                    break;
                    // const deskPanel = cc.loader.getRes(PrefabDefine.DeskPanel, cc.Prefab);
                    // this.viewComponent.addChild(cc.instantiate(deskPanel));
                    // break;
                }
        }
    }
}
