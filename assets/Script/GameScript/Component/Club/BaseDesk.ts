import ViewComponent from '../../Base/ViewComponent';
import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseDesk extends ViewComponent {

    roomNo: number = 0;
    enterLimit: number = 0;
    basicScore: number = 0;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
    }

    deskClickEvent() {
    }

    start() {
    }

    initData(s2CClubRoomInfoBase: S2CClubRoomInfoBase) {
    }

    setRoundCount(currentGameCount: number, gameCount: number) {
    }

    /**
     * 获得坐下的人数
     */
    getSitDownCount(): number {
        return 0;
    }

    sitDown(head: string, nickname: string, seatNo: number) {
    }

    standUp(seatNo: number) {
    }

}
