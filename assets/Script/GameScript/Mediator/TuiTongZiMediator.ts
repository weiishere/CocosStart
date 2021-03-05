import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import BaseMediator from "../Mediator/BaseMediator"
import { PrefabDefine as TuiTongZiPrefabDefine } from "../TuiTongZiConst/PrefabDefine";
import { CommandDefine as TuiTongZiCommandDefine } from "../TuiTongZiConst/CommandDefine";
import TTZDeskView from "../Component/TuiTongZi/TTZDeskView";

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
            TuiTongZiCommandDefine.OpenTTZDeskPanel,
            TuiTongZiCommandDefine.RefreshPlayerPush,
            TuiTongZiCommandDefine.LicensingCardPush,
            TuiTongZiCommandDefine.PlayerPutAntePush,
            TuiTongZiCommandDefine.OpenCard,
            TuiTongZiCommandDefine.ShowResult,
            TuiTongZiCommandDefine.GetWinGlod,
            TuiTongZiCommandDefine.ClearDesk
        ];
    }

    public async handleNotification(notification: INotification) {
        switch (notification.getName()) {
            case TuiTongZiCommandDefine.OpenTTZDeskPanel:
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
                break;
            case TuiTongZiCommandDefine.RefreshPlayerPush:
                //刷新玩家
                break;
            case TuiTongZiCommandDefine.LicensingCardPush:
                //发牌
                break;
            case TuiTongZiCommandDefine.PlayerPutAntePush:
                //玩家下注
                break;
            case TuiTongZiCommandDefine.OpenCard:
                //翻牌（比牌）
                break;
            case TuiTongZiCommandDefine.ShowResult:
                //显示输赢结果
                break;
            case TuiTongZiCommandDefine.GetWinGlod:
                //显示筹码流向，流向玩家
                break;
            case TuiTongZiCommandDefine.ClearDesk:
                //清理桌面，准备下一局
                break;
        }
    }

}