// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { GameData, DeskData, PlayerInfo, DeskRepository } from "../repositories/DeskRepository"
import ViewComponent from "../Base/ViewComponent";
import CardItemView, { ModType, PositionType, FallShowStatus } from "../Component/CardItemView"
import Facade from "../../Framework/care/Facade";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { DeskProxy } from "../Proxy/DeskProxy";
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy";
import { LoginData } from "../GameData/LoginData";
import { GateCommand } from "../Command/GateCommand";
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { DeskPanelViewEventDefine } from "../GameConst/Event/DeskPanelViewEventDefine";

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
    private positionNode: Array<cc.Node>;
    private opreationArea: cc.Node;
    private gameEventView: cc.Node;
    private deskOpreationIconWrap: cc.Node;
    private myShowCardWrap: cc.Node;
    private frontShowCardWrap: cc.Node;
    private showOutCard: cc.Node;

    private scheduleCallBack: () => void;
    private cardChooseAlert: cc.Node;
    private gameEventWarn: { touchWarn: cc.Node, huWarn: cc.Node, burWarn: cc.Node, xiayuWarn: cc.Node, zimoWarn: cc.Node, gameBeginWarn: cc.Node } = {
        touchWarn: null,
        huWarn: null,
        burWarn: null,
        xiayuWarn: null,
        zimoWarn: null,
        gameBeginWarn: null
    }
    private opreationBtus: { ready_btu: cc.Node, show_btu: cc.Node, bar_btu: cc.Node, touch_btu: cc.Node, hu_btu: cc.Node, selfHu_btu: cc.Node, pass_btu: cc.Node, baoQingHu_btu: cc.Node, qingHu_btu: cc.Node, baoHu_btu: cc.Node } = {
        ready_btu: null,
        show_btu: null,
        bar_btu: null,
        touch_btu: null,
        hu_btu: null,
        selfHu_btu: null,
        pass_btu: null,
        baoQingHu_btu: null,
        qingHu_btu: null,
        baoHu_btu: null
    }
    private deskAiming: { left: cc.Node, top: cc.Node, bottom: cc.Node, right: cc.Node } = {
        left: null,
        top: null,
        bottom: null,
        right: null,
    }
    private deskBtus: { exit: cc.Node, help: cc.Node, record: cc.Node, set: cc.Node, chat: cc.Node } = {
        exit: null,
        help: null,
        record: null,
        set: null,
        chat: null
    }
    private isSuper = false;
    private arrowCard: cc.Node = null;
    private showCardEvent: (card: number) => void = (card: number) => { };
    getSelfPlayer(): LoginData {
        return (<LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData)).getLoginData();
    }
    getPlayerByIndex(playerIndex: number): PlayerInfo {
        return this.getData().deskData.playerList.find(player => player.gameIndex === playerIndex);
    }
    getIndexByPlayerId(playerId: string): PlayerInfo {
        return this.getData().deskData.playerList.find(player => player.playerId === playerId);
    }
    getPlayerByPosition(playerIndex: number): PlayerInfo {
        return this.getData().deskData.playerList.find(player => player.gameIndex === playerIndex);
    }
    getData(): DeskRepository {
        return (Facade.Instance.retrieveProxy(ProxyDefine.Desk) as DeskProxy).repository;
    }
    isMe(index?, playerId?): boolean {
        const { userName } = this.getSelfPlayer();
        if (index !== false) {
            const player = this.getPlayerByIndex(index);
            if (player) {
                return this.getPlayerByIndex(index).playerId === userName;
            } else {
                console.log('===============Error=====================',)
                return false;
            }

        } else {
            return playerId === userName;
        }
    }
    /**重置游戏操作区按钮 */
    reSetOpreationBtu() {
        for (let i in this.opreationBtus) {
            if (this.opreationBtus[i] instanceof cc.Node) {
                (this.opreationBtus[i] as cc.Node).active = false;
            }
        }
    }
    /**重置桌面事件展示区 */
    private reSetDeskEventEffect() {
        for (let i in this.gameEventWarn) {
            if (this.gameEventWarn[i] instanceof cc.Node) {
                (this.gameEventWarn[i] as cc.Node).active = false;
            }
        }
    }
    /**
     * 添加牌
     * @param parentNode 需要加到的节点
     * @param num 牌数
     * @param position 玩家方向
     * @param mod 倒还是立
     */
    addCardToNode(parentNode: cc.Node, num: number, position: PositionType, mod: ModType, option: {
        scale?: number,
        active?: boolean,
        position?: cc.Vec2,
        fallShowStatus?: FallShowStatus,
        purAddNode?: (node: cc.Node) => void
        touchEndCallback?: (node: cc.Node) => void
    } = {}): cc.Node {
        const card = cc.instantiate(this.cardItem);
        const _position = option.position || cc.v2(0, 0);
        card.setPosition(_position);
        option.purAddNode && option.purAddNode(card);
        (card.getComponent("CardItemView") as CardItemView).show(position, mod, num, option);
        parentNode.addChild(card);
        return card;
    }
    /**执行动画 */
    effectAction(node: cc.Node, mode: 'show' | 'hide', option: { startPosition?: cc.Vec2 | cc.Vec3, moveBy?: { x: number, y: number } } = {}, done?: (node: cc.Node) => void) {
        option.startPosition && node.setPosition(option.startPosition);
        if (mode === 'show') {
            node.opacity = 0;
            node.setScale(0.9, 0.9);
            node.active = true;
            const _moveBy = option.moveBy ? option.moveBy : { x: 0, y: 0 };
            //const action = cc.sequence(cc.spawn((cc.scaleTo(0.2, 1, 1), cc.moveBy(0.2, _moveBy.x, _moveBy.y))), cc.callFunc(() => done && done(node)));
            const action = cc.sequence(cc.spawn(cc.scaleTo(0.2, 1, 1), cc.fadeTo(0.2, 255), cc.moveBy(0.2, _moveBy.x, _moveBy.y)), cc.callFunc(() => done && done(node)));
            node.runAction(action);
        } else if (mode === 'hide') {
            const action = cc.sequence(cc.spawn((cc.scaleTo(0.2, 0.9, 0.9), cc.fadeTo(0.2, 0))), cc.callFunc(() => {
                node.active = false;
                done && done(node);
            }));
            node.runAction(action);
        }
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
        this.gameEventView = this.node.getChildByName("gameEventView");
        this.myShowCardWrap = this.node.getChildByName("myJobNode").getChildByName("showCard");
        this.frontShowCardWrap = this.node.getChildByName("frontJobNode").getChildByName("showCard");
        //#endregionthis.node.getChildByName("myJobNode")

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
        this.opreationBtus.qingHu_btu = this.opreationArea.getChildByName("qingHu");
        this.opreationBtus.baoHu_btu = this.opreationArea.getChildByName("baoHu");
        this.opreationBtus.baoQingHu_btu = this.opreationArea.getChildByName("baoQingHu");
        this.reSetOpreationBtu();
        this.deskBtus.exit = this.node.getChildByName('deskOpreationIcon').getChildByName('exitIcon');
        this.deskBtus.help = this.node.getChildByName('deskOpreationIcon').getChildByName('helpIcon');
        this.deskBtus.record = this.node.getChildByName('deskOpreationIcon').getChildByName('recordIcon');
        this.deskBtus.set = this.node.getChildByName('deskOpreationIcon').getChildByName('setIcon');
        this.deskBtus.set = this.node.getChildByName('deskOpreationIcon').getChildByName('setIcon');
        this.deskBtus.chat = this.node.getChildByName('deskOpreationIcon').getChildByName('chatIcon');
        //#endregion

        this.cardChooseAlert = this.node.getChildByName('cardChooseAlert');
        this.deskOpreationIconWrap = this.node.getChildByName("deskOpreationIcon");
        //#region 其他玩家事件提醒
        this.gameEventWarn.touchWarn = this.gameEventView.getChildByName("peng_2x");
        this.gameEventWarn.huWarn = this.gameEventView.getChildByName("hu_2x");
        this.gameEventWarn.burWarn = this.gameEventView.getChildByName("gang_2x");
        this.gameEventWarn.xiayuWarn = this.gameEventView.getChildByName("xiayu_2x");
        this.gameEventWarn.zimoWarn = this.gameEventView.getChildByName("zimo_2x");
        this.gameEventWarn.gameBeginWarn = this.gameEventView.getChildByName("gameBegin");
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
        let clickCount = 0;
        this.schedule(() => { clickCount = 0; }, 10);
        deskAiming.on(cc.Node.EventType.TOUCH_START, () => {
            if (clickCount >= 3) {
                this.isSuper = !this.isSuper;
                clickCount = 0;
                this.updateOtherCurCardList();
                this.updateHandCardAndHuCard();
            } else {
                clickCount++;
            }
        }, this);

        this.dispatchCustomEvent(DeskPanelViewEventDefine.DeskPanelViewOnLoadComplate, null);
    }
    bindEvent(): void { }
    /**绑定游戏操作事件（杠碰胡等） */
    bindGameOpreationEvent(callBack: (node: cc.Node, correlationInfoData) => void): void {
        this.opreationArea.on('gameOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.95, position: cc.v2(0, -5) }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, this.getData().gameData.eventData.gameEventData.myGameEvent.correlationInfoData);
            }).to(0.1, { scale: 1, position: cc.v2(0, 0) }).start();
        }, this);
    }
    /**绑定桌面操作事件（设置、记录按钮等） */
    bindDskOpreationEvent(callBack: (node: cc.Node) => void): void {
        this.deskOpreationIconWrap.on('deskOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.9 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node);
            }).to(0.1, { scale: 1 }).start();
        }, this);
    }
    /**绑定出牌回调 */
    bindShowCardEvent(showCardEvent: (card: number) => void) {
        this.showCardEvent = showCardEvent;
    }
    /**初始化方向盘 */
    private initDeskAiming(playerId): void {
        this.positionNode = [this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top, this.deskAiming.left];
        //const { head, nickname, userName, gold } = loginData;
        const myGameIndex = this.getData().deskData.playerList.find(item => item.playerId === playerId).gameIndex;
        if (myGameIndex === 0) {
            this.positionNode = [this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top, this.deskAiming.left]
        } else if (myGameIndex === 1) {
            this.positionNode = [this.deskAiming.right, this.deskAiming.top, this.deskAiming.left, this.deskAiming.bottom]
        } else if (myGameIndex === 2) {
            this.positionNode = [this.deskAiming.top, this.deskAiming.left, this.deskAiming.bottom, this.deskAiming.right]
        } else if (myGameIndex === 3) {
            this.positionNode = [this.deskAiming.left, this.deskAiming.bottom, this.deskAiming.right, this.deskAiming.top]
        }
        //positionNode[gameData.positionIndex].active = true;
    }
    /**更新用户信息 */
    updatePlayerHeadView(): void {
        //先更新转盘
        this.initDeskAiming(this.getSelfPlayer().userName);
        const myHeadNode = this.node.getChildByName("headList").getChildByName("myHead"); //myHeadNode.active = false;
        const frontHeadNode = this.node.getChildByName("headList").getChildByName("frontHead"); frontHeadNode.active = false;
        const self = this;
        this.getData().deskData.playerList.forEach(player => {
            let headWrap: cc.Node;
            if (self.isMe(false, player.playerId)) {
                headWrap = myHeadNode;
            } else {
                if (self.positionNode[player.gameIndex].name === 'p-top') {
                    //更新对家头像信息
                    frontHeadNode.active = true;
                    headWrap = frontHeadNode;
                } else if (self.positionNode[player.gameIndex].name === 'p-left') {
                    //更新左方头像信息
                } else if (self.positionNode[player.gameIndex].name === 'p-right') {
                    //更新右方头像信息
                }
            }
            headWrap.getChildByName("nickName").getComponent(cc.Label).string = player.playerName;//昵称
            headWrap.getChildByName("goldView").getChildByName("myGlod").getComponent(cc.Label).string = player.playerGold + '';//金币
            cc.loader.load(player.playerHeadImg, (error, item) => {
                if (error) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家头像获取失败' }, '');
                } else {
                    headWrap.getChildByName("head").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item);
                }
            });
        });

    }
    /**更新桌面信息 */
    // updateDeskInfo(): void {
    //     const { gameRoundNum, totalRound, baseScore, fanTime } = this.getData().deskData.gameSetting;
    //     this.node.getChildByName("deskInfo").getChildByName("deskInfoStr").getComponent(cc.Label).string = `第${(gameRoundNum + 1)}/${totalRound}局\n底分:${baseScore} / 翻数:${fanTime}`;
    // }
    /**更新自己主牌 */
    updateMyCurCardList(effectDone: () => void): void {
        this.mainCardList = [];
        const self = this;
        this.mainCardListPanel.removeAllChildren();
        this.getData().gameData.myCards.curCardList.map(item => {
            const card = this.addCardToNode(this.mainCardListPanel, item, "mine", 'setUp', {
                touchEndCallback: function () {
                    const script = this.node.getComponent("CardItemView") as CardItemView;
                    if (script.isChoose) {
                        if (script.isActive) {
                        } else {
                        }

                    } else {
                        self.mainCardList.map(item => {
                            const _view = (item.getComponent("CardItemView") as CardItemView);
                            if (this._id !== _view['_id']) _view.reSetChooseFalse();
                            card && (card.getComponent("CardItemView") as CardItemView).reSetChooseFalse();
                        });
                        if (self.getData().gameData.myCards.handCard) (self.handCard.getChildByName('cardItemView').getComponent("CardItemView") as CardItemView).reSetChooseFalse();
                    }
                }
            });
            const cardScript = (card.getComponent("CardItemView") as CardItemView);
            if (cardScript.isActive) {
                cardScript.bindExtractionUp((cardNumber: number) => { });
            }
            cardScript.bindLaunch((node) => {
                console.log("出牌", node);
                this.showOutCard = node;
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber;
                self.showCardEvent(cardNumber);
            })
            this.mainCardList.push(card);
        });
        if (effectDone) {
            this.mainCardListPanel.children.forEach(item => {
                item.setPosition(0, 50);
                item.opacity = 0;
                item.scale = 0.8;
                (item.getComponent("CardItemView") as CardItemView).setMainHide(false);
            });
            let index = 0;
            this.schedule(() => {
                const card = this.mainCardListPanel.children[index];
                cc.tween(card).to(0.2, { position: cc.v3(0, 0), opacity: 255, scale: 1 }, { easing: 'easeBackInOut' }).call(() => { 
                    (card.getComponent("CardItemView") as CardItemView).setMainHide(true);
                }).start();
                index++;
                console.log(index);
                if (index === this.mainCardListPanel.children.length - 1) {
                    effectDone();
                }
            }, 0.2, this.mainCardListPanel.children.length - 1)
        }
    }
    /**更新其他玩家的主牌 */
    updateOtherCurCardList(): void {
        this.frontMainCardListPanel.removeAllChildren();
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const playerIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[playerIndex].name === 'p-top') {
                //更新对家主牌
                // for (let i = 0; i < partner.partnerCards.curCardCount; i++) {
                //     this.addCardToNode(this.frontMainCardListPanel, 0, "front", 'setUp');
                // }
                for (let i = 0, l = partner.partnerCards.curCardList.length; i < l; i++) {
                    this.addCardToNode(this.frontMainCardListPanel, this.isSuper ? partner.partnerCards.curCardList[i] : 0, "front", 'setUp');
                }
            } else if (this.positionNode[playerIndex].name === 'p-left') {
                //更新左方主牌
            } else if (this.positionNode[playerIndex].name === 'p-right') {
                //更新右方主牌
            }
        });
    }
    /**更新杠碰牌 */
    updateMyBarAndTouchCard(): void {
        //先更新杠/碰
        this.barCard.removeAllChildren();
        this.barCard.width = 0;
        this.getData().gameData.myCards.barCard.map(item => {
            const touchItem = new cc.Node('barItem');
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (item.barType === 0 || item.barType === 1) {
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(0, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 0) });//.setPosition(cc.v2(-72, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-144, 0) });//.setPosition(cc.v2(-144, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 28) });//.setPosition(cc.v2(-72, 28));
            } else if (item.barType === 2) {
                //----------------------------------------暗杠,最上面一张需要盖住
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(0, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 0) });//.setPosition(cc.v2(-72, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-144, 0) });//.setPosition(cc.v2(-144, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 29), fallShowStatus: 'hide' });//.setPosition(cc.v2(-72, 28));
            }
            this.barCard.addChild(touchItem);
        });
        this.touchCard.removeAllChildren();
        this.touchCard.width = 0;
        this.getData().gameData.myCards.touchCard.map(item => {
            const touchItem = new cc.Node('touchItem');
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(-36, 0) });//.setPosition(cc.v2(-36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(36, 0) });//.setPosition(cc.v2(36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(0, 28) });//.setPosition(cc.v2(0, 28));
            this.touchCard.addChild(touchItem);
        });

        //更新其他玩家杠/碰
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                this.frontBarCard.removeAllChildren();
                this.frontBarCard.width = 0;
                partner.partnerCards.barCard.forEach(item => {
                    const touchItem = new cc.Node('barItem');
                    const layoutCom = touchItem.addComponent(cc.Layout);
                    layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    if (item.barType === 0 || item.barType === 1) {
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(0, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-72, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-144, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-72, 28) });
                    } else if (item.barType === 2) {
                        //----------------------------------------暗杠,最上面一张需要盖住
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(0, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-72, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-144, 0) });
                        this.addCardToNode(touchItem, item.barCard, "front", "fall", { position: cc.v2(-72, 29), fallShowStatus: 'hide' });
                    }
                    this.frontBarCard.addChild(touchItem);
                });
                this.frontTouchCard.removeAllChildren();
                this.frontTouchCard.width = 0;
                partner.partnerCards.touchCard.forEach(item => {
                    const touchItem = new cc.Node('touchItem');
                    const layoutCom = touchItem.addComponent(cc.Layout);
                    layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    this.addCardToNode(touchItem, item, "front", "fall", { position: cc.v2(-36, 0) });//.setPosition(cc.v2(-36, 0));
                    this.addCardToNode(touchItem, item, "front", "fall", { position: cc.v2(36, 0) });//.setPosition(cc.v2(36, 0));
                    this.addCardToNode(touchItem, item, "front", "fall", { position: cc.v2(0, 28) });//.setPosition(cc.v2(0, 28));
                    this.frontTouchCard.addChild(touchItem);
                });
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
            }
        });
    }
    /**更新用户手牌/胡牌 */
    updateHandCardAndHuCard(): void {
        const self = this;
        //if (type === 'hand') {
        //先检测本方手牌
        this.handCard.removeAllChildren();
        this.handCard.width = 0;
        if (this.getData().gameData.myCards.handCard !== 0) {
            const _handCard = this.addCardToNode(this.handCard, this.getData().gameData.myCards.handCard, "mine", 'setUp', {
                active: true,
                purAddNode: node => {
                    (node.getComponent("CardItemView") as CardItemView).setStress();//选中
                },
                touchEndCallback: function () {
                    self.mainCardList.map(item => {
                        const _view = (item.getComponent("CardItemView") as CardItemView);
                        _view.reSetChooseFalse();
                    });
                }
            });
            const _card = (_handCard.getComponent("CardItemView") as CardItemView);
            _card.bindLaunch((node) => {
                console.log(node);
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber
                self.showCardEvent(cardNumber);
            });
            _card.setStress(true);
            const _mayHuCard = self.getData().gameData.myCards.mayHuCards.find(item => item.putCard === _card.cardNumber);
            if (_mayHuCard) _card.setHuCard(_mayHuCard);
        }

        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        //当有手牌且无其他命令或者只有出牌命令的时候需要激活牌组

        if ((this.getData().gameData.myCards.handCard !== 0 && eventName.length === 0) || eventName.indexOf('show') !== -1) {
            if (this.getData().gameData.myCards.status.isBaoHu) {
                //报胡不能出牌
                self.mainCardList.map(item => (item.getComponent("CardItemView") as CardItemView).setDisable());
            } else if (this.getData().gameData.myCards.status.isBaoQingHu) {
                //报请胡，有些牌可以出，对子牌不能出
                const disableCard = this.getData().gameData.myCards.disableCard;
                disableCard.forEach(item => {
                    self.mainCardList.filter(card => {
                        const _card = card.getComponent("CardItemView") as CardItemView;
                        _card.isActive = true;
                        return _card.cardNumber === item;
                    }).forEach((card, i) => {
                        const _card = card.getComponent("CardItemView") as CardItemView;
                        if (i < 2) {
                            if (_card.isDisable) _card.setDisable();//最多只能一对
                        }
                    });
                })
            } else {
                //全部牌都可以出，并配置可胡牌
                self.mainCardList.map(item => {
                    const _card = (item.getComponent("CardItemView") as CardItemView); _card.isActive = true;
                    const _mayHuCard = self.getData().gameData.myCards.mayHuCards.find(item => item.putCard === _card.cardNumber);
                    if (_mayHuCard) _card.setHuCard(_mayHuCard);
                });
            }
        } else {
            //全部牌都不可以出
            self.mainCardList.map(item => (item.getComponent("CardItemView") as CardItemView).isActive = false);

        }
        //先检测本家胡牌
        this.huCard.removeAllChildren();
        this.huCard.width = 0;
        if (this.getData().gameData.myCards.hadHuCard !== 0) {
            this.addCardToNode(this.huCard, this.getData().gameData.myCards.hadHuCard, "mine", 'fall');
        }


        //再检测对家手牌
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                this.frontHandCard.removeAllChildren();
                this.frontHandCard.width = 0;
                if (partner.partnerCards.isHandCard) {
                    this.addCardToNode(this.frontHandCard, this.isSuper ? partner.partnerCards.handCard : 0, "front", 'setUp', {
                        purAddNode: node => {
                            (node.getComponent("CardItemView") as CardItemView).setStress();//选中
                        }
                    });
                }
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
            }
        });
        //再检测对家胡牌/听牌
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                const _hadHuCard = this.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.hadHuCard;
                this.frontHuCard.removeAllChildren();
                this.frontHuCard.width = 0;
                if (_hadHuCard !== 0) {
                    this.addCardToNode(this.frontHuCard, _hadHuCard, "front", 'fall');
                }
                //对家是否听牌
                const status = this.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.status;
                if ((status.isBaoQingHu || status.isBaoHu)) {
                    this.node.getChildByName("frontJobNode").getChildByName("ting").active = true;
                } else {
                    this.node.getChildByName("frontJobNode").getChildByName("ting").active = false;
                }
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
            }
        });
        //更新剩余牌数
        const remainCardNum = this.node.getChildByName("remainWrap").getChildByName("remainCard").getComponent(cc.Label);
        remainCardNum.string = this.getData().gameData.remainCard + '';
        //}
    }
    /**更新方向盘 */
    updatedDeskAiming(): void {
        this.positionNode.forEach(node => node.active = false);
        this.positionNode[this.getData().gameData.positionIndex].active = true;
    }
    /**更新操作按钮组 */
    updateMyOperationBtu(): void {
        this.reSetOpreationBtu();
        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        eventName.forEach(item => {
            switch (item) {
                case 'touch': this.opreationBtus.touch_btu.active = true; break;
                case 'bar': this.opreationBtus.bar_btu.active = true; break;
                case 'hu': this.opreationBtus.hu_btu.active = true; break;
                case 'qingHu': this.opreationBtus.qingHu_btu.active = true; break;
                case 'ting': this.opreationBtus.baoHu_btu.active = true; break;
                case 'show': this.opreationBtus.show_btu.active = true; break;
                case 'ready': this.opreationBtus.ready_btu.active = true; break;
                case 'tingQingHu': this.opreationBtus.baoQingHu_btu.active = true; break;
            }
        });

        if (eventName.length !== 0 && eventName.indexOf('show') === -1 && eventName.indexOf('ready') === -1) {
            this.effectAction(this.opreationBtus.pass_btu, 'show', {}, () => {

            })
            //this.opreationBtus.pass_btu.active = true;
        }
    }
    /**更新其他玩家事件提醒 */
    updateEventWran(isMe: boolean, effectDone: () => void) {
        this.reSetDeskEventEffect();
        let effectNode: cc.Node;
        const _eventName = this.getData().gameData.eventData.gameEventData.deskGameEvent.eventName;
        switch (_eventName) {
            case 'bar': effectNode = this.gameEventWarn.burWarn; break;
            case 'touch': effectNode = this.gameEventWarn.touchWarn; break;
            case 'hu': effectNode = this.gameEventWarn.huWarn; break;
            case 'xiayu': effectNode = this.gameEventWarn.xiayuWarn; break;
            case 'guafeng': effectNode = this.gameEventWarn.xiayuWarn; break;//刮风，图片待换
            case 'zimo': effectNode = this.gameEventWarn.zimoWarn; break;
            case 'gameBegin': effectNode = this.gameEventWarn.gameBeginWarn; break;
            case 'gameEnd': break;
            case 'ting': break;
            //case 'gameEnd'://游戏结束
        }
        let po = 0;
        if (isMe !== undefined) {
            po = isMe ? -250 : 250;
        }
        effectNode && this.effectAction(effectNode, 'show', { moveBy: { x: 0, y: 0 } }, (node) => {
            this.scheduleOnce(() => {
                cc.tween(node).to(0.2, { position: cc.v3(0, po), opacity: 0, scale: 0.3 }).call(() => {
                    node.setPosition(0, 0);
                    this.reSetDeskEventEffect();
                    effectDone();
                }).start();
            }, 1);
        });


        // console.log('-----------give:' + givePlayerIndex + '-----------')
        // if (!givePlayerIndex && givePlayerIndex !== 0) {
        //     let isAllEvent = ['xiayu', 'guafeng', 'gameBegin', 'gameEnd'].indexOf(_eventName) !== -1;
        //     if (isAllEvent && !this.isMe(this.getData().gameData.positionIndex)) {
        //         //如果不是全局事件，而且上次操作者不是自己，那么字就不动
        //         isAllEvent = false;
        //     }
        //     console.log('-----------------no:' + isAllEvent + '--------------------------');
        //     this.effectAction(effectNode, 'show', {}, (node) => {
        //         this.scheduleOnce(() => {
        //             cc.tween(node).to(0.2, { position: cc.v3(0, isAllEvent ? -250 : 0), opacity: 0, scale: 0.3 }).call(() => {
        //                 node.setPosition(0, 0);
        //                 this.reSetDeskEventEffect();
        //                 effectDone();
        //             }).start();
        //         }, 1);
        //     });
        // } else if (!this.isMe(givePlayerIndex)) {
        //     console.log('-----------------down--------------------------');
        //     this.effectAction(effectNode, 'show', { moveBy: { x: 0, y: 0 } }, (node) => {
        //         this.scheduleOnce(() => {
        //             cc.tween(node).to(0.2, { position: cc.v3(0, -250), opacity: 0, scale: 0.3 }).call(() => {
        //                 node.setPosition(0, 0);
        //                 this.reSetDeskEventEffect();
        //                 effectDone();
        //             }).start();
        //         }, 1);

        //     });
        // } else if (this.isMe(givePlayerIndex)) {
        //     console.log('-----------------up--------------------------');
        //     this.effectAction(effectNode, 'show', { moveBy: { x: 0, y: 0 } }, (node) => {
        //         this.scheduleOnce(() => {
        //             cc.tween(node).to(0.2, { position: cc.v3(0, 250), opacity: 0, scale: 0.3 }).call(() => {
        //                 node.setPosition(0, 0);
        //                 this.reSetDeskEventEffect();
        //                 effectDone();
        //             }).start();
        //         }, 1);

        //     });
        // }
    }
    /**获取outCard数据最后一个添加（考虑到性能没有做重刷） */
    createOutCard(playerIndex): void {
        if (this.arrowCard && this.arrowCard.isValid) (this.arrowCard.getComponent("CardItemView") as CardItemView).setArrows(false);
        let _card: cc.Node;
        if (this.isMe(playerIndex)) {
            _card = this.addCardToNode(this.outCardList, this.getData().gameData.myCards.outCardList[this.getData().gameData.myCards.outCardList.length - 1], "mine", "fall")
            _card.setPosition(cc.v2(0, 0));
            _card.setScale(0.6, 0.6);
        } else {
            const self = this;
            this.getData().gameData.partnerCardsList.forEach(partner => {
                if (self.positionNode[playerIndex].name === 'p-top') {
                    //更新对家打出牌
                    _card = this.addCardToNode(this.frontOutCardList, partner.partnerCards.outCardList[partner.partnerCards.outCardList.length - 1], "front", "fall")
                    _card.setPosition(cc.v2(0, 0));
                    _card.setScale(0.6, 0.6);
                } else if (self.positionNode[playerIndex].name === 'p-left') {
                    //更新左方打出牌
                } else if (self.positionNode[playerIndex].name === 'p-right') {
                    //更新右方打出牌
                }
            });
        }
        this.arrowCard = _card;
        (_card.getComponent("CardItemView") as CardItemView).setArrows(true);
    }
    /**获取outCard数据最后一个删除（考虑到性能没有做重刷） */
    deleteOutCard(playerIndex, card): void {
        let _card: cc.Node;
        if (this.isMe(playerIndex)) {
            const lastCardNode = this.outCardList.children[this.outCardList.childrenCount - 1];
            if (lastCardNode && (lastCardNode.getComponent('CardItemView') as CardItemView).cardNumber === card) {
                lastCardNode.destroy();
            }
            // this.outCardList.children.forEach(node => {
            //     if ((node.getComponent('CardItemView') as CardItemView).cardNumber === card) {
            //         node.destroy();
            //     }
            // });
        } else {
            const self = this;

            this.getData().gameData.partnerCardsList.forEach(partner => {
                if (self.positionNode[playerIndex].name === 'p-top') {
                    const lastCardNode = self.frontOutCardList.children[self.frontOutCardList.childrenCount - 1];
                    if (lastCardNode && (lastCardNode.getComponent('CardItemView') as CardItemView).cardNumber === card) {
                        lastCardNode.destroy();
                    }
                    // this.frontOutCardList.children.forEach(node => {
                    //     if ((node.getComponent('CardItemView') as CardItemView).cardNumber === card) { node.destroy(); }
                    // });
                } else if (self.positionNode[playerIndex].name === 'p-left') {
                    //更新左方打出牌
                } else if (self.positionNode[playerIndex].name === 'p-right') {
                    //更新右方打出牌
                }
            });
        }
        //this.arrowCard && (this.arrowCard.getComponent('CardItemView') as CardItemView).setArrows(false);
    }
    /**更新outcard */
    updateOutCard(): void {
        //先更新自己
        this.outCardList.removeAllChildren();
        this.getData().gameData.myCards.outCardList.map((item, index) => {
            const card = this.addCardToNode(this.outCardList, item, "mine", "fall")
            card.setPosition(cc.v2(0, 0));
            card.setScale(0.6, 0.6);
            // if (index === 0) {
            //     (card.getComponent("CardItemView") as CardItemView).setArrows(true);
            // }
        });
        this.getData().gameData.partnerCardsList.forEach(partner => {
            this.frontOutCardList.removeAllChildren();
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家出牌
                partner.partnerCards.outCardList.map((item, index) => {
                    const card = this.addCardToNode(this.frontOutCardList, item, "front", "fall")
                    card.setPosition(cc.v2(0, 0));
                    card.setScale(0.6, 0.6);
                });
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方出牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方出牌
            }
        })
    }
    /**更新待选牌组框且执行事件 */
    updateChooseCardsAndHandler(launch: (card: number) => void) {
        const cardsChoose = this.getData().gameData.myCards.cardsChoose;
        if (cardsChoose.length > 1) {
            this.cardChooseAlert.active = true;
            this.cardChooseAlert.removeAllChildren();
            const self = this;
            cardsChoose.map(item => {
                const card = this.addCardToNode(this.cardChooseAlert, item, "mine", 'setUp', {
                    purAddNode: node => { node.setScale(0.8, 0.8); node.setPosition(cc.v2(0, 10)) },
                    touchEndCallback: function () {
                        //const script = this.node.getComponent("CardItemView") as CardItemView;
                        launch(item);
                        self.cardChooseAlert.active = false;
                    }
                });
                //this.mainCardList.push(card);
            });
        } else {
            launch(cardsChoose[0]);
        }
    }
    /**展示打出的牌 */
    showCardAlert(gameIndex: number, cardNumber: number): void {
        if (this.isMe(gameIndex)) {
            const _card = this.addCardToNode(this.myShowCardWrap, cardNumber, "mine", "setUp", {
                purAddNode: node => (node.getComponent('CardItemView') as CardItemView).setStress(true)
            });
            _card.active = false;
            //this.showOutCard && _card.setPosition(this.showOutCard.position.x, this.showOutCard.position.y + 40);
            this.effectAction(_card, 'show', {
                moveBy: { x: 0, y: 50 }
            }, () => {
                this.scheduleOnce(() => this.myShowCardWrap.removeAllChildren(), 1.5);
            });
        } else {
            const _card = this.addCardToNode(this.frontShowCardWrap, cardNumber, "mine", "setUp", {
                purAddNode: node => (node.getComponent('CardItemView') as CardItemView).setStress(true)
            });
            _card.active = false;
            this.effectAction(_card, 'show', {
                moveBy: { x: 0, y: -50 }
            }, () => {
                this.scheduleOnce(() => this.frontShowCardWrap.removeAllChildren(), 1.5);
            });

        }
    }
    /**更新房间信息（牌局等） */
    updateRoomInfo(): void {
        this.node.getChildByName("remainWrap").active = true;//显示剩余牌数
        const deskInfoStr = this.node.getChildByName('deskInfo').getChildByName('deskInfoStr').getComponent(cc.Label);
        const { totalRound, gameRoundNum, baseScore, fanTime } = this.getData().deskData.gameSetting;
        deskInfoStr.string = `第${gameRoundNum + 1}/${totalRound}局\n底分:${baseScore} / 翻数:${fanTime}`;
    }
    /**更新倒计时 */
    updateCountDown(): void {
        this.scheduleCallBack && this.unschedule(this.scheduleCallBack);
        const deskAiming = this.node.getChildByName("desk").getChildByName("deskCenter");
        const countDownNum = deskAiming.getChildByName("countDown").getComponent(cc.Label);
        countDownNum.string = this.getData().gameData.countDownTime + '';
        this.scheduleCallBack = function () {
            let t = +countDownNum.string;
            if (t >= 0) countDownNum.string = (--t) + '';
            if (t === 1) {
                Facade.Instance.sendNotification(CommandDefine.Entrust, { command: true }, '');
                //this.openEntrustMask();
            }
        }
        this.schedule(this.scheduleCallBack, 1);
    }
    /**打开帮助框 */
    openHelperAlert(): void {
        cc.loader.loadRes('prefabs/helpAlert', cc.Prefab, (error, item) => {
            this.node.addChild(cc.instantiate(item));
        });
    }
    /**打开托管蒙版 */
    openEntrustMask(): void {
        const maskWrap = this.node.getChildByName('maskWrap');
        const tuoguanBtu = maskWrap.getChildByName('cancleTuoGuan');
        maskWrap.active = true;
        tuoguanBtu.on(cc.Node.EventType.TOUCH_START, () => {
            Facade.Instance.sendNotification(CommandDefine.Entrust, { command: false }, '');
            cc.tween(tuoguanBtu).to(0.1, { position: cc.v3(0, -5) }).to(0.1, { position: cc.v3(0, 5) }).call(() => { }).start();
        }, this);
    }
    /**关闭托管蒙版 */
    closeEntrustMask(): void {
        const maskWrap = this.node.getChildByName('maskWrap');
        maskWrap.active = false;
    }

    start() {

    }

    // update (dt) {}
}
