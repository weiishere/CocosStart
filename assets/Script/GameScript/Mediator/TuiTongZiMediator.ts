import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "../Mediator/BaseMediator"
import { PrefabDefine as TuiTongZiPrefabDefine } from "../TuiTongZiConst/PrefabDefine";
import { CommandDefine } from "../TuiTongZiConst/CommandDefine";
import TTZDeskView from "../Component/TuiTongZi/TTZDeskView";
import { TTZDeskProxy } from "../Proxy/TTZDeskProxy";
import { ProxyDefine } from "../TuiTongZiConst/ProxyDefine";
import { TuiTongZiProxy } from "../Proxy/TuiTongZiProxy";

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
            CommandDefine.ClearDesk,
            CommandDefine.RefreshCardPush,
            CommandDefine.RefreshGamePromptPush,
            CommandDefine.RefreshGameScorePush,
            CommandDefine.RefreshPlayerGload
        ];
    }
    public getTZDeskProxy(): TTZDeskProxy {
        return <TTZDeskProxy>this.facade.retrieveProxy(ProxyDefine.TTZDesk);
    }
    public getTuiTongZiProxy(): TuiTongZiProxy {
        return <TuiTongZiProxy>this.facade.retrieveProxy(ProxyDefine.TuiTongZi);
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
                    if (!this.hadChooseClip) return;
                    if (anteCode === 'shun') {
                        this.getTuiTongZiProxy().bet(0, this.hadChooseClip);
                    } else if (anteCode === 'qian') {
                        this.getTuiTongZiProxy().bet(1, this.hadChooseClip);
                    } else if (anteCode === 'wei') {
                        this.getTuiTongZiProxy().bet(2, this.hadChooseClip);
                    }
                });
                this.sendNotification(CommandDefine.RefreshSelfPlayerPush);
                this.sendNotification(CommandDefine.RefreshPlayerPush);
                this.sendNotification(CommandDefine.RefreshMasterPlayerPush);
                this.sendNotification(CommandDefine.RefreshCardPush, { isInit: false, isAction: false });
                this.sendNotification(CommandDefine.RefreshGamePromptPush);
                this.sendNotification(CommandDefine.RefreshGameScorePush);
                break;
            case CommandDefine.RefreshSelfPlayerPush:
                this.TTZDeskViewScript.updatePlayerHead();
                //刷新玩家自己
                break;
            case CommandDefine.RefreshPlayerPush:
                //刷新玩家
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateSubPlayerList();
                break;
            case CommandDefine.RefreshMasterPlayerPush:
                //刷新拼庄玩家
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateSMasterPlayerList();
                break;
            case CommandDefine.RefreshCardPush:
                //发牌
                const { isInit, isAction } = notification.getBody();
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateCardView(isInit, isAction);
                if (isInit) this.TTZDeskViewScript.clearDesk();

                break;
            case CommandDefine.LicensingCardPush:
                //发牌
                break;
            case CommandDefine.PlayerPutAntePush:
                //玩家下注
                const { userInfo, subArea, amount } = notification.getBody();
                this.TTZDeskViewScript && this.TTZDeskViewScript.playerClipFly(userInfo, subArea, amount);
                break;
            case CommandDefine.OpenCard:
                //翻牌（比牌）
                break;
            case CommandDefine.ShowResult:
                //显示输赢结果
                this.TTZDeskViewScript && this.TTZDeskViewScript.showReult()
                break;
            case CommandDefine.RefreshGamePromptPush:
                //显示游戏文字提示
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateGamePrompt();
                break;
            case CommandDefine.RefreshGameScorePush:
                //显示闲家头部分数
                this.TTZDeskViewScript && this.TTZDeskViewScript.updateSubScore();
                break;
            case CommandDefine.RefreshPlayerGload:
                const { playerId, glod } = notification.getBody();
                this.TTZDeskViewScript && this.TTZDeskViewScript.updatePlayerGloadChange(playerId, glod, 0)
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