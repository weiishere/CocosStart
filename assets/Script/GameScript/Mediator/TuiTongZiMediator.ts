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
import UpBankerPanel from "../Component/TuiTongZi/UpBankerPanel";
import { S2CEnterRoom } from "../GameData/TuiTongZi/s2c/S2CEnterRoom";
import { DeskBankerPlayer } from "../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { BankerQueuePlayer } from "../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { stringToBytes_SJIS } from "../ts/text/stringToBytes_SJIS";
import OnlinePlayerListPanel from "../Component/TuiTongZi/OnlinePlayerListPanel";

export class TuiTongZiMediator extends BaseMediator {
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }
    private hadChooseClip: number = 0;

    private TTZDeskView: cc.Node = null;
    private TTZDeskViewScript: TTZDeskView;

    private upBankerPanel: cc.Node;
    private onlinePlayerListPanel: cc.Node;

    protected prefabSource(): string {
        return TuiTongZiPrefabDefine.TuiTongZiDesk;
    }
    protected inAdvanceLoadFiles(): string[] {
        return [
            // TuiTongZiPrefabDefine.TuiTongZiDesk,
            TuiTongZiPrefabDefine.UpBankerPanel,
            TuiTongZiPrefabDefine.OnlinePlayerListPanel,
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
            CommandDefine.RefreshPlayerGload,
            CommandDefine.QuitGame,
            CommandDefine.UpWaitUpBankerList,
        ];
    }
    public getTZDeskProxy(): TTZDeskProxy {
        return <TTZDeskProxy>this.facade.retrieveProxy(ProxyDefine.TTZDesk);
    }
    public getTuiTongZiProxy(): TuiTongZiProxy {
        return <TuiTongZiProxy>this.facade.retrieveProxy(ProxyDefine.TuiTongZi);
    }

    private openUpBankerPanel(s2CEnterRoom: S2CEnterRoom) {
        if (this.upBankerPanel != null && this.upBankerPanel.isValid) {
            return;
        }
        let source = cc.loader.getRes(TuiTongZiPrefabDefine.UpBankerPanel, cc.Prefab);
        this.upBankerPanel = cc.instantiate(source);
        this.upBankerPanel.active = false;
        this.TTZDeskView.addChild(this.upBankerPanel);

        let upBankerPanelScript = <UpBankerPanel>this.upBankerPanel.getComponent("UpBankerPanel");
        upBankerPanelScript.initData(s2CEnterRoom, this.getLocalCacheDataProxy().getLoginData().userName, this.upBankerOrDownBankerHandle.bind(this));
    }

    private upBankerOrDownBankerHandle(isDown: boolean) {
        if (isDown) {
            this.getTuiTongZiProxy().downBanker();
        } else {
            this.getTuiTongZiProxy().upBanker();
        }
    }

    private updateUpBankerList(deskBankerPlayers: DeskBankerPlayer[]) {
        if (this.upBankerPanel == null || !this.upBankerPanel.isValid) {
            return;
        }
        let upBankerPanelScript = <UpBankerPanel>this.upBankerPanel.getComponent("UpBankerPanel");
        upBankerPanelScript.updateBankerPlayerList(deskBankerPlayers);
    }

    private updateWaitUpBankerList(bankerWaitList: BankerQueuePlayer[]) {
        if (this.upBankerPanel == null || !this.upBankerPanel.isValid) {
            return;
        }
        let upBankerPanelScript = <UpBankerPanel>this.upBankerPanel.getComponent("UpBankerPanel");
        upBankerPanelScript.updateWaitUpBankerPlayerList(bankerWaitList);
    }

    private openOnlinePlayerList() {
        if (this.onlinePlayerListPanel != null && this.onlinePlayerListPanel.isValid) {
            this.updateOnlinePlayerList();
            return;
        }
        let source = cc.loader.getRes(TuiTongZiPrefabDefine.OnlinePlayerListPanel, cc.Prefab);
        this.onlinePlayerListPanel = cc.instantiate(source);
        this.TTZDeskView.addChild(this.onlinePlayerListPanel);

        let onlinePlayerListPanelScript = <OnlinePlayerListPanel>this.onlinePlayerListPanel.getComponent("OnlinePlayerListPanel");
        onlinePlayerListPanelScript.updatePlayerList(this.getTZDeskProxy().repository.deskData.playerList.subPlayer, this.getTZDeskProxy().repository.deskData.playerList.mySelf);
    }

    private updateOnlinePlayerList() {
        if (this.onlinePlayerListPanel == null || !this.onlinePlayerListPanel.isValid) {
            return;
        }
        this.onlinePlayerListPanel.active = true;
        let onlinePlayerListPanelScript = <OnlinePlayerListPanel>this.onlinePlayerListPanel.getComponent("OnlinePlayerListPanel");
        onlinePlayerListPanelScript.updatePlayerList(this.getTZDeskProxy().repository.deskData.playerList.subPlayer, this.getTZDeskProxy().repository.deskData.playerList.mySelf);
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
                        this.getTuiTongZiProxy().logout();
                    } else if (node.name === 'ruleIcon') {

                    } else if (node.name === 'setIcon') {

                    } else if (node.name === 'playerList') {
                        this.openOnlinePlayerList();
                    } else if (node.name === 'trend') {

                    } else if (node.name === 'bankerRequest') {
                        this.upBankerPanel.active = true;
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

                this.openUpBankerPanel(notification.getBody());
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
                this.updateUpBankerList(notification.getBody());
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
            case CommandDefine.UpWaitUpBankerList:
                this.updateWaitUpBankerList(notification.getBody());
                break;
            case CommandDefine.QuitGame:
                this.upBankerPanel = null;
                this.TTZDeskViewScript && this.TTZDeskViewScript.quitGame();
                break;
        }
    }

}