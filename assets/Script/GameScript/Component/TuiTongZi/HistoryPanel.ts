const { ccclass, property } = cc._decorator;

import ViewComponent from "../../Base/ViewComponent";
import { BankerQueuePlayer } from "../../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { DeskBankerPlayer } from "../../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { HistoryItem } from "../../GameData/TuiTongZi/s2c/HistoryItem";
import { S2CEnterRoom } from "../../GameData/TuiTongZi/s2c/S2CEnterRoom";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { UserInfo } from "../../repositories/TTZDeskRepository";
import CardItemView from "../DdYiMahjong/CardItemView";

@ccclass
export default class HistoryPanel extends ViewComponent {
    /** 上庄或者下庄按钮 */
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    historyList: cc.Node = null;
    @property(cc.Node)
    historyItemNode: cc.Node = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Prefab)
    cardItemView: cc.Prefab = null;

    history_item_name_str = "historyItemNameStr";

    bindEvent() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
        });
    }
    bindUI() {
    }
    start() {
    }

    initData(historyItems: HistoryItem[]) {
        this.historyList.removeAllChildren();
        for (const historyItem of historyItems) {
            this.createHistoryItemNode(historyItem);
        }
        this.scrollView.scrollToRight(0.05);
    }

    addHistoryItem(historyItem: HistoryItem) {
        if (this.historyList.childrenCount >= 20) {
            this.historyList.children.shift();
        }
        this.createHistoryItemNode(historyItem);
        this.scrollView.scrollToRight(0.05);
    }

    createHistoryItemNode(historyItem: HistoryItem) {
        let historyItemNodeTmp = cc.instantiate(this.historyItemNode);
        historyItemNodeTmp.name = this.history_item_name_str + historyItem.gameNo;
        historyItemNodeTmp.active = true;

        this.historyList.addChild(historyItemNodeTmp);

        let bankerMahjongNode = historyItemNodeTmp.getChildByName("bankerMahjongNode");
        this.createCardItemView(bankerMahjongNode, historyItem.pokers.slice(0, 2));
        let shunMahjongNode = historyItemNodeTmp.getChildByName("shunMahjongNode");
        this.createCardItemView(shunMahjongNode, historyItem.pokers.slice(2, 4));
        let qianMahjongNode = historyItemNodeTmp.getChildByName("qianMahjongNode");
        this.createCardItemView(qianMahjongNode, historyItem.pokers.slice(4, 6));
        let weiMahjongNode = historyItemNodeTmp.getChildByName("weiMahjongNode");
        this.createCardItemView(weiMahjongNode, historyItem.pokers.slice(6, 8));
    }

    createCardItemView(parentNode: cc.Node, pokers: string[]) {
        let cardItemNode = cc.instantiate(this.cardItemView);
        cardItemNode.scale = 0.6
        cardItemNode.x = -24;
        parentNode.addChild(cardItemNode);
        let cardItemView: CardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(pokers[0])));

        cardItemNode = cc.instantiate(this.cardItemView);
        cardItemNode.scale = 0.6
        cardItemNode.x = 25;
        parentNode.addChild(cardItemNode);
        cardItemView = cardItemNode.getComponent("CardItemView");
        cardItemView.show("mine", "fall", this.convertMahjongValue(parseInt(pokers[1])));
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
}
