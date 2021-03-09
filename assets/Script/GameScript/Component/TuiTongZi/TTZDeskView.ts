// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import ViewComponent from "../../Base/ViewComponent";
const { ccclass, property } = cc._decorator;
import { GameData, DeskData, TTZDeskRepository } from "../../repositories/TTZDeskRepository"
import PlayerHead from "./PlayerHead";
import { PrefabDefine } from "../../TuiTongZiConst/PrefabDefine";
import Facade from "../../../Framework/care/Facade";
import { ProxyDefine } from "../../TuiTongZiConst/ProxyDefine";
import { TTZDeskProxy } from "../../Proxy/TTZDeskProxy";
import TTZCardItemView from "./TTZCardItemView";
import { UserInfo } from "../../repositories/GateRepository";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { ProxyDefine as MahjongDefine } from "../../MahjongConst/ProxyDefine";
import { LoginData } from "../../GameData/LoginData";

@ccclass
export default class TTZDeskView extends ViewComponent {

    private deskOpreationIconWrap: cc.Node;
    private antePanelWrap: cc.Node;
    private jettonWrap: cc.Node;
    private myHeader: cc.Node;
    private subPlayerHeaderLeft: cc.Node;
    private subPlayerHeaderRight: cc.Node;
    private masterWrap: cc.Node;

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    jetton_1: cc.Node = null;
    @property(cc.Node)
    jetton_5: cc.Node = null;
    @property(cc.Node)
    jetton_10: cc.Node = null;
    @property(cc.Node)
    jetton_50: cc.Node = null;
    @property(cc.Node)
    jetton_100: cc.Node = null;

    @property(cc.Prefab)
    cardItem: cc.Prefab = null;
    // onLoad () {}
    bindUI() {
        this.deskOpreationIconWrap = this.node.getChildByName("deskOpreationIconWrap");
        this.myHeader = this.node.getChildByName("myHeaderWrap");
        this.subPlayerHeaderLeft = this.node.getChildByName("subPlayer_left");
        this.subPlayerHeaderRight = this.node.getChildByName("subPlayer_right");
        this.masterWrap = this.node.getChildByName("masterWrap");
        ///this.deskBtus = this.deskOpreationIconWrap.children;
        for (let i in this.deskOpreationIconWrap.children) {
            if (this.deskOpreationIconWrap.children[i] instanceof cc.Node) {
                (this.deskOpreationIconWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.deskOpreationIconWrap.children[i].dispatchEvent(new cc.Event.EventCustom("deskOpreation", true));
                }, this);
            }
        }
        //下注砝码
        this.jettonWrap = this.node.getChildByName("jettonWrap");
        for (let i in this.jettonWrap.children) {
            if (this.jettonWrap.children[i] instanceof cc.Node) {
                this.setLight(this.jettonWrap.children[i], false);
                (this.jettonWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.jettonWrap.children[i].dispatchEvent(new cc.Event.EventCustom("jettonChoose", true));
                }, this);
            }
        }
        //下注区域
        this.antePanelWrap = this.node.getChildByName("antePanelWrap");
        for (let i in this.antePanelWrap.children) {
            if (this.antePanelWrap.children[i] instanceof cc.Node) {
                this.setLight(this.antePanelWrap.children[i], false);
                (this.antePanelWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {

                    this.antePanelWrap.children[i].dispatchEvent(new cc.Event.EventCustom("anteAreaChose", true));
                }, this);
            }
        }
    }
    bindEvent() {

    }
    start() {

    }
    getSelfPlayer(): LoginData {
        return (<LocalCacheDataProxy>Facade.Instance.retrieveProxy(MahjongDefine.LocalCacheData)).getLoginData();
    }
    getData(): TTZDeskRepository {
        return (Facade.Instance.retrieveProxy(ProxyDefine.TTZDesk) as TTZDeskProxy).repository;
    }
    //设置发光
    setLight(node: cc.Node, isLight?: boolean, option?: { isFlicker?: boolean, keepTime?: number }) {
        const _option = Object.assign({ isFlicker: false, keepTime: 0 }, option || {});
        const light = node.getChildByName('light');
        light.active = isLight || false;
        if (!isLight) {
            light.opacity = 255;
            light.stopAllActions();
            return;
        };
        if (_option.isFlicker) {
            light.opacity = 0;
            const action = cc.repeatForever(
                cc.sequence(cc.fadeTo(0.4, 50), cc.fadeTo(0.4, 255), cc.callFunc(() => { })));
            light.runAction(action);
        }
        if (_option.keepTime) {
            this.scheduleOnce(() => {
                const action = cc.sequence(cc.fadeTo(0.2, 0), cc.callFunc(() => {
                    light.opacity = 255;
                    light.active = false;
                }));
                light.runAction(action);
            }, _option.keepTime);
        }
    }

    /**绑定砝码点击操作 */
    public bindClipOpreationEvent(callBack: (node: cc.Node, clipNum: number) => void): void {
        let isDone = true;
        this.jettonWrap.on('jettonChoose', (eventData) => {
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            this.jettonWrap.children.map(item => {
                this.setLight(item, false);
                cc.tween(item).to(0.1, { scale: 1 }).start();
            });
            cc.tween(eventData.target).to(0.1, { scale: 1.3 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, +eventData.target.name.split("_")[1]);
                this.setLight(eventData.target, true, { isFlicker: true });
                isDone = true;
            }).start();
        }, this);
    }
    /**绑定桌面操作事件（设置、记录按钮等） */
    public bindDskOpreationEvent(callBack: (node: cc.Node) => void): void {
        let isDone = true;
        this.deskOpreationIconWrap.on('deskOpreation', (eventData) => {
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            cc.tween(eventData.target).to(0.1, { scale: 0.95, position: cc.v3(x, y - 10) }).to(0.1, { scale: 1, position: cc.v3(x, y) }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node);
                isDone = true;
            }).start();
        }, this);
    }
    /**绑定点击下注区域时间 */
    public bindAnteAreaEvent(callBack: (node: cc.Node, anteCode: string) => void): void {
        let isDone = true;
        this.antePanelWrap.on('anteAreaChose', (eventData) => {
            console.log('--------------------------------------------------');
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            cc.tween(eventData.target).to(0.1, { scale: 1.05 }).to(0.1, { scale: 1 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, eventData.target.name.split("_")[0]);


                this.setLight(eventData.target, true, { keepTime: 3 });
                isDone = true;
            }).start();
        }, this);
    }
    /**刷新头像 */
    updatePlayerHead() {
        //设置玩家自己头像
        const selfPlayer = this.getData().deskData.playerList.mySelf;
        cc.loader.loadRes(PrefabDefine.PlayerHead, cc.Prefab, (err, head) => {
            const playerHead: cc.Node = cc.instantiate(head);
            (playerHead.getComponent("PlayerHead") as PlayerHead).init(selfPlayer.uid, selfPlayer.headImg, "landscape", selfPlayer.score, selfPlayer.nickName);
            this.myHeader.addChild(playerHead);
        });
    }
    /**刷新闲家玩家列表 */
    updateSubPlayerList() {
        const initHead = (head, index: number, parent: cc.Node, position: cc.Vec3) => {
            const _subPlayer = this.getData().deskData.playerList.subPlayer[index];
            if (_subPlayer) {
                const playerHead: cc.Node = cc.instantiate(head);
                (playerHead.getComponent("PlayerHead") as PlayerHead).init(_subPlayer.uid, _subPlayer.headImg, "vertical", _subPlayer.score, _subPlayer.nickName);
                playerHead.position = position;
                playerHead.scale = 0.8;
                parent.addChild(playerHead);
            }
        }
        this.subPlayerHeaderLeft.removeAllChildren();
        this.subPlayerHeaderRight.removeAllChildren();
        cc.loader.loadRes(PrefabDefine.PlayerHead, cc.Prefab, (err, head) => {
            initHead(head, 0, this.subPlayerHeaderLeft, new cc.Vec3(58, 220));
            initHead(head, 1, this.subPlayerHeaderLeft, new cc.Vec3(-31, 100));
            initHead(head, 2, this.subPlayerHeaderLeft, new cc.Vec3(-51, -30));
            initHead(head, 3, this.subPlayerHeaderLeft, new cc.Vec3(20, -155));

            initHead(head, 4, this.subPlayerHeaderRight, new cc.Vec3(-40, 220));
            initHead(head, 5, this.subPlayerHeaderRight, new cc.Vec3(40, 100));
            initHead(head, 6, this.subPlayerHeaderRight, new cc.Vec3(60, -30));
            initHead(head, 7, this.subPlayerHeaderRight, new cc.Vec3(20, -155));
        })
    }
    /**刷新庄家玩家列表 */
    updateSMasterPlayerList() {
        const initHead = (head, index: number, parent: cc.Node, position: cc.Vec3) => {
            const playerHead: cc.Node = cc.instantiate(head);
            const _masterPlayer = this.getData().deskData.playerList.masterPlayer[index];
            if (_masterPlayer) {
                (playerHead.getComponent("PlayerHead") as PlayerHead).init(_masterPlayer.userInfo.uid, _masterPlayer.userInfo.headImg, "simple", _masterPlayer.userInfo.score, _masterPlayer.userInfo.nickName, +_masterPlayer.percent);
                playerHead.position = position;
                playerHead.scale = 0.9;
                // const widget = playerHead.addComponent(cc.Widget);
                // widget.left = widgetValue;
                parent.addChild(playerHead);
            }
        }
        cc.loader.loadRes(PrefabDefine.PlayerHead, cc.Prefab, (err, head) => {
            initHead(head, 0, this.masterWrap, new cc.Vec3(-320, 0));
            initHead(head, 1, this.masterWrap, new cc.Vec3(-220, 0));
            initHead(head, 2, this.masterWrap, new cc.Vec3(-120, 0));
            initHead(head, 3, this.masterWrap, new cc.Vec3(120, 0));
            initHead(head, 4, this.masterWrap, new cc.Vec3(220, 0));
        })
    }
    private getCardItem(parent: cc.Node, index: number, { card, isShow }, position: cc.Vec3, isAutoReturn: boolean): TTZCardItemView {
        let _node: cc.Node;

        if (!parent.children[index]) {
            _node = cc.instantiate(this.cardItem);
            parent.addChild(_node);
            _node.position = position;
            _node.scale = 0.8;
        } else { _node = parent.children[index] }
        const script = _node.getComponent(TTZCardItemView) as TTZCardItemView;
        script.cardNumber = card;
        if (isShow) {
            //console.log('-----------------------------' + isAutoReturn);
            isAutoReturn && script.overTurn();
        } else {
            script.reset();
        }
        return script;
    }
    /**刷新牌组(是否是初发牌) */
    updateCardView(isInit: boolean) {
        //首先刷新庄家牌组

        const masterCardList = this.node.getChildByName('masterWrap').getChildByName('masterCardList');
        const shunCardList = this.node.getChildByName('antePanelWrap').getChildByName('shun_bg').getChildByName('subCardList');
        const qianCardList = this.node.getChildByName('antePanelWrap').getChildByName('qian_bg').getChildByName('subCardList');
        const weiCardList = this.node.getChildByName('antePanelWrap').getChildByName('wei_bg').getChildByName('subCardList');
        let isAutoReturn = !isInit
        const masterCards = this.getData().gameData.masterData.cards;
        this.getCardItem(masterCardList, 0, masterCards.frist, cc.v3(-30, 0, 0), isAutoReturn);
        this.getCardItem(masterCardList, 1, masterCards.second, cc.v3(30, 0, 0), isAutoReturn);
        //刷新闲家牌组
        const shunCards = this.getData().gameData.subData.shun.cards;
        this.getCardItem(shunCardList, 0, shunCards.frist, cc.v3(-30, 0, 0), isAutoReturn);
        this.getCardItem(shunCardList, 1, shunCards.second, cc.v3(30, 0, 0), isAutoReturn);

        const qianCards = this.getData().gameData.subData.qian.cards;
        this.getCardItem(qianCardList, 0, qianCards.frist, cc.v3(-30, 0, 0), isAutoReturn);
        this.getCardItem(qianCardList, 1, qianCards.second, cc.v3(30, 0, 0), isAutoReturn);

        const weiCards = this.getData().gameData.subData.wei.cards;
        this.getCardItem(weiCardList, 0, weiCards.frist, cc.v3(-30, 0, 0), isAutoReturn);
        this.getCardItem(weiCardList, 1, weiCards.second, cc.v3(30, 0, 0), isAutoReturn);
        if (isInit) {
            const wraps = [masterCardList, shunCardList, qianCardList, weiCardList];
            wraps.forEach(wrap => {
                wrap.children.map(item => {
                    item.position = cc.v3(item.position.x, item.position.y + 100);
                    item.opacity = 0;
                    (item.getComponent(TTZCardItemView) as TTZCardItemView).reset();
                });
            });
            this.scheduleOnce(() => {
                wraps.forEach(wrap => {
                    wrap.children.map(item => {
                        cc.tween(item).to(0.2, { position: cc.v3(item.position.x, item.position.y - 100), opacity: 255 }).to(2, {}).call(() => {
                            const _script = (item.getComponent(TTZCardItemView) as TTZCardItemView)
                            _script.cardNumber && _script.overTurn();
                        }).start()
                    });
                });
            }, 1);
        }

    }
    /**金币飞舞 */
    playerClipFly(userInfo: UserInfo, subArea: 'shun' | 'qian' | 'wei', amount: number) {
        //console.log(uid, subArea, amount);
        const jetton: cc.Node = cc.instantiate(this['jetton_' + amount]);
        let fromPlayer: cc.Node = null;
        jetton.scale = 0.5;
        //获取用户
        const subPlayer_leftArr = this.node.getChildByName("subPlayer_left").children;
        const subPlayer_rightArr = this.node.getChildByName("subPlayer_right").children;
        for (let i = 0; i < subPlayer_leftArr.length; i++) {
            if ((<PlayerHead>subPlayer_leftArr[i].getComponent('PlayerHead')).playerId === userInfo.uid) {
                //转换为世界坐标
                fromPlayer = subPlayer_leftArr[i];
                jetton.position = this.convetOtherNodeSpace(subPlayer_leftArr[i], this.node);
                this.node.getChildByName('jettonsWrap').addChild(jetton);
                break;
            }
        }
        for (let i = 0; i < subPlayer_rightArr.length; i++) {
            if ((<PlayerHead>subPlayer_rightArr[i].getComponent('PlayerHead')).playerId === userInfo.uid) {
                //转换为世界坐标
                fromPlayer = subPlayer_rightArr[i];
                jetton.position = this.convetOtherNodeSpace(subPlayer_rightArr[i], this.node);
                this.node.getChildByName('jettonsWrap').addChild(jetton);
                break;
            }
        }
        if (!fromPlayer) {
            //隐藏用户或是自己
            if (userInfo.uid === this.getSelfPlayer().userName) {
                //玩家自己下注
                console.log('玩家自己下注' + amount)
                fromPlayer = this.node.getChildByName("jettonWrap").getChildByName("chouma_" + amount);
            } else {
                fromPlayer = this.node.getChildByName("deskOpreationIconWrap").getChildByName("playerList");
            }
            jetton.position = this.convetOtherNodeSpace(fromPlayer, this.node);
            this.node.getChildByName('jettonsWrap').addChild(jetton);
        }

        //获取目标坐标
        const target = this.node.getChildByName("antePanelWrap").getChildByName(subArea + "_bg").getChildByName("jettonWrap");
        const targetCoord = this.convetOtherNodeSpace(target, this.node);
        //打散
        const redom = parseInt((Math.random() * 100) + '');
        const sign = () => (parseInt((Math.random() * 10) + '') % 2 === 0 ? -1 : 1);
        const resetPosition = (baseSize) => {
            let deviation = Math.random() * 30;
            targetCoord.x = baseSize * sign() + targetCoord.x + deviation * sign();
            targetCoord.y = baseSize * sign() + targetCoord.y + deviation * sign();
        }
        if (redom < 10) {
            //偏差大于50
            resetPosition(80);
        } else if (redom > 10 && redom < 3) {
            //偏差在80-100
            resetPosition(65);
        } else if (redom > 30 && redom < 50) {
            //偏差在60-80
            resetPosition(50);
        } else if (redom > 50 && redom < 70) {
            //偏差在40-60
            resetPosition(35);
        } else {
            //偏差小于40
            resetPosition(20);
        }
        //开始飞行
        cc.tween(fromPlayer).to(0.1, { scale: fromPlayer.name === 'playerList' ? 0.9 : 0.7 }).to(0.1, { scale: fromPlayer.name === 'playerList' ? 1 : 0.8 }).start();
        cc.tween(jetton).to(0.2, { position: targetCoord }).start();
    }
    /**玩家自己下注 */
    myselfPlayerAnteFly(jettonType: number, subArea: 'shun' | 'qian' | 'wei') {
        const jetton: cc.Node = cc.instantiate(this['jetton_' + jettonType]);
        let fromPlayer: cc.Node = null;
        jetton.scale = 0.5;
        this.node.getChildByName('jettonWrap').getChildByName('chouma_' + jettonType).addChild(jetton);
        const target = this.node.getChildByName("antePanelWrap").getChildByName(subArea + "_bg").getChildByName("jettonWrap");
        const targetCoord = this.convetOtherNodeSpace(target, this.node);
        cc.tween(jetton).to(0.2, { position: targetCoord }).start();
    }
    /**清理桌面 */
    clearDesk() {
        this.node.getChildByName('jettonsWrap').removeAllChildren();
        // const arr = ['shun', 'qian', 'wei'];
        // arr.forEach(item => {
        //     this.node.getChildByName("antePanelWrap").getChildByName(item + "_bg").getChildByName("jettonWrap").removeAllChildren();
        // })

    }
    /**游戏提示 */
    public updateGamePrompt() {
        const prompt = this.node.getChildByName("masterWrap").getChildByName("tishi").getChildByName("gameShowStr").getComponent(cc.Label);
        prompt.string = this.getData().gameData.stateStr;
    }
    /**刷新闲家分数 */
    public updateSubScore() {
        const masterTotal = parseInt(this.getData().deskData.playerList.masterPlayer.reduce((total, item) => { return total + item.userInfo.score; }, 0) + '');
        this.node.getChildByName("antePanelWrap").getChildByName("shun_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.shun.totalGold + '/' + masterTotal;
        this.node.getChildByName("antePanelWrap").getChildByName("qian_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.qian.totalGold + '/' + masterTotal;
        this.node.getChildByName("antePanelWrap").getChildByName("wei_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.wei.totalGold + '/' + masterTotal;
    }

    /**把一个节点的本地坐标转到另一个节点的本地坐标下 */
    convetOtherNodeSpace(node, targetNode) {
        if (!node || !targetNode) {
            return null;
        }
        //先转成世界坐标
        let worldPoint = this.localConvertWorldPoint(node);
        return this.worldConvertLocalPoint(targetNode, worldPoint);
    }
    localConvertWorldPoint(node) {
        if (node) {
            return node.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return null;
    }
    worldConvertLocalPoint(node, worldPoint) {
        if (node) {
            return node.convertToNodeSpaceAR(worldPoint);
        }
        return null;
    }
}
