import { INotification } from "../../Framework/interfaces/INotification";
import BaseMediator from './BaseMediator';
import { PrefabDefine } from '../MahjongConst/PrefabDefine';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';
import { S2CJoinClubInfo } from '../GameData/Club/s2c/S2CJoinClubInfo';
import DeskList from '../Component/Club/DeskList';
import { S2CClubRoomSitDown } from '../GameData/Club/s2c/S2CClubRoomSitDown';
import { S2CClubRoomStandUp } from '../GameData/Club/s2c/S2CClubRoomStandUp';
import { S2CClubRoomInfoBase } from '../GameData/Club/s2c/S2CClubRoomInfoBase';
import { S2CClubDeleteRoom } from '../GameData/Club/s2c/S2CClubDeleteRoom';
import { S2CClubPushRoomRound } from '../GameData/Club/s2c/S2CClubPushRoomRound';
import { ClubProxy } from '../Proxy/ClubProxy';
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { DeskListEventDefine } from '../GameConst/Event/DeskListEventDefine';
import { ClubProtocol } from '../Protocol/ClubProtocol';
import { ClubC2SJoinRoom } from '../GameData/Club/c2s/ClubC2SJoinRoom';
import { S2CClubJoinRoom } from '../GameData/Club/s2c/S2CClubJoinRoom';
import { UserGold } from '../GameData/UserGold';

export class DeskListMediator extends BaseMediator {

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }

    /** 事件监听方法 */
    private listenerEvent(): void {
        // 监听登录按钮请求方法
        this.viewComponent.on(DeskListEventDefine.ClubQuitEvent, this.quitClubBtnEvent.bind(this));
        this.viewComponent.on(DeskListEventDefine.JoinDeskEvent, this.joinDeskEvent.bind(this));
    }

    private quitClubBtnEvent(event: cc.Event.EventCustom) {
        event.stopPropagation();

        this.getClubProxy().sendGameData(ClubProtocol.C2S_LOGOUT_CLUB, "", (op: number, msgType: number) => {
        });
    }

    private joinDeskEvent(event: cc.Event.EventCustom) {
        event.stopPropagation();

        let data: ClubC2SJoinRoom = new ClubC2SJoinRoom();
        data.roomNo = event.getUserData();
        this.getClubProxy().sendGameData(ClubProtocol.C2S_JOIN_ROOM, data, (op: number, msgType: number) => {
        });
    }

    public getClubProxy(): ClubProxy {
        return <ClubProxy>this.facade.retrieveProxy(ProxyDefine.Club);
    }

    protected isLoadAfterShowPrefavSource(): boolean {
        return false;
    }

    protected inAdvanceLoadFiles(): string[] {
        return [];
    }

    public listNotificationInterests(): string[] {
        return [
            CommandDefine.OpenDeskList,
            CommandDefine.UpdatePlayerGold,
        ];
    }

    public handleNotification(notification: INotification): void {

        if (notification.getName() === CommandDefine.UpdatePlayerGold) {
            let userGold: UserGold = notification.getBody();
            this.getViewScript().updateGold(userGold.newGold);
        }

        if (notification.getName() !== CommandDefine.OpenDeskList) {
            return;
        }

        if (notification.getType() === NotificationTypeDefine.ClubJoinClob) {
            let s2CJoinClubInfo: S2CJoinClubInfo = notification.getBody();
            this.showDeskList(s2CJoinClubInfo);
        } else if (notification.getType() === NotificationTypeDefine.ClubStiDown) {
            let s2CClubRoomSitDown: S2CClubRoomSitDown = notification.getBody();
            this.sitDown(s2CClubRoomSitDown);
        } else if (notification.getType() === NotificationTypeDefine.ClubStandUp) {
            let s2CClubRoomStandUp: S2CClubRoomStandUp = notification.getBody();
            this.standUp(s2CClubRoomStandUp);
        } else if (notification.getType() === NotificationTypeDefine.ClubAddDesk) {
            let s2CClubRoomInfoBase: S2CClubRoomInfoBase = notification.getBody();
            this.addDesk(s2CClubRoomInfoBase);
        } else if (notification.getType() === NotificationTypeDefine.ClubDeleteDesk) {
            let s2CClubDeleteRoom: S2CClubDeleteRoom = notification.getBody();
            this.deleteDesk(s2CClubDeleteRoom);
        } else if (notification.getType() === NotificationTypeDefine.ClubRoundCount) {
            let s2CClubPushRoomRound: S2CClubPushRoomRound = notification.getBody();
            this.updateRoundCount(s2CClubPushRoomRound);
        } else if (notification.getType() === NotificationTypeDefine.ClubQuit) {
            this.destroyView();
        } else if (notification.getType() === NotificationTypeDefine.ClubJoinRoom) {
            let s2CClubJoinRoom: S2CClubJoinRoom = notification.getBody();
            cc.log("准备进入到 ", s2CClubJoinRoom.roomNo);
        } else if (notification.getType() === NotificationTypeDefine.ClubShutdown) {
            this.destroyView();
        }
    }

    destroyView() {
        this.view.destroy();
    }

    private showDeskList(s2CJoinClubInfo: S2CJoinClubInfo) {
        let prefab = cc.loader.getRes(this.prefabSource(), cc.Prefab)

        if (!prefab) {
            cc.log("获取预制组件失败 ", this.prefabSource());
            return;
        }
        this.view = cc.instantiate(prefab);
        this.viewComponent.addChild(this.view);

        const script = this.getViewScript();
        script.loadUserData(this.getLocalCacheDataProxy().getLoginData());
        script.loadDeskList(s2CJoinClubInfo);

        const userInfoPanel = cc.loader.getRes(PrefabDefine.UserInfoPanel, cc.Prefab);
        const _userInfoPanel = cc.instantiate(userInfoPanel) as cc.Node;
        this.view.addChild(_userInfoPanel);
        _userInfoPanel.parent = cc.find("Canvas");
        const userHeaderScript = (_userInfoPanel as cc.Node).getComponent('UserHeader');
        userHeaderScript.showAcount(this.getLocalCacheDataProxy().getLoginData());
    }

    private getViewScript(): DeskList {
        return <DeskList>this.view.getComponent("DeskList");
    }

    private sitDown(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        const script = this.getViewScript();
        script.sitDown(s2CClubRoomSitDown);
    }

    private standUp(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        const script = this.getViewScript();
        script.standUp(s2CClubRoomStandUp);
    }

    private addDesk(roomInfo: S2CClubRoomInfoBase) {
        const script = this.getViewScript();
        script.addDesk(roomInfo);
    }

    private deleteDesk(s2CClubDeleteRoom: S2CClubDeleteRoom) {
        const script = this.getViewScript();
        script.deteleDesk(s2CClubDeleteRoom.roomNo);
    }

    private updateRoundCount(s2CClubPushRoomRound: S2CClubPushRoomRound) {
        const script = this.getViewScript();
        script.setRoundCount(s2CClubPushRoomRound);
    }

    protected prefabSource(): string {
        return PrefabDefine.DeskList;
    }

    public async onRegister() {
        this.listenerEvent();
        this.init();
    }
}