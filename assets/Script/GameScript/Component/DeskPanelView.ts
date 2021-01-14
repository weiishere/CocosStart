// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { GameData, DeskData } from "../repositories/DeskRepository"
import ViewComponent from "../Base/ViewComponent";
import CardItemView, { ModType, PositionType } from "../Component/CardItemView"

@ccclass
export default class DeskPanelView extends ViewComponent {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Prefab)
    cardItem: cc.Prefab = null;

    private mainCardListPanel: cc.Node;
    private handCard: cc.Node;
    private touchCard: cc.Node;
    private barCard: cc.Node;
    private huCard: cc.Node;
    private outCardList: cc.Node;

    bindUI(): void {
        const jobLayout = this.node.getChildByName("myJobNode").getChildByName("jobLayout");
        this.mainCardListPanel = jobLayout.getChildByName("mainCardListPanel");
        this.handCard = jobLayout.getChildByName("handCard");
        this.touchCard = jobLayout.getChildByName("touchCard");
        this.barCard = jobLayout.getChildByName("barCard");
        this.huCard = jobLayout.getChildByName("huCard");
        this.outCardList = this.node.getChildByName("myJobNode").getChildByName("outCardList");
    }
    bindEvent(): void {

    }

    /**处理自己的牌列界面 */
    initMyJobPanel(gameData: GameData, deskDate: DeskData): void {
        const self = this;
        //碰牌
        gameData.myCards.touchCard.map(item => {
            const touchItem = new cc.Node('touchItem');
            //touchItem.setScale(0.7, 0.7);
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            //layoutCom.type = cc.Layout.Type.HORIZONTAL;
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(-36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(0, 28));
            this.touchCard.addChild(touchItem);
        });
        //杠牌
        gameData.myCards.barCard.map(item => {
            const touchItem = new cc.Node('touchItem');
            //touchItem.setScale(0.7, 0.7);
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            //layoutCom.type = cc.Layout.Type.HORIZONTAL;
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(0, 0));
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(-72, 0));
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(-144, 0));
            this.addCardToNode(touchItem, item, "mine", "fall").setPosition(cc.v2(-72, 28));
            this.barCard.addChild(touchItem);
        });
        //主牌
        gameData.myCards.curCardList.map(item => {
            this.addCardToNode(this.mainCardListPanel, item, "mine", 'setUp');
        });
        //摸牌
        if (gameData.myCards.handCard !== -1) this.addCardToNode(this.huCard, gameData.myCards.handCard, "mine", 'setUp');

        //胡牌
        if (gameData.myCards.hadHuCard !== -1) this.addCardToNode(this.huCard, gameData.myCards.hadHuCard, "mine", 'fall');

        //打出牌
        gameData.myCards.outCardList.map(item => {
            const card = this.addCardToNode(this.outCardList, item, "mine", "fall")
            card.setPosition(cc.v2(0, 0));
            card.setScale(0.6,0.6);
        });
    }
    /**
     * 添加牌
     * @param parentNode 需要加到的节点
     * @param num 牌数
     * @param position 玩家方向
     * @param mod 倒还是立
     */
    addCardToNode(parentNode: cc.Node, num: number, position: PositionType, mod: ModType): cc.Node {
        const card = cc.instantiate(this.cardItem);
        card.setPosition(cc.v2(0, 0));
        parentNode.addChild(card);
        (card.getComponent("CardItemView") as CardItemView).show(position, mod, num);
        return card;
    }
    start() {

    }

    // update (dt) {}
}
