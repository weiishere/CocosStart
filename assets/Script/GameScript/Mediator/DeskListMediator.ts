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
import { GameNoDefine } from "../GameConst/GameNoDefine";
import { DymjProxy } from "../Proxy/DymjProxy";
import { GateProxy } from '../Proxy/GateProxy';

export class DeskListMediator extends BaseMediator {

    /** 是否重连 */
    isReconnect: boolean;
    userHeaderScript: any;
    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }

    /** 事件监听方法 */
    private listenerEvent(): void {
        // 监听登录按钮请求方法
        this.viewComponent.on(DeskListEventDefine.ClubQuitEvent, this.quitClubBtnEvent.bind(this));
        this.viewComponent.on(DeskListEventDefine.JoinDeskEvent, this.joinDeskEvent.bind(this));
        this.viewComponent.on(DeskListEventDefine.SpeedJoinDeskEvent, this.speedJoinDeskEvent.bind(this));
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

    /** 快速查到桌子 */
    private speedJoinDeskEvent(event: cc.Event.EventCustom) {
        let roomNo = this.getViewScript().speedFindDeskNo(this.getLocalCacheDataProxy().getLoginData().gold);

        if (!roomNo) {
            this.getGateProxy().toast("没有找到合适的桌子！");
            return;
        }

        let data: ClubC2SJoinRoom = new ClubC2SJoinRoom();
        data.roomNo = roomNo;
        this.getClubProxy().sendGameData(ClubProtocol.C2S_JOIN_ROOM, data, (op: number, msgType: number) => {
        });
    }

    public getClubProxy(): ClubProxy {
        return <ClubProxy>this.facade.retrieveProxy(ProxyDefine.Club);
    }

    public getGateProxy(): GateProxy {
        return <GateProxy>this.facade.retrieveProxy(ProxyDefine.Gate);
    }

    public getDymjProxy(): DymjProxy {
        return <DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj);
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
            CommandDefine.WebSocketReconnect,
            CommandDefine.ForcedOffline,
        ];
    }

    public handleNotification(notification: INotification): void {
        if (notification.getName() === CommandDefine.UpdatePlayerGold) {
            let userGold: UserGold = notification.getBody();
            if (this.userHeaderScript) {
                this.userHeaderScript.updateGold(userGold.newGold);
            }
        }

        if (notification.getName() === CommandDefine.WebSocketReconnect) {
            this.reconnectHandle();
        }

        if (notification.getName() === CommandDefine.ForcedOffline) {
            this.destroyView();
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
            console.log("准备进入到 ", s2CClubJoinRoom.roomNo);

            this.getDymjProxy().loginGame(s2CClubJoinRoom.roomNo);
        } else if (notification.getType() === NotificationTypeDefine.ClubShutdown) {
            this.destroyView();
        }
    }

    destroyView() {
        if (!this.view) {
            return;
        }
        if (!this.view.isValid) {
            return;
        }
        this.view.destroy();
        this.userHeaderScript = null;
        this.view = null;
    }

    private reconnectHandle() {
        // 没在当前界面就不处理了
        if (!this.view) {
            return;
        }

        // 标记重连状态
        this.isReconnect = true;
        // 重新拉取一次桌子列表
        this.getClubProxy().joinClub();
    }

    private showDeskList(s2CJoinClubInfo: S2CJoinClubInfo) {
        let prefab = cc.loader.getRes(this.prefabSource(), cc.Prefab)

        if (!prefab) {
            cc.log("获取预制组件失败 ", this.prefabSource());
            return;
        }

        if (this.view) {
            if (this.isReconnect) {
                this.isReconnect = false;
                this.loadData(s2CJoinClubInfo);
            }
            return;
        }

        this.view = cc.instantiate(prefab);
        this.viewComponent.addChild(this.view);

        this.loadData(s2CJoinClubInfo);

        const userInfoPanel = cc.loader.getRes(PrefabDefine.UserInfoPanel, cc.Prefab);
        let _userInfoPanel = cc.instantiate(userInfoPanel) as cc.Node;

        this.view.addChild(_userInfoPanel);
        this.userHeaderScript = (_userInfoPanel as cc.Node).getComponent('UserHeader');
        this.userHeaderScript.showAcount(this.getLocalCacheDataProxy().getLoginData());
    }

    /** 加载数据了 */
    private loadData(s2CJoinClubInfo: S2CJoinClubInfo) {
        const script = this.getViewScript();
        script.loadDeskList(s2CJoinClubInfo);
    }

    private getViewScript(): DeskList {
        return <DeskList>this.view.getComponent("DeskList");
    }

    private sitDown(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        // 如果界面没有加载，收到消息不处理
        if (!this.view) {
            return;
        }

        const script = this.getViewScript();
        script.sitDown(s2CClubRoomSitDown);
    }

    private standUp(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        // 如果界面没有加载，收到消息不处理
        if (!this.view) {
            return;
        }

        const script = this.getViewScript();
        script.standUp(s2CClubRoomStandUp);
    }

    private addDesk(roomInfo: S2CClubRoomInfoBase) {
        // 如果界面没有加载，收到消息不处理
        if (!this.view) {
            return;
        }

        const script = this.getViewScript();
        script.addDesk(roomInfo);
    }

    private deleteDesk(s2CClubDeleteRoom: S2CClubDeleteRoom) {
        // 如果界面没有加载，收到消息不处理
        if (!this.view) {
            return;
        }

        const script = this.getViewScript();
        script.deteleDesk(s2CClubDeleteRoom.roomNo);
    }

    private updateRoundCount(s2CClubPushRoomRound: S2CClubPushRoomRound) {
        // 如果界面没有加载，收到消息不处理
        if (!this.view) {
            return;
        }

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