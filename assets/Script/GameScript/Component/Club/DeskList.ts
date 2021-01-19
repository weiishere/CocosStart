import ViewComponent from '../../Base/ViewComponent';
import { LoginData } from '../../GameData/LoginData';
import { S2CJoinClubInfo } from '../../GameData/Club/s2c/S2CJoinClubInfo';
import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';
import DymjDesk from './DymjDesk';
import { S2CClubRoomSitDown } from '../../GameData/Club/s2c/S2CClubRoomSitDown';
import { S2CClubRoomStandUp } from '../../GameData/Club/s2c/S2CClubRoomStandUp';
import { S2CClubPushRoomRound } from '../../GameData/Club/s2c/S2CClubPushRoomRound';
import { DeskListEventDefine } from '../../GameConst/Event/DeskListEventDefine';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DeskList extends ViewComponent {
    @property(cc.Node)
    quitClubBtn: cc.Node = null;
    @property(cc.Node)
    kuaiSuBtn: cc.Node = null;
    @property(cc.Prefab)
    dymjDesk: cc.Prefab = null;
    @property(cc.Node)
    deskContainer: cc.Node = null;

    start() {

    }

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.quitClubBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.dispatchCustomEvent(DeskListEventDefine.ClubQuitEvent, null);
        });
        this.kuaiSuBtn.on(cc.Node.EventType.TOUCH_END, () => {

        });
    }

    loadDeskList(s2CJoinClubInfo: S2CJoinClubInfo) {
        if (!s2CJoinClubInfo) {
            return;
        }

        // 先删除所有子节点，避免重复显示
        this.deskContainer.removeAllChildren();
        for (const roomInfo of s2CJoinClubInfo.roomInfos) {
            this.addDesk(roomInfo);
        }
    }

    addDesk(roomInfo: S2CClubRoomInfoBase) {
        let desk = cc.instantiate(this.dymjDesk);
        this.deskContainer.addChild(desk);

        let script = <DymjDesk>desk.getComponent("DymjDesk");
        script.initData(roomInfo);
    }

    deteleDesk(roomNo: number) {
        let deskScript = this.getDeskNode(roomNo);
        if (deskScript == null) {
            return;
        }
        deskScript.node.destroy();
    }

    sitDown(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        let deskScript = this.getDeskNode(s2CClubRoomSitDown.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.sitDown(s2CClubRoomSitDown.head, s2CClubRoomSitDown.nickname, s2CClubRoomSitDown.seatNo);
    }

    standUp(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        let deskScript = this.getDeskNode(s2CClubRoomStandUp.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.standUp(s2CClubRoomStandUp.seatNo);
    }

    setRoundCount(s2CClubPushRoomRound: S2CClubPushRoomRound) {
        let deskScript = this.getDeskNode(s2CClubPushRoomRound.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.setRoundCount(s2CClubPushRoomRound.roundCount, s2CClubPushRoomRound.gameCount);
    }

    getDeskNode(roomNo: number): DymjDesk {
        for (const deskNode of this.deskContainer.children) {
            let script = deskNode.getComponent("DymjDesk");
            if (script.roomNo == roomNo) {
                return script;
            }
        }

        return null;
    }

    speedFindDeskNo(myGold: number) {
        let desks = [];
        for (const deskNode of this.deskContainer.children) {
            let script = <DymjDesk>deskNode.getComponent("DymjDesk");
            if (myGold >= script.enterLimit) {
                desks.push(deskNode);
            }
        }
    }

    testAddDesk() {
        let desk = cc.instantiate(this.dymjDesk);
        this.deskContainer.addChild(desk);
    }

    testDeleteDesk() {
        if (this.deskContainer.childrenCount == 0) {
            return;
        }

        this.deskContainer.children[this.deskContainer.childrenCount - 1].destroy();
    }

    // update (dt) {}
}
