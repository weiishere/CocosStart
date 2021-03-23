import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { GameRecordInfo } from '../../GameData/GameRecordInfo';
import { RoomPlayerCredit } from '../../GameData/RoomPlayerCredit';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import BaseRecord from './BaseRecord';

const { ccclass, property } = cc._decorator;

@ccclass
export default class XzddRecord extends BaseRecord {

    @property(cc.Node)
    detailBtn: cc.Node = null;
    @property(cc.Node)
    playerItemNode: cc.Node = null;

    protected bindUI(): void {
    }

    protected bindEvent(): void {
        this.detailBtn.on(cc.Node.EventType.TOUCH_END, (event) => {
            Facade.Instance.sendNotification(CommandDefine.OpenRecordDetailList, this.roomRoundNo, "");
        });
    }

    getPlayerItem() {
        return this.playerItemNode;
    }

    deskClickEvent() {
    }

    getRoomPlayerCreditByUserName(roomPlayerCreditDtos: RoomPlayerCredit[], userName: string) {
        for (const data of roomPlayerCreditDtos) {
            if (data.userName === userName) {
                return data;
            }
        }
        return null;
    }

    getRoomPlayerCreditBySeatNo(roomPlayerCreditDtos: RoomPlayerCredit[], seatNo: number) {
        for (const data of roomPlayerCreditDtos) {
            if (data.seatNo === seatNo) {
                return data;
            }
        }
        return null;
    }

    /**
     * 根据参数座位号，获得对家座位
     * @param seatNo 
     */
    getOppositionSeatNo(seatNo: number) {
        if (seatNo === 0) {
            return 2;
        } else if (seatNo === 1) {
            return 3;
        } else if (seatNo === 2) {
            return 0;
        } else if (seatNo === 3) {
            return 1;
        }
        return 0;
    }

    getNextSeatNo(seatNo: number) {
        let nextSeatNo = seatNo + 1;
        if (nextSeatNo >= 4) {
            nextSeatNo = 0;
        }
        return nextSeatNo;
    }

    getUpSeatNo(seatNo: number) {
        let nextSeatNo = seatNo - 1;
        if (nextSeatNo < 0) {
            nextSeatNo = 3;
        }
        return nextSeatNo;
    }

    initData(data: GameRecordInfo, userName: string) {
        super.initData(data, userName);
        this.anteLabel.string = `底注：${data.anteStr}`;

        let playerInfoNode = this.node.getChildByName("playerInfo");

        let myRoomPlayerCreditDto = this.getRoomPlayerCreditByUserName(data.roomPlayerCreditDtos, userName);
        let palyerItem = this.createPlayerItemPlus(myRoomPlayerCreditDto, "自己");
        playerInfoNode.addChild(palyerItem);

        let roomPlayerCreditDto = null;

        roomPlayerCreditDto = this.getRoomPlayerCreditBySeatNo(data.roomPlayerCreditDtos, this.getOppositionSeatNo(myRoomPlayerCreditDto.seatNo));
        if (roomPlayerCreditDto) {
            palyerItem = this.createPlayerItemPlus(roomPlayerCreditDto, "对家");
            playerInfoNode.addChild(palyerItem);
        }

        roomPlayerCreditDto = this.getRoomPlayerCreditBySeatNo(data.roomPlayerCreditDtos, this.getNextSeatNo(myRoomPlayerCreditDto.seatNo))
        if (roomPlayerCreditDto) {
            palyerItem = this.createPlayerItemPlus(roomPlayerCreditDto, "上家");
            playerInfoNode.addChild(palyerItem);
        }

        roomPlayerCreditDto = this.getRoomPlayerCreditBySeatNo(data.roomPlayerCreditDtos, this.getUpSeatNo(myRoomPlayerCreditDto.seatNo))
        if (roomPlayerCreditDto) {
            palyerItem = this.createPlayerItemPlus(roomPlayerCreditDto, "下家");
            playerInfoNode.addChild(palyerItem);
        }

    }

    /**
     * 创建用户项
     */
    createPlayerItemPlus(playerData: RoomPlayerCredit, positionStr: string) {
        let playerItemObj = cc.instantiate(this.getPlayerItem());
        let head = playerData.head;
        playerItemObj.active = true;
        let nicknameLabel = playerItemObj.getChildByName("nickname").getComponent(cc.Label);
        nicknameLabel.string = playerData.nickname;
        let playerIdLabel = playerItemObj.getChildByName("id").getComponent(cc.Label);
        playerIdLabel.string = "ID：" + playerData.userName;
        let positionLabel = playerItemObj.getChildByName("positionLabel").getComponent(cc.Label);
        positionLabel.string = positionStr;

        let winlossLabel = playerItemObj.getChildByName("winloss").getComponent(cc.Label);
        if (playerData.credit >= 0) {
            let color = cc.color().fromHEX("#FF0000")
            winlossLabel.node.color = color;
            winlossLabel.string = "+" + playerData.credit;
        } else {
            let color = cc.color().fromHEX("#008567")
            winlossLabel.node.color = color;
            winlossLabel.string = playerData.credit + "";
        }
        let headSprite = playerItemObj.getChildByName("head").getComponent(cc.Sprite);

        SpriteLoadUtil.loadSprite(headSprite, head);
        return playerItemObj;
    }
}
