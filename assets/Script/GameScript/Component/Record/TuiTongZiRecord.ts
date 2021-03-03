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

    loadResultNode(roomPlayaerCreditDto: RoomPlayerCredit) {
        let playLogParam: TuiTongZiPlayLogParam = JSON.parse(roomPlayaerCreditDto.extraParam);

        // 加载结果
        for (let i = 0; i < 4; i++) {
            let start = i * 2;
            let end = start + 1;
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
        positionNodeNew.x = -4;
        positionNodeNew.y = 0;
        positionNodeNew.scale = 0.8
        positionNodeNew.addChild(cardItemNode);

        let cardItemView: CardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(positionPokers[0])));


        cardItemNode = cc.instantiate(this.cardItemPrefab);
        positionNodeNew.x = 58;
        positionNodeNew.y = 0;
        positionNodeNew.scale = 0.8
        positionNodeNew.addChild(cardItemNode);

        cardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(positionPokers[1])));
    }
}
