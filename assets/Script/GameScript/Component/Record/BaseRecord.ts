import ViewComponent from '../../Base/ViewComponent';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
import { GameRecordInfo } from '../../GameData/GameRecordInfo';
import { RoomPlayerCredit } from '../../GameData/RoomPlayerCredit';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseRecord extends ViewComponent {
    @property(cc.Label)
    gameNoLabel: cc.Label = null;
    @property(cc.Label)
    roomNoLabel: cc.Label = null;
    @property(cc.Label)
    gameTimeLabel: cc.Label = null;
    @property(cc.Label)
    anteLabel: cc.Label = null;

    /** 游戏局数 */
    roomRoundNo: string = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
    }

    getPlayerItem(): cc.Node {
        return null;
    }

    deskClickEvent() {
    }

    initData(data: GameRecordInfo) {
        this.gameNoLabel.string = GameNoDefine.getGameName(data.gameSubClass);
        this.roomRoundNo = data.roomRoundNo;
        this.roomNoLabel.string = `房间号：${data.roomNo}`;
        this.gameTimeLabel.string = data.endTime;
    }

    /**
     * 创建用户项
     */
    createPlayerItem(playerData: RoomPlayerCredit) {
        let playerItemObj = cc.instantiate(this.getPlayerItem());
        let head = playerData.head;
        playerItemObj.active = true;
        let nicknameLabel = playerItemObj.getChildByName("nickname").getComponent(cc.Label);
        nicknameLabel.string = playerData.nickname;
        let playerIdLabel = playerItemObj.getChildByName("id").getComponent(cc.Label);
        playerIdLabel.string = "ID：" + playerData.userName;
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
