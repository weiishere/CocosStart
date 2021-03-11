const { ccclass, property } = cc._decorator;

import ViewComponent from "../../Base/ViewComponent";
import { BankerQueuePlayer } from "../../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { DeskBankerPlayer } from "../../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { HistoryItem } from "../../GameData/TuiTongZi/s2c/HistoryItem";
import { S2CEnterRoom } from "../../GameData/TuiTongZi/s2c/S2CEnterRoom";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { UserInfo } from "../../repositories/TTZDeskRepository";

@ccclass
export default class HistoryPanel extends ViewComponent {
    /** 上庄或者下庄按钮 */
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    historyList: cc.Node = null;
    @property(cc.Node)
    historyItemNode: cc.Node = null;
    @property(cc.Prefab)
    cardItemView: cc.Prefab = null;

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

    }

    createHistoryItemNode(historyItem: HistoryItem) {
        let historyItemNodeTmp = cc.instantiate(this.historyItemNode);
        historyItemNodeTmp.active = true;

        let bankerMahjongNode = historyItemNodeTmp.getChildByName("bankerMahjongNode");
        let shunMahjongNode = historyItemNodeTmp.getChildByName("shunMahjongNode");
        let qianMahjongNode = historyItemNodeTmp.getChildByName("qianMahjongNode");
        let weiMahjongNode = historyItemNodeTmp.getChildByName("weiMahjongNode");
    }

    createCardItemView(mjValue) {

    }
}
