import Facade from "../../../Framework/care/Facade";
import ViewComponent from "../../Base/ViewComponent";
import { DeskListEventDefine } from "../../GameConst/Event/DeskListEventDefine";
import { GameNoDefine } from "../../GameConst/GameNoDefine";
import { S2CClubRoomInfoBase } from "../../GameData/Club/s2c/S2CClubRoomInfoBase";
import { S2CClubRoomPlayerInfo } from "../../GameData/Club/s2c/S2CClubRoomPlayerInfo";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class XzddRuleDetail extends ViewComponent {
    @property(cc.Label)
    content: cc.Label = null;
    @property(cc.Node)
    playerNode: cc.Node = null;
    @property(cc.Node)
    playerList: cc.Node = null;
    @property(cc.Label)
    roomTypeLabel: cc.Label = null;
    @property(cc.Label)
    anteLabel: cc.Label = null;
    @property(cc.Label)
    gameRoundLabel: cc.Label = null;
    @property(cc.Label)
    enterLabel: cc.Label = null;

    graphics: cc.Graphics;

    roomNo: number = 0;

    protected bindUI(): void {
        this.playerList.removeAllChildren();
    }
    protected bindEvent(): void {
    }

    start() {
    }

    close() {
        this.node.destroy();
    }

    enterRoom() {
        this.close();
        this.dispatchCustomEvent(DeskListEventDefine.JoinDeskEvent, this.roomNo);
    }

    loadData(content: string, userInfos: S2CClubRoomPlayerInfo[], s2CClubRoomInfoBase?: S2CClubRoomInfoBase) {
        this.content.string = content;
        this.roomNo = s2CClubRoomInfoBase.roomNo;

        let roomType = "";
        if (s2CClubRoomInfoBase.gameSubClass === GameNoDefine.DA_YI_ER_REN_MAHJONG) {
            roomType = "断勾卡";
        } else {
            if (s2CClubRoomInfoBase.roomType === 0) {
                roomType = "两人一房";
            } else if (s2CClubRoomInfoBase.roomType === 1) {
                roomType = "两人两房";
            } else if (s2CClubRoomInfoBase.roomType === 2) {
                roomType = "三人两房";
            } else if (s2CClubRoomInfoBase.roomType === 3) {
                roomType = "四家";
            }
        }

        this.roomTypeLabel.string = roomType;
        this.anteLabel.string = s2CClubRoomInfoBase.basicScore + "";
        this.gameRoundLabel.string = s2CClubRoomInfoBase.gameCount + "";
        this.enterLabel.string = s2CClubRoomInfoBase.enterLimit + "";

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
