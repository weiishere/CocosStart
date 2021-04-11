import { S2CClubRoomPlayerInfo } from "../../GameData/Club/s2c/S2CClubRoomPlayerInfo";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class XzddRuleDetail extends cc.Component {

    @property(cc.Label)
    content: cc.Label = null;
    @property(cc.Node)
    playerNode: cc.Node = null;
    @property(cc.Node)
    playerList: cc.Node = null;

    graphics: cc.Graphics;

    onLoad() {
        this.playerList.removeAllChildren();
    }

    start() {
    }

    close() {
        this.node.destroy();
    }

    loadData(content: string, userInfos: S2CClubRoomPlayerInfo[]) {
        this.content.string = content;
        if (userInfos === null || userInfos.length === 0) {
            return;
        }
        userInfos.forEach(v => {
            this.createPlayerNode(v);
        });
    }

    createPlayerNode(userInfo: S2CClubRoomPlayerInfo) {
        let resNode = cc.instantiate(this.playerNode);
        resNode.active = true;
        resNode.getChildByName("nickname").getComponent(cc.Label).string = userInfo.nickname;
        resNode.getChildByName("userName").getComponent(cc.Label).string = `ID: ${userInfo.userName}`;

        let headSprite = resNode.getChildByName("head").getComponent(cc.Sprite);

        SpriteLoadUtil.loadSprite(headSprite, userInfo.head);

        this.playerList.addChild(resNode);
    }

    // update (dt) {}
}
