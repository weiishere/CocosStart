// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import { GameData, DeskData, PlayerInfo, DeskRepository, PartnerCard } from "../CDMJDeskRepository"
import ViewComponent from "../../Base/ViewComponent";
import CardItemView, { ModType, PositionType, FallShowStatus } from "../../Component/DdYiMahjong/CardItemView"
import Facade from "../../../Framework/care/Facade";
import { CDMJProxyDefine } from "../CDMJConst/CDMJProxyDefine";
import { CDMJDeskProxy } from "../CDMJDeskProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { LoginData } from "../../GameData/LoginData";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { CDMJCommandDefine } from "../CDMJConst/CDMJCommandDefine";
import { DeskPanelViewEventDefine } from "../../GameConst/Event/DeskPanelViewEventDefine";
import { MsgObj } from "../../Component/DdYiMahjong/ChatBox";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import myhelper from "./CDMJDeskPanelViewHelper";

@ccclass
export default class CDMJDeskPanelView extends ViewComponent {

    @property(cc.Prefab)
    cardItem: cc.Prefab = null;

    @property(cc.Node)
    maskWrap: cc.Node = null;


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

    private leftMainCardListPanel: cc.Node;
    private leftTouchCard: cc.Node;
    private leftBarCard: cc.Node;
    private leftHuCard: cc.Node;
    private leftOutCardList: cc.Node;
    private leftMainCardList: Array<cc.Node> = [];
    private leftHandCard: cc.Node = null;

    private rightMainCardListPanel: cc.Node;
    private rightTouchCard: cc.Node;
    private rightBarCard: cc.Node;
    private rightHuCard: cc.Node;
    private rightOutCardList: cc.Node;
    private rightMainCardList: Array<cc.Node> = [];
    private rightHandCard: cc.Node = null;

    private positionNode: Array<cc.Node>;
    private opreationArea: cc.Node;
    private gameEventView: cc.Node;
    private deskOpreationIconWrap: cc.Node;
    private myShowCardWrap: cc.Node;
    private frontShowCardWrap: cc.Node;
    private leftShowCardWrap: cc.Node;
    private rightShowCardWrap: cc.Node;
    private showOutCard: cc.Node;
    private charNotice: cc.Node;
    private timer: number;
    private timer2: number;
    private timer3: number;
    private showCardEndPosition: { x: number, y: number }
    private scheduleCallBack: () => void;
    private cardChooseAlert: cc.Node;
    private isAllowShowCard = true;//是否允许出牌
    private gameEventWarn: { touchWarn: cc.Node, huWarn: cc.Node, burWarn: cc.Node, xiayuWarn: cc.Node, guafengWarn: cc.Node, zimoWarn: cc.Node, gameBeginWarn: cc.Node } = {
        touchWarn: null,
        huWarn: null,
        burWarn: null,
        xiayuWarn: null,
        guafengWarn: null,
        zimoWarn: null,
        gameBeginWarn: null
    }
    private opreationBtus: { ready_btu: cc.Node, show_btu: cc.Node, bar_btu: cc.Node, touch_btu: cc.Node, hu_btu: cc.Node, selfHu_btu: cc.Node, pass_btu: cc.Node, baoQingHu_btu: cc.Node, qingHu_btu: cc.Node, baoHu_btu: cc.Node, setFaceBtus: cc.Node } = {
        ready_btu: null,
        show_btu: null,
        bar_btu: null,
        touch_btu: null,
        hu_btu: null,
        selfHu_btu: null,
        pass_btu: null,
        baoQingHu_btu: null,
        qingHu_btu: null,
        baoHu_btu: null,
        setFaceBtus: null
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
        return (<LocalCacheDataProxy>Facade.Instance.retrieveProxy(CDMJProxyDefine.LocalCacheData)).getLoginData();
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
        return (Facade.Instance.retrieveProxy(CDMJProxyDefine.CDMJDesk) as CDMJDeskProxy).repository;
    }
    isMe(index?, playerId?): boolean {
        const { userName } = this.getSelfPlayer();
        if (index !== undefined && index !== false) {
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
                const _node = (this.opreationBtus[i] as cc.Node);
                _node.active = false;
                _node.setPosition(cc.v3(0, 0));
                _node.opacity = 0;
                _node.scale = 1;
            }
        }
        //停止定章膨胀提示
        this.opreationBtus.setFaceBtus.children.forEach(node => node.stopAllActions());
    }
    /**重置桌面事件展示区 */
    private reSetDeskEventEffect() {
        for (let i in this.gameEventWarn) {
            if (this.gameEventWarn[i] instanceof cc.Node) {
                (this.gameEventWarn[i] as cc.Node).active = false;
                (this.gameEventWarn[i] as cc.Node).opacity = 0;
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
        option.scale && (card.scale = option.scale);
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
        const leftJobLayout = this.node.getChildByName("leftJobNode").getChildByName("jobLayout");//左方工作区
        const rightJobLayout = this.node.getChildByName("rightJobNode").getChildByName("jobLayout");//右方工作区
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
        this.myShowCardWrap = this.node.getChildByName("showCard");
        this.frontShowCardWrap = this.node.getChildByName("frontJobNode").getChildByName("showCard");
        this.leftShowCardWrap = this.node.getChildByName("leftJobNode").getChildByName("showCard");
        this.rightShowCardWrap = this.node.getChildByName("rightJobNode").getChildByName("showCard");
        //#endregionthis.node.getChildByName("myJobNode")

        //#region 前方玩家
        this.frontMainCardListPanel = frontJobLayout.getChildByName("mainCardListPanel");
        this.frontHandCard = frontJobLayout.getChildByName("handCard");
        this.frontTouchCard = frontJobLayout.getChildByName("touchCard");
        this.frontBarCard = frontJobLayout.getChildByName("barCard");
        this.frontHuCard = frontJobLayout.getChildByName("huCard");
        this.frontOutCardList = this.node.getChildByName("frontJobNode").getChildByName("outCardList");
        //#endregion

        //#region 左方玩家
        this.leftMainCardListPanel = leftJobLayout.getChildByName("mainCardListPanel");
        this.leftHandCard = leftJobLayout.getChildByName("handCard");
        this.leftTouchCard = leftJobLayout.getChildByName("touchCard");
        this.leftBarCard = leftJobLayout.getChildByName("barCard");
        this.leftHuCard = leftJobLayout.getChildByName("huCard");
        this.leftOutCardList = this.node.getChildByName("leftJobNode").getChildByName("outCardList");
        //#endregion

        //#region 右方玩家
        this.rightMainCardListPanel = rightJobLayout.getChildByName("mainCardListPanel");
        this.rightHandCard = rightJobLayout.getChildByName("handCard");
        this.rightTouchCard = rightJobLayout.getChildByName("touchCard");
        this.rightBarCard = rightJobLayout.getChildByName("barCard");
        this.rightHuCard = rightJobLayout.getChildByName("huCard");
        this.rightOutCardList = this.node.getChildByName("rightJobNode").getChildByName("outCardList");
        //#endregion

        //#region 玩家操作按钮节点
        this.opreationBtus.ready_btu = this.opreationArea.getChildByName("ready");
        this.opreationBtus.show_btu = this.node.getChildByName("show");
        this.opreationBtus.bar_btu = this.opreationArea.getChildByName("bar");
        this.opreationBtus.touch_btu = this.opreationArea.getChildByName("touch");
        this.opreationBtus.hu_btu = this.opreationArea.getChildByName("hu");
        this.opreationBtus.selfHu_btu = this.opreationArea.getChildByName("selfHu");
        this.opreationBtus.pass_btu = this.opreationArea.getChildByName("pass");
        this.opreationBtus.qingHu_btu = this.opreationArea.getChildByName("qingHu");
        this.opreationBtus.baoHu_btu = this.opreationArea.getChildByName("baoHu");
        this.opreationBtus.baoQingHu_btu = this.opreationArea.getChildByName("baoQingHu");
        this.opreationBtus.setFaceBtus = this.opreationArea.getChildByName("setFaceBtus");

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
        this.charNotice = this.node.getChildByName("desk").getChildByName("charNotice");
        this.charNotice.opacity = 0;
        //#region 其他玩家事件提醒
        this.gameEventWarn.touchWarn = this.gameEventView.getChildByName("peng_2x");
        this.gameEventWarn.huWarn = this.gameEventView.getChildByName("hu_2x");
        this.gameEventWarn.burWarn = this.gameEventView.getChildByName("gang_2x");
        this.gameEventWarn.xiayuWarn = this.gameEventView.getChildByName("xiayu_2x");
        this.gameEventWarn.guafengWarn = this.gameEventView.getChildByName("gang_2x");
        this.gameEventWarn.zimoWarn = this.gameEventView.getChildByName("zimo_2x");
        this.gameEventWarn.gameBeginWarn = this.gameEventView.getChildByName("gameBegin");
        //#endregion

        this.opreationBtus.setFaceBtus.children.forEach(node => {
            node.on(cc.Node.EventType.TOUCH_START, (eventData) => {
                node.dispatchEvent(new cc.Event.EventCustom("gameOpreation", true));
            }, this);
        });
        for (let i in this.opreationBtus) {
            if (this.opreationBtus[i] instanceof cc.Node && this.opreationBtus[i].name !== 'setFaceBtus') {
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

        this.dispatchCustomEvent(DeskPanelViewEventDefine.CDMJDeskPanelViewOnLoadComplate, null);
        //预加载表情
        for (let i = 1; i <= 25; i++) {
            cc.loader.loadRes(`textures/desk/face/face(${i})`, cc.Texture2D, (err, item) => { });
        }
    }
    bindEvent(): void { }
    /**绑定游戏操作事件（杠碰胡等） */
    bindGameOpreationEvent(callBack: (node: cc.Node, correlationInfoData) => void): void {
        this.opreationArea.on('gameOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.95, position: cc.v2(0, -5) }).call(() => {
                //console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, this.getData().gameData.eventData.gameEventData.myGameEvent.correlationInfoData);
            }).to(0.1, { scale: 1, position: cc.v2(0, 0) }).start();
        }, this);
    }
    /**绑定桌面操作事件（设置、记录按钮等） */
    bindDskOpreationEvent(callBack: (node: cc.Node) => void): void {
        this.deskOpreationIconWrap.on('deskOpreation', (eventData) => {
            cc.tween(eventData.target).to(0.1, { scale: 0.9 }).call(() => {
                //console.log(`按下${eventData.target.name}`, eventData.target);
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
            this.positionNode = [this.deskAiming.left, this.deskAiming.top, this.deskAiming.right, this.deskAiming.bottom]
        }
        //positionNode[gameData.positionIndex].active = true;
    }
    /**更新用户信息 */
    updatePlayerHeadView(): void {
        //先更新转盘
        this.initDeskAiming(this.getSelfPlayer().userName);
        const myHeadNode = this.node.getChildByName("headList").getChildByName("myHead"); //myHeadNode.active = false;
        const frontHeadNode = this.node.getChildByName("headList").getChildByName("frontHead"); frontHeadNode.active = false;
        const leftHeadNode = this.node.getChildByName("headList").getChildByName("leftHead"); leftHeadNode.active = false;
        const rightHeadNode = this.node.getChildByName("headList").getChildByName("rightHead"); rightHeadNode.active = false;
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
                    leftHeadNode.active = true;
                    headWrap = leftHeadNode;
                } else if (self.positionNode[player.gameIndex].name === 'p-right') {
                    //更新右方头像信息
                    rightHeadNode.active = true;
                    headWrap = rightHeadNode;
                }
            }
            if (!headWrap) return;
            headWrap.getChildByName("nickName").getComponent(cc.Label).string = player.playerName;//昵称
            headWrap.getChildByName("uid").getComponent(cc.Label).string = player.playerId;//ID
            headWrap.getChildByName("goldView").getChildByName("myGlod").getComponent(cc.Label).string = player.playerGold.toFixed(2);//金币
            cc.loader.load(player.playerHeadImg, (error, item) => {
                if (error) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '玩家头像获取失败' }, '');
                } else {
                    headWrap.getChildByName("head").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item);
                }
            });
        });
    }
    /**更新自己主牌 */
    updateMyCurCardList(effectDone?: () => void): void {
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
                //抽出事件
                cardScript.bindExtractionUp((cardNumber: number) => {
                    return myhelper.bindExtractionUpHelper.bind(this)(cardNumber);
                });
            }
            cardScript.bindLaunch((node: cc.Node, position) => {
                //console.log("出牌", node);
                if (this.isAllowShowCard === false) {
                    node.setPosition(cc.v3(0, 0, 0));
                    return;
                }
                this.showOutCard = node;
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber;
                //node.active = false;//隐藏出牌，避免观感上的卡顿
                this.showCardEndPosition = { x: position.x, y: position.y };
                this.showCardAlert(undefined, cardNumber);//意思是不管返回了，放手就出s牌
                self.showCardEvent(cardNumber);
            })
            this.mainCardList.push(card);
        });
        if (effectDone) {
            this.reSetOpreationBtu();
            this.mainCardListPanel.children.forEach(item => {
                item.setPosition(0, 50);
                item.opacity = 0;
                item.scale = 0.8;
                (item.getComponent("CardItemView") as CardItemView).setMainHide(false);
            });
            let index = 0;
            this.schedule(() => {
                const card = this.mainCardListPanel.children[index];
                cc.tween(card).to(0.15, { position: cc.v3(0, -10), opacity: 255, scale: 1 }, { easing: 'easeBackInOut' }).to(0.05, { position: cc.v3(0, 0) }).call(() => {
                    (card.getComponent("CardItemView") as CardItemView).setMainHide(true);
                }).start();
                index++;
                if (index === this.mainCardListPanel.children.length - 1) { effectDone(); }
            }, 0.2, this.mainCardListPanel.children.length - 1)
        }
    }
    /**更新其他玩家的主牌 */
    updateOtherCurCardList(): void {

        this.getData().gameData.partnerCardsList.forEach(partner => {
            const playerIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[playerIndex].name === 'p-top') {
                //更新对家主牌
                this.frontMainCardListPanel.removeAllChildren();
                for (let i = 0, l = partner.partnerCards.curCardList.length; i < l; i++) {
                    this.addCardToNode(this.frontMainCardListPanel, this.isSuper ? partner.partnerCards.curCardList[i] : 0, "front", 'setUp', { scale: 0.5 });
                }
            } else if (this.positionNode[playerIndex].name === 'p-left') {
                //更新左方主牌
                this.leftMainCardListPanel.removeAllChildren();
                for (let i = 0, l = partner.partnerCards.curCardList.length; i < l; i++) {
                    this.addCardToNode(this.leftMainCardListPanel, this.isSuper ? partner.partnerCards.curCardList[i] : 0, "left", 'setUp');
                }
            } else if (this.positionNode[playerIndex].name === 'p-right') {
                //更新右方主牌
                this.rightMainCardListPanel.removeAllChildren();
                for (let i = 0, l = partner.partnerCards.curCardList.length; i < l; i++) {
                    this.addCardToNode(this.rightMainCardListPanel, this.isSuper ? partner.partnerCards.curCardList[i] : 0, "right", 'setUp');
                }
            }
        });
    }
    /**更新杠碰牌 */
    updateMyBarAndTouchCard(): void {
        //先更新杠/碰


        const barItems = [];
        this.getData().gameData.myCards.barCard.map(item => {
            const barItem = new cc.Node('barItem');
            const layoutCom = barItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (item.barType === 0 || item.barType === 1) {
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(0, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 0) });//.setPosition(cc.v2(-72, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-144, 0) });//.setPosition(cc.v2(-144, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 28) });//.setPosition(cc.v2(-72, 28));
            } else if (item.barType === 2) {
                //----------------------------------------暗杠,最上面一张需要盖住
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(0, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 0) });//.setPosition(cc.v2(-72, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-144, 0) });//.setPosition(cc.v2(-144, 0));
                this.addCardToNode(barItem, item.barCard, "mine", "fall", { position: cc.v2(-72, 29), fallShowStatus: 'hide' });//.setPosition(cc.v2(-72, 28));
            }
            //this.barCard.addChild(barItem);
            barItems.push(barItem);
        });
        this.barCard.removeAllChildren();
        this.barCard.width = 0;
        barItems.forEach(n => this.barCard.addChild(n));



        const touchItems = [];
        this.getData().gameData.myCards.touchCard.map(item => {
            const touchItem = new cc.Node('touchItem');
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(-36, 0) });//.setPosition(cc.v2(-36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(36, 0) });//.setPosition(cc.v2(36, 0));
            this.addCardToNode(touchItem, item, "mine", "fall", { position: cc.v2(0, 28) });//.setPosition(cc.v2(0, 28));
            //this.touchCard.addChild(touchItem);
            touchItems.push(touchItem);
        });
        this.touchCard.removeAllChildren();
        this.touchCard.width = 0;
        touchItems.forEach(n => this.touchCard.addChild(n));

        //更新其他玩家杠/碰
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                this.updateMyBarAndTouchCardHelper(partner, this.frontBarCard, this.frontTouchCard, 'front');
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
                this.updateMyBarAndTouchCardHelper(partner, this.leftBarCard, this.leftTouchCard, 'left');
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
                this.updateMyBarAndTouchCardHelper(partner, this.rightBarCard, this.rightTouchCard, 'right');
            }
        });

    }
    /**-----更新杠、碰牌组辅助方法 */
    private updateMyBarAndTouchCardHelper(partner: PartnerCard, playerBarCard: cc.Node, playerTouchCard: cc.Node, position: PositionType) {

        playerBarCard.width = 0;
        playerBarCard.height = 0;
        const barItems = [];
        partner.partnerCards.barCard.forEach(item => {
            const barItem = new cc.Node('barItem');
            const layoutCom = barItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (position === 'front') {
                if (item.barType === 0 || item.barType === 1) {
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-144, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 28) });
                } else if (item.barType === 2) {
                    //----------------------------------------暗杠,最上面一张需要盖住
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-144, 0) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 29), fallShowStatus: 'hide' });
                }
            } else {
                if (item.barType === 0 || item.barType === 1) {
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 90) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 60) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 30) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 74) });
                } else if (item.barType === 2) {
                    //----------------------------------------暗杠,最上面一张需要盖住
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 90) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 60) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 30) });
                    this.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 74), fallShowStatus: 'hide' });
                }
            }
            barItems.push(barItem);
        });
        playerBarCard.removeAllChildren();
        barItems.forEach(n => playerBarCard.addChild(n));

        playerTouchCard.width = 0;
        playerTouchCard.height = 0;
        const touchItems = [];
        partner.partnerCards.touchCard.forEach(item => {
            const touchItem = new cc.Node('touchItem');
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (position === 'front') {
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(-36, 0) });//.setPosition(cc.v2(-36, 0));
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(36, 0) });//.setPosition(cc.v2(36, 0));
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 28) });//.setPosition(cc.v2(0, 28));
            } else {
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 64) });//.setPosition(cc.v2(-36, 0));
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 32) });//.setPosition(cc.v2(36, 0));
                this.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 57) });//.setPosition(cc.v2(0, 28));
            }
            touchItems.push(touchItem);
            //playerTouchCard.addChild(touchItem);
        });
        playerTouchCard.removeAllChildren();
        touchItems.forEach(n => playerTouchCard.addChild(n));
    }
    /**更新用户手牌/胡牌 */
    updateHandCardAndHuCard(): void {
        const self = this;
        //if (type === 'hand') {
        //先检测本方手牌
        const disableCard = this.getData().gameData.myCards.disableCard;
        this.handCard.removeAllChildren();
        this.handCard.width = 0;
        //this.handCard.height = 0;
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
            _card.bindLaunch((node, position) => {
                this.showCardEndPosition = { x: position.x, y: position.y };
                const cardNumber = ((node as cc.Node).getComponent('CardItemView') as CardItemView).cardNumber;
                this.showCardAlert(undefined, cardNumber);//意思是不管返回了，放手就出牌
                self.showCardEvent(cardNumber);
            });
            _handCard.opacity = 0;
            _handCard.setPosition(0, 50);
            _handCard.setRotation(-60);
            _card.setStress(true);
            this.scheduleOnce(() => {
                //设置下落动作
                cc.tween(_handCard).to(0.2, { opacity: 255, position: cc.v3(0, 0), rotation: 0 }).start();
            }, 0.5);

            //判断手牌是否可出
            // console.log(disableCard);
            // console.log('disableCard=========', disableCard.some(item => item === _card.cardNumber));
            if (disableCard.some(item => item === _card.cardNumber)) _card.setDisable();

            //配置可胡牌
            const _mayHuCard = self.getData().gameData.myCards.mayHuCards.find(item => item.putCard === _card.cardNumber);
            if (_mayHuCard) _card.setHuCard(_mayHuCard);
        }

        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        //当有手牌且无其他命令或者只有出牌命令的时候需要激活牌组

        if ((this.getData().gameData.myCards.handCard !== 0 && eventName.length === 0) || eventName.indexOf('show') !== -1) {
            if (this.getData().gameData.myCards.status.isBaoHu) {
                //报胡不能出牌
                self.mainCardList.map(item => (item.getComponent("CardItemView") as CardItemView).setDisable());
            } else {
                //全部牌都可以出，并配置可胡牌
                self.mainCardList.map(item => {
                    const _card = (item.getComponent("CardItemView") as CardItemView); _card.isActive = true;
                    const _mayHuCard = self.getData().gameData.myCards.mayHuCards.find(item => item.putCard === _card.cardNumber);
                    if (_mayHuCard) _card.setHuCard(_mayHuCard);
                });
            }
        } else if (this.getData().gameData.myCards.handCard === 0 && eventName.length === 1 && eventName.indexOf('touch') !== -1) {
            //刚刚碰了，所以没有摸牌

        }
        //console.log('xzddS2CDoNextOperation.nextStep.datas=====2222', disableCard);

        if (eventName.indexOf('show') !== -1) {
            if (this.getData().gameData.myCards.disableCard.length !== 0) {
                disableCard.forEach(item => {
                    self.mainCardList.forEach(card => {
                        const _card = card.getComponent("CardItemView") as CardItemView;
                        _card.isActive = true;
                        if (_card.cardNumber === item) _card.setDisable();
                    })
                })
            } else {
                self.mainCardList.forEach(card => {
                    const _card = card.getComponent("CardItemView") as CardItemView;
                    _card.isActive = true;
                })
            }
        }

        // else {
        //     //全部牌都不可以出
        //     self.mainCardList.map(item => (item.getComponent("CardItemView") as CardItemView).isActive = false);
        // }

        //先检测本家胡牌
        this.huCard.removeAllChildren();
        this.huCard.width = 0;
        this.huCard.height = 0;
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
                this.frontHandCard.height = 0;
                if (partner.partnerCards.isHandCard) {
                    this.addCardToNode(this.frontHandCard, this.isSuper ? partner.partnerCards.handCard : 0, "front", 'setUp', {
                        purAddNode: node => {
                            (node.getComponent("CardItemView") as CardItemView).setStress(false);//选中
                        }, scale: 0.5
                    });
                }
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
                this.leftHandCard.removeAllChildren();
                this.leftHandCard.width = 0;
                this.leftHandCard.height = 0;
                if (partner.partnerCards.isHandCard) {
                    this.addCardToNode(this.leftHandCard, this.isSuper ? partner.partnerCards.handCard : 0, "left", 'setUp', {
                        purAddNode: node => {
                            (node.getComponent("CardItemView") as CardItemView).setStress(false);//选中
                        }
                    });
                }
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
                this.rightHandCard.removeAllChildren();
                this.rightHandCard.width = 0;
                this.rightHandCard.height = 0;
                if (partner.partnerCards.isHandCard) {
                    //这里还是使用“left”，直接把节点选中即可完成效果
                    this.addCardToNode(this.rightHandCard, this.isSuper ? partner.partnerCards.handCard : 0, "right", 'setUp', {
                        purAddNode: node => {
                            (node.getComponent("CardItemView") as CardItemView).setStress(false);//选中
                        }
                    });
                }
            }
        });
        //再检测对家胡牌/听牌
        this.getData().gameData.partnerCardsList.forEach(partner => {
            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家手牌
                this.updateHandCardAndHuCardHelper(partner, this.frontHuCard, this.node.getChildByName("frontJobNode").getChildByName("ting"), 'front');
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方手牌
                this.updateHandCardAndHuCardHelper(partner, this.leftHuCard, this.node.getChildByName("leftJobNode").getChildByName("ting"), 'left');
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方手牌
                this.updateHandCardAndHuCardHelper(partner, this.rightHuCard, this.node.getChildByName("rightJobNode").getChildByName("ting"), 'right');
            }
        });
        //更新剩余牌数
        const remainCardNum = this.node.getChildByName("remainWrap").getChildByName("remainCard").getComponent(cc.Label);
        remainCardNum.string = this.getData().gameData.remainCard + '';
        //}
    }
    /**-----辅助方法 */
    private updateHandCardAndHuCardHelper(partner: PartnerCard, playerHuCard: cc.Node, tingNode: cc.Node, position: PositionType): void {
        const _hadHuCard = this.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.hadHuCard;
        playerHuCard.removeAllChildren();
        playerHuCard.width = 0;
        playerHuCard.height = 0;
        if (_hadHuCard !== 0) {
            this.addCardToNode(playerHuCard, _hadHuCard, position, 'fall');
        }
        //对家是否听牌
        const status = this.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.status;
        if (status.isBaoHu) {
            tingNode.active = false;
        }
    }
    /**更新方向盘 */
    updatedDeskAiming(): void {
        this.positionNode.forEach(node => node.active = false);
        this.positionNode[this.getData().gameData.positionIndex].active = true;
    }
    /**更新操作按钮组 */
    updateMyOperationBtu(param?: any): void {
        this.reSetOpreationBtu();
        this.timer2 && window.clearTimeout(this.timer2);
        const eventName = this.getData().gameData.eventData.gameEventData.myGameEvent.eventName;
        console.log('eventName', eventName)
        this.isAllowShowCard = true;
        eventName.forEach(item => {
            switch (item) {
                case 'touch': this.opreationBtus.touch_btu.active = true; break;
                case 'bar': this.opreationBtus.bar_btu.active = true; break;
                case 'hu': this.opreationBtus.hu_btu.active = true; break;
                //case 'qingHu': this.opreationBtus.qingHu_btu.active = true; break;
                case 'ting': this.opreationBtus.baoHu_btu.active = true; break;
                case 'show': this.opreationBtus.show_btu.active = true; break;
                case 'ready': this.opreationBtus.ready_btu.active = true; break;
                case 'setFace':
                    this.opreationBtus.setFaceBtus.active = true;
                    //0：万 1： 筒 2： 条
                    let setFaceNodeBut: cc.Node;
                    if (param === 0) {
                        setFaceNodeBut = this.opreationBtus.setFaceBtus.getChildByName('ding-wan');
                    } else if (param === 1) {
                        setFaceNodeBut = this.opreationBtus.setFaceBtus.getChildByName('ding-tong');
                    } else if (param === 2) {
                        setFaceNodeBut = this.opreationBtus.setFaceBtus.getChildByName('ding-tiao');
                    }
                    const action = cc.repeatForever(cc.sequence(cc.scaleTo(0.2, 1.05), cc.scaleTo(0.2, 0.95), cc.callFunc(() => { })));
                    setFaceNodeBut.runAction(action);
                    break;
                //case 'tingQingHu': this.opreationBtus.baoQingHu_btu.active = true; break;
            }
        });
        if (eventName.length !== 0 && eventName.indexOf('show') === -1 && eventName.indexOf('ready') === -1 && eventName.indexOf('setFace') === -1) {
            this.opreationBtus.pass_btu.active = true;
        }
        const activeBtu = this.opreationArea.children.filter(item => { if (item.active) { item.setPosition(0, -50); item.opacity = 0; return true; } else { return false; } });
        if (activeBtu.length !== 0) {
            this.isAllowShowCard = false;
            window.clearTimeout(this.timer2);
            this.timer2 = window.setTimeout(() => {
                let index = 0;
                this.schedule(() => {
                    cc.tween(activeBtu[index]).to(0.2, { position: cc.v3(0, 15), opacity: 255 }, { easing: 'easeBackInOut' }).to(0.08, { position: cc.v3(0, 0) }).call(() => { }).start();
                    index++;
                }, 0.2, activeBtu.length - 1);
            }, 300);

        }
    }
    /**更新其他玩家事件提醒 */
    updateEventWran(isMe: boolean, gameIndex: number, effectDone: () => void) {
        this.reSetDeskEventEffect();
        let effectNode: cc.Node;
        const _eventName = this.getData().gameData.eventData.gameEventData.deskGameEvent.eventName;
        switch (_eventName) {
            case 'bar': effectNode = this.gameEventWarn.burWarn; break;
            case 'touch': effectNode = this.gameEventWarn.touchWarn; break;
            case 'hu': effectNode = this.gameEventWarn.huWarn; break;
            case 'xiayu': effectNode = this.gameEventWarn.xiayuWarn; break;//下雨
            case 'guafeng': effectNode = this.gameEventWarn.guafengWarn; break;//刮风，图片待换
            case 'zimo': effectNode = this.gameEventWarn.zimoWarn; break;
            case 'gameBegin': effectNode = this.gameEventWarn.gameBeginWarn; break;
            case 'gameEnd': break;
            case 'ting': break;
            //case 'gameEnd'://游戏结束
        }
        let po = 0; let pox = 0;
        if (isMe !== undefined) {
            if (isMe) {
                po = -250;
            } else {
                if (gameIndex !== -1) {
                    if (this.positionNode[gameIndex].name === 'p-top') {
                        po = 250;
                    } else if (this.positionNode[gameIndex].name === 'p-left') {
                        pox = -400;
                    } else if (this.positionNode[gameIndex].name === 'p-right') {
                        pox = 400;
                    }
                }
            }
            //po = isMe ? -250 : 250;
        }
        effectNode.active = true;
        effectNode.opacity = 100;
        effectNode.setScale(0.3);
        effectNode.position = cc.v3(pox, po);
        cc.tween(effectNode)
            .to(0.2, { position: cc.v3(0, 0), opacity: 255, scale: 1 }).delay(1)
            .to(0.2, { position: cc.v3(pox, po), opacity: 0, scale: 0.3 }).call(() => {
                effectNode.setPosition(0, 0);
                this.reSetDeskEventEffect();
                effectDone();
            }).start();
        // effectNode && this.effectAction(effectNode, 'show', { moveBy: { x: 0, y: 0 } }, (node) => {
        //     node.position = cc.v3(pox, po);
        //     cc.tween(node)
        //         .to(0.2, { position: cc.v3(0, 0), opacity: 255 }).delay(1)
        //         .to(0.2, { position: cc.v3(pox, po), opacity: 0, scale: 0.3 }).call(() => {
        //             node.setPosition(0, 0);
        //             this.reSetDeskEventEffect();
        //             effectDone();
        //         }).start();
        //     // this.scheduleOnce(() => {

        //     //     cc.tween(node).to(0.2, { position: cc.v3(pox, po), opacity: 0, scale: 0.3 }).call(() => {
        //     //         node.setPosition(0, 0);
        //     //         this.reSetDeskEventEffect();
        //     //         effectDone();
        //     //     }).start();
        //     // }, 1);
        // });
    }
    /**显示金币变化 */
    showPlayerGlodChange() {
        const myHeadNode = this.node.getChildByName("headList").getChildByName("myHead");
        const frontHeadNode = this.node.getChildByName("headList").getChildByName("frontHead");
        const leftHeadNode = this.node.getChildByName("headList").getChildByName("leftHead");
        const rightHeadNode = this.node.getChildByName("headList").getChildByName("rightHead");

        this.getData().deskData.playerList.forEach(({ playerId, playerChangeGold }) => {
            if (playerChangeGold !== 0) {
                let headWrap: cc.Node;
                headWrap = myHeadNode;
                const playerIndex = this.getIndexByPlayerId(playerId).gameIndex;
                if (this.positionNode[playerIndex].name === 'p-top') {
                    //更新对家
                    headWrap = frontHeadNode;
                } else if (this.positionNode[playerIndex].name === 'p-left') {
                    //更新左方
                    headWrap = leftHeadNode;
                } else if (this.positionNode[playerIndex].name === 'p-right') {
                    //更新右方
                    headWrap = rightHeadNode;
                }
                const newNode = new cc.Node('glodChange');
                const label = newNode.addComponent(cc.Label);
                label.string = playerChangeGold < 0 ? '' + playerChangeGold : '+' + playerChangeGold;
                label.fontSize = 42;
                newNode.color = new cc.Color(240, 240, 75, 255);
                headWrap.addChild(newNode);
                cc.tween(newNode).to(0.5, { position: cc.v3(0, 100, 0) }).to(1, { position: cc.v3(0, 100, 0) }).to(0.5, { opacity: 0 }).call(() => { newNode.destroy(); }).start();
            }
        });
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
            const positionName = self.positionNode[playerIndex].name;
            if (positionName === 'p-top') {
                //更新对方打出牌
                _card = this.createOutCardHelper(this.frontOutCardList, playerIndex, 0.6, 'front');
            } else if (positionName === 'p-left') {
                //更新左方打出牌
                _card = this.createOutCardHelper(this.leftOutCardList, playerIndex, 1.3, 'left');
            } else if (positionName === 'p-right') {
                //更新右方打出牌
                _card = this.createOutCardHelper(this.rightOutCardList, playerIndex, 1.3, 'right');
            }
        }
        if (!_card) return;
        this.arrowCard = _card;
        (_card.getComponent("CardItemView") as CardItemView).setArrows(true);
    }
    /**-----辅助方法 */
    private createOutCardHelper(playerOutCardList: cc.Node, playerIndex: number, scale: number, position: PositionType): cc.Node {
        const player = this.getPlayerByIndex(playerIndex);
        const partner: PartnerCard = this.getData().gameData.partnerCardsList.find(item => item.playerId === player.playerId);
        const card = this.addCardToNode(playerOutCardList, partner.partnerCards.outCardList[partner.partnerCards.outCardList.length - 1], position, "fall")
        card.setPosition(cc.v2(0, 0));
        card.setScale(scale);
        return card;
    }
    /**获取outCard数据最后一个删除（考虑到性能没有做重刷） */
    deleteOutCard(playerIndex, card): void {
        //let _card: cc.Node;
        let lastCardNode: cc.Node;
        if (this.isMe(playerIndex)) {
            lastCardNode = this.outCardList.children[this.outCardList.childrenCount - 1];
            // if (lastCardNode && (lastCardNode.getComponent('CardItemView') as CardItemView).cardNumber === card) {
            //     lastCardNode.destroy();
            // }
            // this.outCardList.children.forEach(node => {
            //     if ((node.getComponent('CardItemView') as CardItemView).cardNumber === card) {
            //         node.destroy();
            //     }
            // });
        } else {
            const self = this;
            this.getData().gameData.partnerCardsList.forEach(partner => {
                if (self.positionNode[playerIndex].name === 'p-top') {
                    lastCardNode = self.frontOutCardList.children[self.frontOutCardList.childrenCount - 1];
                } else if (self.positionNode[playerIndex].name === 'p-left') {
                    //更新左方打出牌
                    lastCardNode = self.leftOutCardList.children[self.frontOutCardList.childrenCount - 1];
                } else if (self.positionNode[playerIndex].name === 'p-right') {
                    //更新右方打出牌
                    lastCardNode = self.rightOutCardList.children[self.frontOutCardList.childrenCount - 1];
                }

            });
        }
        if (lastCardNode && (lastCardNode.getComponent('CardItemView') as CardItemView).cardNumber === card) {
            lastCardNode.destroy();
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

            const _gameIndex = this.getIndexByPlayerId(partner.playerId).gameIndex;
            if (this.positionNode[_gameIndex].name === 'p-top') {
                //更新对家出牌
                this.frontOutCardList.removeAllChildren();
                this.updateOutCardHelper(partner, this.frontOutCardList, 0.6, 'front');
            } else if (this.positionNode[_gameIndex].name === 'p-left') {
                //更新左方出牌
                this.leftOutCardList.removeAllChildren();
                this.updateOutCardHelper(partner, this.leftOutCardList, 1.3, 'left');
            } else if (this.positionNode[_gameIndex].name === 'p-right') {
                //更新右方出牌
                this.rightOutCardList.removeAllChildren();
                this.updateOutCardHelper(partner, this.rightOutCardList, 1.3, 'right');
            }
        })
    }
    /**-----辅助方法 */
    private updateOutCardHelper(partner: PartnerCard, playerOutCardList: cc.Node, scale: number, position: PositionType) {
        partner.partnerCards.outCardList.map((item, index) => {
            const card = this.addCardToNode(playerOutCardList, item, position, "fall")
            card.setPosition(cc.v2(0, 0));
            card.setScale(scale);
        });
    }
    /**更新待选牌组框且执行事件 */
    updateChooseCardsAndHandler(launch: (card: number) => void) {
        const cardsChoose = this.getData().gameData.myCards.cardsChoose;
        if (cardsChoose.length > 1) {
            this.cardChooseAlert.active = true;
            const cardListWrap = this.cardChooseAlert.getChildByName("cardList");
            cardListWrap.removeAllChildren();
            cardListWrap.width = 0;
            cardListWrap.height = 0;
            const self = this;
            cardsChoose.map(item => {
                const card = this.addCardToNode(cardListWrap, item, "mine", 'setUp', {
                    purAddNode: node => {
                        //node.setScale(0.8, 0.8);
                        node.setPosition(cc.v2(0, -20));
                        (node.getComponent("CardItemView") as CardItemView).setStress(true);
                    },
                    touchEndCallback: function () {
                        //const script = this.node.getComponent("CardItemView") as CardItemView;
                        launch(item);
                        self.cardChooseAlert.active = false;
                    }
                });
                //this.mainCardList.push(card);
            });
            if (this.getData().gameData.myCards.handCard) {
                (this.handCard.children[0].getComponent("CardItemView") as CardItemView).setStress(false);
            }
        } else {
            launch(cardsChoose[0]);
        }
    }
    /**关闭待选牌框 */
    closeChooseCardPanel() {
        this.cardChooseAlert.active = false;
        const cardListWrap = this.cardChooseAlert.getChildByName("cardList");
        cardListWrap.removeAllChildren();
    }
    /**展示打出的牌 */
    showCardAlert(gameIndex: number, cardNumber: number): void {

        if (gameIndex === undefined || this.isMe(gameIndex)) {
            //console.log(this.showCardEndPosition);
            const _card = this.addCardToNode(this.myShowCardWrap, cardNumber, "mine", "setUp", {
                purAddNode: node => (node.getComponent('CardItemView') as CardItemView).setStress(true)
            });
            //_card.active = false;
            //this.showOutCard && _card.setPosition(this.showOutCard.position.x, this.showOutCard.position.y + 40);
            const cha = this.showCardEndPosition ? (this.showCardEndPosition.x - cc.view.getVisibleSize().width / 2 > 0 ? -39 : 39) : 0;
            const cha2 = 0;//this.showCardEndPosition ? (this.showCardEndPosition.y - cc.view.getVisibleSize().height / 2 > 0 ? -59 : 59) : 0;
            this.showCardEndPosition && _card.setPosition(this.showCardEndPosition.x - cc.view.getVisibleSize().width / 2 + cha, this.showCardEndPosition.y - cc.view.getVisibleSize().height / 2 + cha2);
            // this.effectAction(_card, 'show', {
            //     moveBy: { x: 0, y: 50 }
            // }, () => {
            //     this.scheduleOnce(() => this.myShowCardWrap.removeAllChildren(), 1.5);
            // }); 
            const action = cc.sequence(cc.moveTo(0.2, 0, 0), cc.callFunc(() => {
                this.scheduleOnce(() => this.myShowCardWrap.removeAllChildren(), 1.5);
                this.showCardEndPosition = null;//有可能下次是自动出牌，不然会获取到上次放手的位置
            })).easing(cc.easeOut(3.0));
            _card.runAction(action);
        } else {
            if (!gameIndex) return;
            let playerShowCardWrap: cc.Node;
            let moveBy = { x: 0, y: -70 };
            if (this.positionNode[gameIndex].name === 'p-top') {
                playerShowCardWrap = this.frontShowCardWrap;
            } else if (this.positionNode[gameIndex].name === 'p-left') {
                playerShowCardWrap = this.leftShowCardWrap;
                moveBy = { x: 70, y: 0 };
            } else if (this.positionNode[gameIndex].name === 'p-right') {
                moveBy = { x: -70, y: 0 };
                playerShowCardWrap = this.rightShowCardWrap;
            }
            if (!playerShowCardWrap) return;
            const _card = this.addCardToNode(playerShowCardWrap, cardNumber, "mine", "setUp", {
                purAddNode: node => (node.getComponent('CardItemView') as CardItemView).setStress(true)
            });
            _card.active = false;
            this.effectAction(_card, 'show', { moveBy }, () => {
                this.scheduleOnce(() => playerShowCardWrap.removeAllChildren(), 1.5);
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
    /**更新定章信息 */
    updateDingZhangView(): void {
        const myHeadNode = this.node.getChildByName("headList").getChildByName("myHead");
        const frontHeadNode = this.node.getChildByName("headList").getChildByName("frontHead");
        const leftHeadNode = this.node.getChildByName("headList").getChildByName("leftHead");
        const rightHeadNode = this.node.getChildByName("headList").getChildByName("rightHead");
        const dingzhangIconBuild = (headNode: cc.Node, dz: number) => {
            if (dz === -1) {
                const fase = headNode.getChildByName('face');
                if (fase) fase.destroy();
                return;
            }
            const newNode = new cc.Node('face');
            const sprite = newNode.addComponent(cc.Sprite);
            newNode.setScale(0.8);
            newNode.setRotation(180);
            newNode.opacity = 0;
            newNode.x += 40;
            newNode.y += 80;
            cc.loader.loadRes(`textures/desk/desk`, cc.SpriteAtlas, (err, item) => {
                //0：万 1： 筒 2： 条
                sprite.spriteFrame = item.getSpriteFrame(['img_wan', 'img_tong', 'img_tiao'][dz]);
            });
            headNode.addChild(newNode);
            cc.tween(newNode).to(0.3, { scale: 0.4, opacity: 255, rotation: 0 }).start();
        }


        this.getData().deskData.playerList.forEach(item => {
            if (this.positionNode[item.gameIndex].name === 'p-bottom') {
                //更新本人
                dingzhangIconBuild(myHeadNode, this.getData().gameData.myCards.setFace);
            } else if (this.positionNode[item.gameIndex].name === 'p-top') {
                //更新对家
                dingzhangIconBuild(frontHeadNode, this.getData().gameData.partnerCardsList.find(i => i.playerId === item.playerId).partnerCards.setFace);
            } else if (this.positionNode[item.gameIndex].name === 'p-left') {
                //更新左方
                dingzhangIconBuild(leftHeadNode, this.getData().gameData.partnerCardsList.find(i => i.playerId === item.playerId).partnerCards.setFace);
            } else if (this.positionNode[item.gameIndex].name === 'p-right') {
                //更新右方
                dingzhangIconBuild(rightHeadNode, this.getData().gameData.partnerCardsList.find(i => i.playerId === item.playerId).partnerCards.setFace);
            }
        });
        // dingzhangIconBuild(frontHeadNode, this.getData().gameData.myCards.setFace);
        // dingzhangIconBuild(leftHeadNode, this.getData().gameData.myCards.setFace);
        // dingzhangIconBuild(rightHeadNode, this.getData().gameData.myCards.setFace);
    }
    /**显示要换3张的牌 */
    showSwitchCardList(): void {
        this.node.getChildByName('switchCardAlert').active = true;
        !this.timer3 && (this.timer3 = window.setInterval(() => {
            if (this.getData().gameData.switchCardCountDown !== 0) {
                this.getData().gameData.switchCardCountDown--;
                this.node.getChildByName('switchCardAlert').getChildByName('input_btu').getChildByName('btuStr').getComponent(cc.Label).string = `确定(${this.getData().gameData.switchCardCountDown}s)`;
            } else {
                this.node.getChildByName('switchCardAlert').active = false;
                window.clearInterval(this.timer3);
            }
        }, 1000));
        const switchCards = this.getData().gameData.myCards.switchOutCard;
        this.mainCardList.forEach(card => {
            const _card = card.getComponent("CardItemView") as CardItemView;
            if (switchCards.indexOf(_card.cardNumber) !== -1) {
                _card.setChooseAndStand();
            }
        })
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
            if (t === 0) {
                Facade.Instance.sendNotification(CDMJCommandDefine.Entrust, { command: true }, '');
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
        if (this.maskWrap.active) {
            return;
        }
        this.maskWrap.active = true;
    }

    cancleTuoGuanClick() {
        Facade.Instance.sendNotification(CDMJCommandDefine.Entrust, { command: false }, '');
        this.closeEntrustMask();
    }

    /**关闭托管蒙版 */
    closeEntrustMask(): void {
        this.maskWrap.active = false;
        const tuoguanBtu = this.maskWrap.getChildByName('cancleTuoGuan');
        tuoguanBtu.targetOff(tuoguanBtu);
    }
    /**打开桌面聊天提醒 */
    openChatMsgNotice(msgObj: MsgObj): void {
        if (this.charNotice.opacity) {
            window.clearTimeout(this.timer);
            this.charNotice.setPosition(cc.v2(this.charNotice.x, this.charNotice.y - 30));
        }
        //this.charNotice.active = true;
        this.charNotice.setPosition(cc.v2(this.charNotice.x, this.charNotice.y));
        this.charNotice.opacity = 0;
        const nickName_chat = this.charNotice.getChildByName("sendNickName");
        const msg_chat = this.charNotice.getChildByName("chatContent");
        const face_chat = this.charNotice.getChildByName("face");
        nickName_chat.getComponent(cc.Label).string = msgObj.nickName + "：";
        if (msgObj.type === 'msg') {
            msg_chat.active = true;
            face_chat.active = false;
            msg_chat.getComponent(cc.Label).string = msgObj.content;
        } else {
            face_chat.active = true;
            msg_chat.active = false;
            msg_chat.getComponent(cc.Label).string = '';
            cc.loader.loadRes(`textures/desk/face/face(${msgObj.content})`, cc.Texture2D, (err, item) => {
                face_chat.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(item);
            })
        }
        //console.log(this.charNotice.width);
        cc.tween(this.charNotice).to(0.1, { position: cc.v3(this.charNotice.x, this.charNotice.y + 30), opacity: 255 }).call(() => {
            this.timer = window.setTimeout(() => {
                this.charNotice && cc.tween(this.charNotice).to(0.1, { position: cc.v3(this.charNotice.x, this.charNotice.y - 30), opacity: 0 }).call(() => { this.charNotice.opacity = 0; }).start();
            }, 3000);
        }).start();
    }
    /**打开刷新层 */
    openReloadPanel() {
        cc.loader.loadRes(PrefabDefine.ReloadPanel, cc.Prefab, (err, item) => {
            const reloadPanel = cc.instantiate(item);
            cc.find("Canvas").addChild(reloadPanel);
        })
    }
    start() {

    }
}
