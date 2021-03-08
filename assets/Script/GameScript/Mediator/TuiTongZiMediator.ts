import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "../Mediator/BaseMediator"
import { PrefabDefine as TuiTongZiPrefabDefine } from "../TuiTongZiConst/PrefabDefine";
import { CommandDefine } from "../TuiTongZiConst/CommandDefine";
import TTZDeskView from "../Component/TuiTongZi/TTZDeskView";
import { TTZDeskProxy } from "../Proxy/TTZDeskProxy";
import { ProxyDefine } from "../TuiTongZiConst/ProxyDefine";

export class TuiTongZiMediator extends BaseMediator {
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }
    private hadChooseClip: number = 0;

    private TTZDeskView: cc.Node = null;
    private TTZDeskViewScript: TTZDeskView;

    protected prefabSource(): string {
        return TuiTongZiPrefabDefine.TuiTongZiDesk;
    }
    protected inAdvanceLoadFiles(): string[] {
        return [
            TuiTongZiPrefabDefine.TuiTongZiDesk
        ];
    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.OpenTTZDeskPanel,
            CommandDefine.RefreshSelfPlayerPush,
            CommandDefine.RefreshPlayerPush,
            CommandDefine.RefreshMasterPlayerPush,
            CommandDefine.LicensingCardPush,
            CommandDefine.PlayerPutAntePush,
            CommandDefine.OpenCard,
            CommandDefine.ShowResult,
            CommandDefine.GetWinGlod,
            CommandDefine.ClearDesk
        ];
    }
    public getTZDeskProxy(): TTZDeskProxy {
        return <TTZDeskProxy>this.facade.retrieveProxy(ProxyDefine.TTZDesk);
    }

    public async handleNotification(notification: INotification) {
        const gameData = this.getTZDeskProxy().getGameData();
        const deskData = this.getTZDeskProxy().getDeskData();
        console.log('gameData', gameData);
        console.log('deskData', deskData);

        switch (notification.getName()) {
            case CommandDefine.OpenTTZDeskPanel:
                await this.init();
                this.TTZDeskView = this.viewComponent.getChildByName('tuitongzi_Desk');
                this.TTZDeskViewScript = this.TTZDeskView.getComponent('TTZDeskView') as TTZDeskView;
                this.TTZDeskViewScript.bindDskOpreationEvent((node) => {
                    if (node.name === 'exitIcon') {

                    } else if (node.name === 'ruleIcon') {

                    } else if (node.name === 'setIcon') {

                    } else if (node.name === 'playerList') {

                    } else if (node.name === 'trend') {

                    } else if (node.name === 'bankerRequest') {

                    }
                })
                this.TTZDeskViewScript.bindClipOpreationEvent((node: cc.Node, clipNum: number) => {
                    if (clipNum === 1) {

                    } else if (clipNum === 5) {

                    } else if (clipNum === 10) {

                    } else if (clipNum === 50) {

                    } else if (clipNum === 100) {

                    }
                    this.hadChooseClip = clipNum;
                });
                this.TTZDeskViewScript.bindAnteAreaEvent((node: cc.Node, anteCode: string) => {
                    if (anteCode === 'shun') {

                    } else if (anteCode === 'wei') {

                    } else if (anteCode === 'qian') {

                    }
                });
                this.sendNotification(CommandDefine.RefreshSelfPlayerPush);
                this.sendNotification(CommandDefine.RefreshPlayerPush);
                this.sendNotification(CommandDefine.RefreshMasterPlayerPush);
                break;
            case CommandDefine.RefreshSelfPlayerPush:
                this.TTZDeskViewScript.updatePlayerHead();
                //刷新玩家自己
                break;
            case CommandDefine.RefreshPlayerPush:
                //刷新玩家
                this.TTZDeskViewScript.updateSubPlayerList();
                break;
            case CommandDefine.RefreshMasterPlayerPush:
                //刷新拼庄玩家
                
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateSMasterPlayerList();
                break;
            case CommandDefine.LicensingCardPush:
                //发牌
                break;
            case CommandDefine.PlayerPutAntePush:
                //玩家下注
                break;
            case CommandDefine.OpenCard:
                //翻牌（比牌）
                break;
            case CommandDefine.ShowResult:
                //显示输赢结果
                break;
            case CommandDefine.GetWinGlod:
                //显示筹码流向，流向玩家
                break;
            case CommandDefine.ClearDesk:
                //清理桌面，准备下一局
                break;
        }
    }

}