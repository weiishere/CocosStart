import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { GameRecordInfo } from '../../GameData/GameRecordInfo';
import { TuiTongZiPlayLogParam } from '../../GameData/Record/TuiTongZiPlayLogParam';
import { RoomPlayerCredit } from '../../GameData/RoomPlayerCredit';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import CardItemView from '../CardItemView';
import BaseRecord from './BaseRecord';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TuiTongZiRecord extends BaseRecord {
    @property(cc.Node)
    playerItemNode: cc.Node = null;
    @property(cc.Node)
    resultNode: cc.Node = null;
    @property(cc.Node)
    positionNode: cc.Node = null;
    @property(cc.Label)
    shunBetLabel: cc.Label = null;
    @property(cc.Label)
    qianBetLabel: cc.Label = null;
    @property(cc.Label)
    weiBetLabel: cc.Label = null;
    @property(cc.Prefab)
    cardItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    bankerIconNode: cc.Node = null;

    protected bindUI(): void {
    }

    protected bindEvent(): void {
    }

    getPlayerItem() {
        return this.playerItemNode;
    }

    deskClickEvent() {
    }

    initData(data: GameRecordInfo, userName: string) {
        super.initData(data, userName);
        let roomPlayaerCreditDto: RoomPlayerCredit = data.roomPlayerCreditDtos[0];
        this.createPlayerItem(roomPlayaerCreditDto);

        this.loadResultNode(roomPlayaerCreditDto);
    }

    /**
     * 创建用户项
     */
    createPlayerItem(playerData: RoomPlayerCredit) {
        let playerItemObj = this.getPlayerItem();
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

    loadResultNode(roomPlayaerCreditDto: RoomPlayerCredit) {
        this.bankerIconNode.active = roomPlayaerCreditDto.bankerCount > 0;

        let playLogParam: TuiTongZiPlayLogParam = JSON.parse(roomPlayaerCreditDto.extraParam);

        // 加载结果
        for (let i = 0; i < 4; i++) {
            let start = i * 2;
            let end = start + 2;
            let positionPokers = playLogParam.pokers.slice(start, end);
            this.loadPositionNode(i, positionPokers);
        }

        for (let i = 0; i < 3; i++) {
            let bet = playLogParam.bets[i];
            let betLabel = null;
            if (i === 0) {
                betLabel = this.shunBetLabel;
            } else if (i === 1) {
                betLabel = this.qianBetLabel;
            } else if (i === 2) {
                betLabel = this.weiBetLabel;
            }
            betLabel.string = `下注：${bet}`
        }
    }

    /**
     * 转换为客户端的牌值，推筒子的记录牌值为 0-8是1-9筒，10为幺鸡
     * @param value 
     */
    convertMahjongValue(value: number) {
        if (value === 10) {
            return 19;
        } else {
            return 10 + value;
        }
    }

    loadPositionNode(index: number, positionPokers: string[]) {
        let positionNodeNew = cc.instantiate(this.positionNode);
        positionNodeNew.active = true;
        this.resultNode.addChild(positionNodeNew);

        let positionNameLabel = positionNodeNew.getChildByName("positionNameLabel").getComponent(cc.Label);
        if (index === 0) {
            positionNameLabel.string = "庄："
        } else if (index === 1) {
            positionNameLabel.string = "顺："
        } else if (index === 2) {
            positionNameLabel.string = "迁："
        } else if (index === 3) {
            positionNameLabel.string = "尾："
        }

        let cardItemNode = cc.instantiate(this.cardItemPrefab);
        cardItemNode.x = -4;
        cardItemNode.y = 0;
        cardItemNode.scale = 0.8
        positionNodeNew.addChild(cardItemNode);

        let cardItemView: CardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(positionPokers[0])));


        cardItemNode = cc.instantiate(this.cardItemPrefab);
        cardItemNode.x = 58;
        cardItemNode.y = 0;
        cardItemNode.scale = 0.8
        positionNodeNew.addChild(cardItemNode);

        cardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(positionPokers[1])));
    }
}
