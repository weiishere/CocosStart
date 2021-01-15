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
    private touchCard: cc.Node;
    private barCard: cc.Node;
    private huCard: cc.Node;
    private outCardList: cc.Node;
    private mainCardList: Array<cc.Node> = [];
    private handCard: cc.Node = null;

    private frontMainCardListPanel: cc.Node;
    private frontTouchCard: cc.Node;
    private frontBarCard: cc.Node;
    private frontHuCard: cc.Node;
    private frontOutCardList: cc.Node;
    private frontMainCardList: Array<cc.Node> = [];
    private frontHandCard: cc.Node = null;

    private opreationArea: cc.Node;

    private opreationBtus: { ready_btu: cc.Node, show_btu: cc.Node, bar_btu: cc.Node, touch_btu: cc.Node, hu_btu: cc.Node, selfHu_btu: cc.Node, pass_btu: cc.Node } = {
        ready_btu: null,
        show_btu: null,
        bar_btu: null,
        touch_btu: null,
        hu_btu: null,
        selfHu_btu: null,
        pass_btu: null,
    }
    private deskAiming: { left: cc.Node, top: cc.Node, bottom: cc.Node, right: cc.Node } = {
        left: null,
        top: null,
        bottom: null,
        right: null,
    }
    private deskBtus: { exit: cc.Node, help: cc.Node, record: cc.Node, set: cc.Node } = {
        exit: null,
        help: null,
        record: null,
        set: null,
    }
    bindUI(): void {
        const jobLayout = this.node.getChildByName("myJobNode").getChildByName("jobLayout");//本方工作区
        const frontJobLayout = this.node.getChildByName("frontJobNode").getChildByName("jobLayout");//对家工作区
        const deskAiming = this.node.getChildByName("desk").getChildByName("deskCenter");//方向盘

        //#region 玩家的节点
        this.mainCardListPanel = jobLayout.getChildByName("mainCardListPanel");
        this.handCard = jobLayout.getChildByName("handCard");
        this.touchCard = jobLayout.getChildByName("touchCard");
        this.barCard = jobLayout.getChildByName("barCard");
        this.huCard = jobLayout.getChildByName("huCard");
        this.outCardList = this.node.getChildByName("myJobNode").getChildByName("outCardList");
        this.opreationArea = this.node.getChildByName("opreationArea");
        //#endregion

        //#region 前方玩家
        this.frontMainCardListPanel = frontJobLayout.getChildByName("mainCardListPanel");
        this.frontHandCard = frontJobLayout.getChildByName("handCard");
        this.frontTouchCard = frontJobLayout.getChildByName("touchCard");
        this.frontBarCard = frontJobLayout.getChildByName("barCard");
        this.frontHuCard = frontJobLayout.getChildByName("huCard");
        this.frontOutCardList = this.node.getChildByName("frontJobNode").getChildByName("outCardList");
        //#endregion

        //#region 玩家操作按钮节点
        this.opreationBtus.ready_btu = this.opreationArea.getChildByName("ready");
        this.opreationBtus.show_btu = this.opreationArea.getChildByName("show");
        this.opreationBtus.bar_btu = this.opreationArea.getChildByName("bar");
        this.opreationBtus.touch_btu = this.opreationArea.getChildByName("touch");
        this.opreationBtus.hu_btu = this.opreationArea.getChildByName("hu");
        this.opreationBtus.selfHu_btu = this.opreationArea.getChildByName("selfHu");
        this.opreationBtus.pass_btu = this.opreationArea.getChildByName("pass");

        this.deskBtus.exit = this.node.getChildByName('exitIcon');
        this.deskBtus.help = this.node.getChildByName('helpIcon');
        this.deskBtus.record = this.node.getChildByName('recordIcon');
        this.deskBtus.set = this.node.getChildByName('setIcon');

        this.opreationBtus.ready_btu.active = false;
        this.opreationBtus.show_btu.active = false;
        this.opreationBtus.bar_btu.active = false;
        this.opreationBtus.touch_btu.active = false;
        this.opreationBtus.hu_btu.active = false;
        this.opreationBtus.selfHu_btu.active = false;
        this.opreationBtus.pass_btu.active = false;
        //#endregion


        for (let i in this.opreationBtus) {
            if (this.opreationBtus[i] instanceof cc.Node) {
                (this.opreationBtus[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.opreationBtus[i].dispatchEvent(new cc.Event.EventCustom("gameOpreation", true));
                }, this);
            }
        }
        for (let i in this.deskBtus) {
            if (this.deskBtus[i] instanceof cc.Node) {
                (this.deskBtus[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.deskBtus[i].dispatchEvent(new cc.Event.EventCustom("deskOpreation", true));
                }, this);
            }
        }

        //#region 方向盘
        this.deskAiming.top = deskAiming.getChildByName("p-top");
        this.deskAiming.bottom = deskAiming.getChildByName("p-bottom");
        this.deskAiming.left = deskAiming.getChildByName("p-left");
        this.deskAiming.right = deskAiming.getChildByName("p-right");
        //#endregion
    }
    bindEvent(): void {
        this.opreationArea.on('gameOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.95, position: cc.v2(0, -5) }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
            }).to(0.1, { scale: 1, position: cc.v2(0, 0) }).start();
        }, this);
        this.node.on('deskOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.9 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
            }).to(0.1, { scale: 1 }).start();
        }, this);
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
            const touchItem = new cc.Node('barItem');
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
            const self = this;
            const card = this.addCardToNode(this.mainCardListPanel, item, "mine", 'setUp', {
                touchEndCallback: function () {
                    self.mainCardList.map(item => {
                        const _view = (item.getComponent("CardItemView") as CardItemView);
                        if (this._id !== _view['_id']) _view.reSetChooseFalse();
                        self.handCard && (self.handCard.getComponent("CardItemView") as CardItemView).reSetChooseFalse();
                    });
                }
            })
            this.mainCardList.push(card);
            (card.getComponent("CardItemView") as CardItemView).bindLaunch((node) => {
                console.log(node);
            })
        });
        //摸牌
        if (gameData.myCards.handCard !== -1) {
            this.handCard = this.addCardToNode(this.huCard, gameData.myCards.handCard, "mine", 'setUp', { active: true });
            (this.handCard.getComponent("CardItemView") as CardItemView).bindLaunch((node) => {
                console.log(node);
            });
        } else {
            this.handCard = null;
        }

        //胡牌
        if (gameData.myCards.hadHuCard !== -1) this.addCardToNode(this.huCard, gameData.myCards.hadHuCard, "mine", 'fall');

        //打出牌
        gameData.myCards.outCardList.map((item, index) => {
            const card = this.addCardToNode(this.outCardList, item, "mine", "fall")
            card.setPosition(cc.v2(0, 0));
            card.setScale(0.6, 0.6);
            if (index === 0) {
                (card.getComponent("CardItemView") as CardItemView).setArrows(true);
            }
        });
    }
    /**控制自己的操作按钮显示 */
    initMyOpreationBtuShow(gameData: GameData): void {
        gameData.eventData.gameEventData.myGameEvent.eventName.forEach(item => {
            switch (item) {
                case 'show':
                    this.opreationBtus.show_btu.active = true;
                    break;
                case 'touch':
                    this.opreationBtus.touch_btu.active = true;

                    break;
                case 'bar':
                    this.opreationBtus.bar_btu.active = true;
                    break;
                case 'hu':
                    this.opreationBtus.hu_btu.active = true;
                    break;
                case 'ready':
                    this.opreationBtus.ready_btu.active = true;
                    break;
            }
        });
        if (gameData.eventData.gameEventData.myGameEvent.eventName.indexOf('show') === -1 && gameData.eventData.gameEventData.myGameEvent.eventName.indexOf('ready') === -1) {
            this.opreationBtus.pass_btu.active = true;
        }
    }
    /**刷新方向盘 */
    updatedDeskAiming(gameData: GameData, deskData: DeskData, loginData): void {

        let positionNode = [this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top, this.deskAiming.left];
        const { head, nickname, userName, gold } = loginData;
        const myGameIndex = deskData.playerList.find(item => item.playerId === userName).gameIndex;
        if (myGameIndex === 0) {
            positionNode = [this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top, this.deskAiming.left]
        } else if (myGameIndex === 1) {
            positionNode = [this.deskAiming.right, this.deskAiming.top, this.deskAiming.left, this.deskAiming.bottom]
        } else if (myGameIndex === 2) {
            positionNode = [this.deskAiming.top, this.deskAiming.left, this.deskAiming.bottom, this.deskAiming.right]
        } else if (myGameIndex === 3) {
            positionNode = [this.deskAiming.left, this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top]
        }
        positionNode[gameData.positionIndex].active = true;
    }
    /**处理前方玩家界面 */
    initFrontjobPanel(gameData: GameData, deskDate: DeskData): void {
        gameData.partnerCardsList.forEach(partnerCards => {
            //先处理对家
            const self = this;
            //碰牌
            partnerCards.partnerCards.touchCard.map(item => {
                const touchItem = new cc.Node('touchItem');
                //touchItem.setScale(0.7, 0.7);
                const layoutCom = touchItem.addComponent(cc.Layout);
                layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                //layoutCom.type = cc.Layout.Type.HORIZONTAL;
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(-36, 0));
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(36, 0));
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(0, 28));
                this.frontTouchCard.addChild(touchItem);
            });
            //杠牌
            partnerCards.partnerCards.barCard.map(item => {
                const touchItem = new cc.Node('barItem');
                //touchItem.setScale(0.7, 0.7);
                const layoutCom = touchItem.addComponent(cc.Layout);
                layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                //layoutCom.type = cc.Layout.Type.HORIZONTAL;
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(0, 0));
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(-72, 0));
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(-144, 0));
                this.addCardToNode(touchItem, item, "front", "fall").setPosition(cc.v2(-72, 28));
                this.frontBarCard.addChild(touchItem);
            });
            //主牌
            for (let i = 0; i < partnerCards.partnerCards.curCardCount; i++) {
                this.addCardToNode(this.frontMainCardListPanel, 0, "front", 'setUp');
            }

            //摸牌
            if (partnerCards.partnerCards.isHandCard) {
                this.frontHandCard = this.addCardToNode(this.frontHandCard, 0, "front", 'setUp');
            } else {
                this.frontHandCard = null;
            }

            //胡牌
            if (partnerCards.partnerCards.hadHuCard !== -1) this.addCardToNode(this.frontHuCard, partnerCards.partnerCards.hadHuCard, "front", 'fall');

            //打出牌
            partnerCards.partnerCards.outCardList.map((item, index) => {
                const card = this.addCardToNode(this.frontOutCardList, item, "front", "fall")
                card.setPosition(cc.v2(0, 0));
                card.setScale(0.6, 0.6);
                // if (index === 0) {
                //     (card.getComponent("CardItemView") as CardItemView).setArrows(true);
                // }
            });
        });

    }
    /**
     * 添加牌
     * @param parentNode 需要加到的节点
     * @param num 牌数
     * @param position 玩家方向
     * @param mod 倒还是立
     */
    addCardToNode(parentNode: cc.Node, num: number, position: PositionType, mod: ModType, option?: {
        scale?: number,
        active?: boolean,
        touchEndCallback?: (node: cc.Node) => void
    }): cc.Node {
        const card = cc.instantiate(this.cardItem);
        card.setPosition(cc.v2(0, 0));
        parentNode.addChild(card);
        (card.getComponent("CardItemView") as CardItemView).show(position, mod, num, option);
        return card;
    }
    start() {

    }

    // update (dt) {}
}
