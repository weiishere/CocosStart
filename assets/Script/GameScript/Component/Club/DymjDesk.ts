import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import BaseDesk from './BaseDesk';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class DymjDesk extends BaseDesk {
    @property(cc.Label)
    anteLabel: cc.Label = null;
    @property(cc.Label)
    roundCountLabel: cc.Label = null;
    @property(cc.Sprite)
    head1: cc.Sprite = null;
    @property(cc.Sprite)
    head2: cc.Sprite = null;

    initData(s2CClubRoomInfoBase: S2CClubRoomInfoBase) {
        this.roomNo = s2CClubRoomInfoBase.roomNo;
        this.basicScore = s2CClubRoomInfoBase.basicScore;
        this.enterLimit = s2CClubRoomInfoBase.enterLimit;
        this.roomType = s2CClubRoomInfoBase.roomType;
        this.anteLabel.string = `${GameNoDefine.getGameName(s2CClubRoomInfoBase.gameSubClass)}${s2CClubRoomInfoBase.basicScore}底分`;
        this.setRoundCount(s2CClubRoomInfoBase.currentGameCount, s2CClubRoomInfoBase.gameCount);

        let userInfos = s2CClubRoomInfoBase.userInfos;

        for (const userInfo of userInfos) {
            this.sitDown(userInfo.head, userInfo.nickname, userInfo.seatNo);
        }
    }

    setRoundCount(currentGameCount: number, gameCount: number) {
        this.roundCountLabel.string = `第${currentGameCount}/${gameCount}局`;
    }

    /**
     * 获得坐下的人数
     */
    getSitDownCount() {
        let count = this.head1.node.active ? 1 : 0;
        count += this.head2.node.active ? 1 : 0;
        return count;
    }

    sitDown(head: string, nickname: string, seatNo: number) {
        let headSprite: cc.Sprite = null;
        if (seatNo === 1) {
            headSprite = this.head1;
        } else {
            headSprite = this.head2;
        }

        headSprite.node.active = true;
        let nicknameLabel = headSprite.node.getChildByName("Nickname").getComponent(cc.Label);
        nicknameLabel.string = nickname;

        SpriteLoadUtil.loadSprite(headSprite, head);
    }

    standUp(seatNo: number) {
        let headSprite: cc.Sprite = null;
        if (seatNo === 1) {
            headSprite = this.head1;
        } else {
            headSprite = this.head2;
        }

        let nicknameLabel = headSprite.node.getChildByName("Nickname").getComponent(cc.Label);
        nicknameLabel.string = "";
        headSprite.spriteFrame = null;
        headSprite.node.active = false;
    }

    getMaxPlayerNum() {
        return 2;
    }
    // update (dt) {}
}
