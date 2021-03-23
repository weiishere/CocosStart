import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import BaseDesk from './BaseDesk';
import { GameNoDefine } from '../../GameConst/GameNoDefine';

const { ccclass, property } = cc._decorator;

@ccclass
export default class XzddDesk extends BaseDesk {

    @property(cc.Label)
    anteLabel: cc.Label = null;
    @property(cc.Label)
    roundCountLabel: cc.Label = null;
    @property(cc.Sprite)
    head1: cc.Sprite = null;
    @property(cc.Sprite)
    head2: cc.Sprite = null;
    @property(cc.Sprite)
    head3: cc.Sprite = null;
    @property(cc.Sprite)
    head4: cc.Sprite = null;

    initData(s2CClubRoomInfoBase: S2CClubRoomInfoBase) {

        let roomType = "";
        if (s2CClubRoomInfoBase.roomType === 0) {
            roomType = "两人一房";
        } else if (s2CClubRoomInfoBase.roomType === 1) {
            roomType = "两人两房";
        } else if (s2CClubRoomInfoBase.roomType === 2) {
            roomType = "三人两房";
        } else if (s2CClubRoomInfoBase.roomType === 3) {
            roomType = "四人三房";
        }

        this.roomNo = s2CClubRoomInfoBase.roomNo;
        this.basicScore = s2CClubRoomInfoBase.basicScore;
        this.enterLimit = s2CClubRoomInfoBase.enterLimit;
        this.anteLabel.string = `${roomType}${s2CClubRoomInfoBase.basicScore}底分`;
        this.setRoundCount(s2CClubRoomInfoBase.currentGameCount, s2CClubRoomInfoBase.gameCount);

        let gameParamObj = JSON.parse(s2CClubRoomInfoBase.gameParam);

        if (this.isHuanSanZhang(gameParamObj)) {
            this.anteLabel.string += `(换三张)`
        }

        let userInfos = s2CClubRoomInfoBase.userInfos;

        for (const userInfo of userInfos) {
            this.sitDown(userInfo.head, userInfo.nickname, userInfo.seatNo);
        }
    }

    isHuanSanZhang(gameParamObj: any) {
        for (const rule of gameParamObj.rules) {
            if (rule === 16) {
                return true;
            }
        }
        return false;
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
        count += this.head3.node.active ? 1 : 0;
        count += this.head4.node.active ? 1 : 0;
        return count;
    }

    sitDown(head: string, nickname: string, seatNo: number) {
        let headSprite: cc.Sprite = null;
        if (seatNo === 1) {
            headSprite = this.head1;
        } else if (seatNo === 2) {
            headSprite = this.head2;
        } else if (seatNo === 3) {
            headSprite = this.head3;
        } else if (seatNo === 4) {
            headSprite = this.head4;
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
        } else if (seatNo === 2) {
            headSprite = this.head2;
        } else if (seatNo === 3) {
            headSprite = this.head3;
        } else if (seatNo === 4) {
            headSprite = this.head4;
        }

        let nicknameLabel = headSprite.node.getChildByName("Nickname").getComponent(cc.Label);
        nicknameLabel.string = "";
        headSprite.spriteFrame = null;
        headSprite.node.active = false;
    }

    // update (dt) {}
}
