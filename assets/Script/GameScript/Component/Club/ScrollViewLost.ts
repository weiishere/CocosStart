import { S2CClubRoomInfoBase } from "../../GameData/Club/s2c/S2CClubRoomInfoBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollViewLost extends cc.Component {

    roomInfos: S2CClubRoomInfoBase[];

    viewContent: cc.Node;

    subNodeWidth: number = 400;

    onLoad() {
        this.viewContent = this.getComponent(cc.ScrollView).content;
    }

    start() {
    }

    init(roomInfos: S2CClubRoomInfoBase[]) {
        this.roomInfos = roomInfos;
    }

    calContentWidth() {
        this.viewContent.width = this.subNodeWidth * Math.floor(this.roomInfos.length / 2);
    }

    update(dt) {

    }
}
