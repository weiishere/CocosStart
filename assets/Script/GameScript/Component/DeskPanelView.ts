// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { GameData, DeskData, PlayerInfo, DeskRepository } from "../repositories/DeskRepository"
import ViewComponent from "../Base/ViewComponent";
import CardItemView, { ModType, PositionType } from "../Component/CardItemView"
import Facade from "../../Framework/care/Facade";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { DeskProxy } from "../Proxy/DeskProxy";
import { LocalCacheDataProxy } from "../Proxy/LocalCacheDataProxy";
import { LoginData } from "../GameData/LoginData";
import { GateCommand } from "../Command/GateCommand";
import { CommandDefine } from "../MahjongConst/CommandDefine";

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

    private cardChooseAlert: cc.Node;
    private gameEventWarn: { touchWarn: cc.Node, huWarn: cc.Node, burWarn: cc.Node, xiayuWarn: cc.Node, zimoWarn: cc.Node, gameBeginWarn: cc.Node } = {
        touchWarn: null,
        huWarn: null,
        burWarn: null,
        xiayuWarn: null,
        zimoWarn: null,
        gameBeginWarn: null
    }
    private opreationBtus: { ready_btu: cc.Node, show_btu: cc.Node, bar_btu: cc.Node, touch_btu: cc.Node, hu_btu: cc.Node, selfHu_btu: cc.Node, pass_btu: cc.Node, qingHu_btu: cc.Node, baoHu_btu: cc.Node } = {
        ready_btu: null,
        show_btu: null,
        bar_btu: null,
        touch_btu: null,
        hu_btu: null,
        selfHu_btu: null,
        pass_btu: null,
        qingHu_btu: null,
        baoHu_btu: null
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
    private arrowCard: cc.Node = null;;
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
    getData(): DeskRepository {
        return (Facade.Instance.retrieveProxy(ProxyDefine.Desk) as DeskProxy).repository;
    }
    isMe(index?, playerId?): boolean {
        const { userName } = this.getSelfPlayer();
        if (index !== false) {
            const player = this.getPlayerByIndex(index);
            if (player) {
                return this.getPlayerByIndex(index).playerId === userName
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
        // this.opreationBtus.ready_btu.active = false;
        // this.opreationBtus.show_btu.active = false;
        // this.opreationBtus.bar_btu.active = false;
        // this.opreationBtus.touch_btu.active = false;
        // this.opreationBtus.hu_btu.active = false;
        // this.opreationBtus.selfHu_btu.active = false;
        // this.opreationBtus.pass_btu.active = false;
        // this.opreationBtus.qingHu_btu.active = false;
        // this.opreationBtus.baoHu_btu.active = false;
        for (let i in this.opreationBtus) {
            if (this.opreationBtus[i] instanceof cc.Node) {
                (this.opreationBtus[i] as cc.Node).active = false;
            }
        }
    }
    /**重置桌面事件展示区 */
    reSetDeskEventEffect() {
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
        this.opreationBtus.qingHu_btu = this.opreationArea.getChildByName("qingHu");
        this.opreationBtus.baoHu_btu = this.opreationArea.getChildByName("baoHu");
        this.reSetOpreationBtu();
        this.deskBtus.exit = this.node.getChildByName('exitIcon');
        this.deskBtus.help = this.node.getChildByName('helpIcon');
        this.deskBtus.record = this.node.getChildByName('recordIcon');
        this.deskBtus.set = this.node.getChildByName('setIcon');
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
    updateDeskInfo(): void {
        const { gameRoundNum, totalRound, baseScore, fanTime } = this.getData().deskData.gameSetting;
        this.node.getChildByName("deskInfo").getChildByName("deskInfoStr").getComponent(cc.Label).string = `第${gameRoundNum}/${totalRound}局\n底分:${baseScore} / 翻数:${fanTime}`;
    }
    /**更新自己主牌 */
    updateMyCurCardList(): void {
        this.mainCardListPanel.removeAllChildren();
        this.mainCardList = [];
        const self = this;
        this.getData().gameData.myCards.curCardList.map(item => {
            const card = this.addCardToNode(this.mainCardListPanel, item, "mine", 'setUp', {
                touchEndCallback: function () {
                    const script = this.node.getComponent("CardItemView") as CardItemView;
                    if (script.isPress) {
                        if (script.isAvtive) {

                        } else {
                            self.mainCardList.map(item => {
                                const _view = (item.getComponent("CardItemView") as CardItemView);
                                if (this._id !== _view['_id']) _view.reSetChooseFalse();
                                card && (card.getComponent("CardItemView") as CardItemView).reSetChooseFalse();
                            });
                        }
                    }
                }
            });
            (card.getComponent("CardItemView") as CardItemView).bindLaunch((node) => {
                console.log("出牌", node);
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber
                self.showCardEvent(cardNumber);
            })
            this.mainCardList.push(card);
        });
    }
    /**更新其他玩家的主牌 */
    updateOtherCurCardList(): void {
        this.frontMainCardListPanel.removeAllChildren();
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const playerIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[playerIndex].name === 'p-top') {
                //更新对家主牌
                for (let i = 0; i < partner.partnerCards.curCardCount; i++) {
                    this.addCardToNode(this.frontMainCardListPanel, 0, "front", 'setUp');
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
                this.addCardToNode(touchItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 28) });//.setPosition(cc.v2(-72, 28));
            }
            this.barCard.addChild(touchItem);
        });
        this.touchCard.removeAllChildren();
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
                partner.partnerCards.barCard.forEach(item => {
                    const touchItem = new cc.Node('barItem');
                    const layoutCom = touchItem.addComponent(cc.Layout);
                    layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
                    if (item.barType === 0 || item.barType === 1) {
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(0, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-144, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 28));
                    } else if (item.barType === 2) {
                        //----------------------------------------暗杠,最上面一张需要盖住
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(0, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-144, 0));
                        this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 28));
                    }
                    this.frontBarCard.addChild(touchItem);
                });
                this.frontTouchCard.removeAllChildren();
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
    updateHandCardAndHuCard() {
        const self = this;
        //if (type === 'hand') {
        //先检测本方手牌
        if (this.getData().gameData.myCards.handCard !== 0) {
            this.handCard.removeAllChildren();
            const _handCard = this.addCardToNode(this.handCard, this.getData().gameData.myCards.handCard, "mine", 'setUp', {
                active: true, touchEndCallback: function () {
                    self.mainCardList.map(item => {
                        const _view = (item.getComponent("CardItemView") as CardItemView);
                        _view.reSetChooseFalse();
                    });
                }
            });
            (_handCard.getComponent("CardItemView") as CardItemView).bindLaunch((node) => {
                console.log(node);
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber
                self.showCardEvent(cardNumber);
            });
        } else {
            this.handCard.removeAllChildren();
        }

        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        //当有手牌且无其他命令或者只有出牌命令的时候需要激活牌组
        if ((this.getData().gameData.myCards.handCard !== 0 && eventName.length === 0) || eventName.indexOf('show') !== -1) {
            //全部牌都可以出
            self.mainCardList.map(item => ((item.getComponent("CardItemView") as CardItemView).getComponent("CardItemView") as CardItemView).isAvtive = true);
        } else {
            //全部牌都不可以出
            self.mainCardList.map(item => ((item.getComponent("CardItemView") as CardItemView).getComponent("CardItemView") as CardItemView).isAvtive = false);

        }


        //再检测对家手牌
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                if (partner.partnerCards.isHandCard) {
                    this.addCardToNode(this.frontHandCard, 0, "front", 'setUp');
                } else {
                    this.frontHandCard.removeAllChildren();
                }
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
            }
        });
        //} else if (type === 'hu') {
        //先检测本家胡牌
        if (this.getData().gameData.myCards.hadHuCard !== 0) {
            this.huCard = this.addCardToNode(this.huCard, this.getData().gameData.myCards.hadHuCard, "mine", 'fall');
        } else {
            this.huCard.removeAllChildren();
        }
        //再检测对家胡牌
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                const _hadHuCard = this.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.hadHuCard;
                if (_hadHuCard !== 0) {
                    this.addCardToNode(this.frontHuCard, _hadHuCard, "front", 'fall');
                } else {
                    this.frontHuCard.removeAllChildren();
                }
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
            }
        });
        //}
    }
    /**更新方向盘 */
    updatedDeskAiming() {
        this.positionNode.forEach(node => node.active = false);
        this.positionNode[this.getData().gameData.positionIndex].active = true;
    }
    /**更新操作按钮组 */
    updateMyOperationBtu() {
        this.reSetOpreationBtu();
        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        eventName.forEach(eventName => {
            switch (eventName) {
                case 'touch': this.opreationBtus.touch_btu.active = true; break;
                case 'bar': this.opreationBtus.bar_btu.active = true; break;
                case 'hu': this.opreationBtus.hu_btu.active = true; break;
                case 'qingHu': this.opreationBtus.qingHu_btu.active = true; break;
                case 'ting': this.opreationBtus.baoHu_btu.active = true; break;
                case 'show': this.opreationBtus.show_btu.active = true; break;
                case 'ready': this.opreationBtus.ready_btu.active = true; break;
            }
        });
        if (eventName.length !== 0 && eventName.indexOf('show') === -1 && eventName.indexOf('ready') === -1) {
            this.opreationBtus.pass_btu.active = true;
        }
    }
    /**更新其他玩家事件提醒 */
    updateEventWeak() {
        this.reSetDeskEventEffect();
        switch (this.getData().gameData.eventData.gameEventData.deskGameEvent.eventName) {
            case 'bar': this.gameEventWarn.burWarn.active = true;
            case 'touch': this.gameEventWarn.touchWarn.active = true;
            case 'hu': this.gameEventWarn.huWarn.active = true;
            case 'xiayu': this.gameEventWarn.xiayuWarn.active = true;
            case 'guafeng': this.gameEventWarn.xiayuWarn.active = true;//刮风，图片待换
            case 'zimo': this.gameEventWarn.zimoWarn.active = true;
            case 'gameBegin': this.gameEventWarn.gameBeginWarn.active = true;
            //case 'gameEnd'://游戏结束
        }
    }
    /**更新outCard */
    updateOutCard(playerIndex) {
        if (this.arrowCard) (this.arrowCard.getComponent("CardItemView") as CardItemView).setArrows(false);
        let _card: cc.Node;
        if (this.isMe(playerIndex)) {
            _card = this.addCardToNode(this.outCardList, this.getData().gameData.myCards.outCardList[this.getData().gameData.myCards.outCardList.length - 1], "mine", "fall")
            _card.setPosition(cc.v2(0, 0));
            _card.setScale(0.6, 0.6);

        } else {
            this.getData().gameData.partnerCardsList.forEach(partner => {
                if (this.positionNode[playerIndex].name === 'p-top') {
                    //更新对家打出牌
                    _card = this.addCardToNode(this.frontOutCardList, partner.partnerCards.outCardList[partner.partnerCards.outCardList.length - 1], "front", "fall")
                    _card.setPosition(cc.v2(0, 0));
                    _card.setScale(0.6, 0.6);
                } else if (this.positionNode[playerIndex].name === 'p-left') {
                    //更新左方打出牌
                } else if (this.positionNode[playerIndex].name === 'p-right') {
                    //更新右方打出牌
                }
            });
        }
        this.arrowCard = _card;
        (_card.getComponent("CardItemView") as CardItemView).setArrows(true);
    }
    /**更新牌组且执行事件 */
    updateChooseCardsAndHandler(launch: (card: number) => void) {
        const cardsChoose = this.getData().gameData.myCards.cardsChoose;
        if (cardsChoose.length > 1) {
            this.cardChooseAlert.active = true;
            this.cardChooseAlert.removeAllChildren();
            const self = this;
            cardsChoose.map(item => {
                const card = this.addCardToNode(this.cardChooseAlert, item, "mine", 'setUp', {
                    purAddNode: node => { node.setScale(0.7, 0.7) },
                    touchEndCallback: function () {
                        //const script = this.node.getComponent("CardItemView") as CardItemView;
                        launch(item);
                        this.cardChooseAlert.active = false;
                    }
                });
                this.mainCardList.push(card);
            });
        } else {
            launch(cardsChoose[0]);
        }
    }
    /**控制自己的操作按钮显示 */
    initMyOpreationBtuShow(): void {
        this.reSetOpreationBtu();
        //"show" | "touch" | "bar" | "hu" | "qingHu" | "ready" | "setFace" | "ting"
        this.getData().gameData.eventData.gameEventData.myGameEvent.eventName.forEach(item => {
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
                case 'qingHu':
                    this.opreationBtus.qingHu_btu.active = true;
                    break;
                case 'ting':
                    this.opreationBtus.baoHu_btu.active = true;
                    break;
                case 'ready':
                    this.opreationBtus.ready_btu.active = true;
                    break;
            }
        });
        // if (gameData.eventData.gameEventData.myGameEvent.eventName.indexOf('show') === -1 && gameData.eventData.gameEventData.myGameEvent.eventName.indexOf('ready') === -1) {
        //     this.opreationBtus.pass_btu.active = true;
        // }
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
            if (item.barType === 0 || item.barType === 1) {
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(0, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-72, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-144, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-72, 28));
            } else if (item.barType === 2) {
                //----------------------------------------暗杠,最上面一张需要盖住
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(0, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-72, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-144, 0));
                this.addCardToNode(touchItem, item.barCard, "mine", "fall").setPosition(cc.v2(-72, 28));
            }
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
        if (gameData.myCards.handCard !== 0) {
            this.handCard = this.addCardToNode(this.huCard, gameData.myCards.handCard, "mine", 'setUp', {
                active: true, touchEndCallback: function () {
                    self.mainCardList.map(item => {
                        const _view = (item.getComponent("CardItemView") as CardItemView);
                        _view.reSetChooseFalse();
                    });
                }
            });
            (this.handCard.getComponent("CardItemView") as CardItemView).bindLaunch((node) => {
                console.log(node);
            });
        } else {
            this.handCard = null;
        }

        //胡牌
        if (gameData.myCards.hadHuCard !== 0) this.addCardToNode(this.huCard, gameData.myCards.hadHuCard, "mine", 'fall');

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
                if (item.barType === 0 || item.barType === 1) {
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(0, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-144, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 28));
                } else if (item.barType === 2) {
                    //----------------------------------------暗杠,最上面一张需要盖住
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(0, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-144, 0));
                    this.addCardToNode(touchItem, item.barCard, "front", "fall").setPosition(cc.v2(-72, 28));
                }
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
            if (partnerCards.partnerCards.hadHuCard !== 0) this.addCardToNode(this.frontHuCard, partnerCards.partnerCards.hadHuCard, "front", 'fall');

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

    start() {

    }

    // update (dt) {}
}
