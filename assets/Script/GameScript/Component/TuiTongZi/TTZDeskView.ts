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
import { PrefabDefine } from "../../TuiTongZiConst/TTZPrefabDefine";
import Facade from "../../../Framework/care/Facade";
import { ProxyDefine } from "../../TuiTongZiConst/TTZProxyDefine";
import { TTZDeskProxy } from "../../Proxy/TTZDeskProxy";
import TTZCardItemView from "./TTZCardItemView";
import { UserInfo } from "../../repositories/GateRepository";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { ProxyDefine as MahjongDefine } from "../../MahjongConst/ProxyDefine";
import { LoginData } from "../../GameData/LoginData";
import CardResult from "./CardResult";
import { S2CPushRoomPoker } from "../../GameData/TuiTongZi/s2c/S2CPushRoomPoker";

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

    @property(cc.Prefab)
    cardResult: cc.Prefab = null;

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


                //this.setLight(eventData.target, true, { keepTime: 3 });
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
        cc.loader.loadRes(PrefabDefine.PlayerHead, cc.Prefab, (err, head) => {
            this.subPlayerHeaderLeft.removeAllChildren();
            this.subPlayerHeaderRight.removeAllChildren();
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
    /**打开帮助框 */
    openHelperAlert(): void {
        cc.loader.loadRes('prefabs/TuiTongZi/ttzRole', cc.Prefab, (error, item) => {
            this.node.addChild(cc.instantiate(item));
        });
    }
    /**
     * isAutoReturn:是否自动翻转
     * isAction:是否执行翻转动作，直接显示牌型（如果有数组）
     */
    private getCardItem(parent: cc.Node, index: number, { card, isShow }, position: cc.Vec3, isAutoReturn: boolean, isAction: boolean): TTZCardItemView {
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
            if (isAutoReturn) {
                script.overTurn(isAction);
            }
        } else {
            script.reset();
        }
        return script;
    }
    /**刷新牌组(是否是初发牌) */
    updateCardView(isInit: boolean, isAction: boolean) {
        const masterCardList = this.node.getChildByName('masterWrap').getChildByName('masterCardList');
        const shunCardList = this.node.getChildByName('antePanelWrap').getChildByName('shun_bg').getChildByName('subCardList');
        const qianCardList = this.node.getChildByName('antePanelWrap').getChildByName('qian_bg').getChildByName('subCardList');
        const weiCardList = this.node.getChildByName('antePanelWrap').getChildByName('wei_bg').getChildByName('subCardList');
        let isAutoReturn = !isInit
        const masterCards = this.getData().gameData.masterData.cards;
        const shunCards = this.getData().gameData.subData.shun.cards;
        const qianCards = this.getData().gameData.subData.qian.cards;
        const weiCards = this.getData().gameData.subData.wei.cards;

        const wrapsParent = [
            this.node.getChildByName('masterWrap'),
            this.node.getChildByName('antePanelWrap').getChildByName('shun_bg'),
            this.node.getChildByName('antePanelWrap').getChildByName('qian_bg'),
            this.node.getChildByName('antePanelWrap').getChildByName('wei_bg')
        ];
        const wraps = [masterCardList, shunCardList, qianCardList, weiCardList,];
        const cardListData = [masterCards, shunCards, qianCards, weiCards];


        const overTurnHandler = (index, doneCallback?) => {
            if (!wraps[index]) {
                doneCallback && doneCallback();
                this.scheduleOnce(() => {
                    for (let i = 0; i < 4; i++) {
                        if (wrapsParent[i].getChildByName('resultShow').children.length !== 0) {
                            wrapsParent[i].getChildByName('resultShow').removeAllChildren();
                            wrapsParent[i].getChildByName('resultShow').opacity = 0;
                        }
                    }
                }, 7);
                return;
            };
            window.setTimeout(() => {
                this.getCardItem(wraps[index], 0, cardListData[index].frist, cc.v3(-30, 0, 0), true, isAction);
                this.getCardItem(wraps[index], 1, cardListData[index].second, cc.v3(30, 0, 0), true, isAction);
                if (wrapsParent[index].getChildByName('resultShow').children.length !== 0) {
                    cc.tween(wrapsParent[index].getChildByName('resultShow')).delay(1).to(0.2, {
                        position: cc.v3(wrapsParent[index].getChildByName('resultShow').x + 50,
                            wrapsParent[index].getChildByName('resultShow').y), opacity: 255
                    }).to(3, {}).start();
                }
                overTurnHandler(index + 1, doneCallback);
            }, 1000);
        }
        const initShowCard = (callback) => {
            if (isInit) {
                wraps.forEach(wrap => {
                    wrap.children.map(item => {
                        item.position = cc.v3(item.position.x, item.position.y + 100);
                        item.opacity = 0;
                        (item.getComponent(TTZCardItemView) as TTZCardItemView).reset();
                        cc.tween(item).to(0.2, { position: cc.v3(item.position.x, item.position.y - 100), opacity: 255 }).to(2, {}).call(() => { }).start();
                    });
                });
                // wraps.forEach(wrap => {
                //     wrap.children.map(item => {
                //         cc.tween(item).to(0.2, { position: cc.v3(item.position.x, item.position.y - 100), opacity: 255 }).to(2, {}).call(() => {
                //             // const _script = (item.getComponent(TTZCardItemView) as TTZCardItemView)
                //             // _script.cardNumber && _script.overTurn(true);
                //         }).start();
                //     });
                // });
                this.scheduleOnce(() => {
                    callback();
                }, 1);
            }
        }

        if (!isAction && !isInit) {
            for (let i = 0; i < 4; i++) {
                this.getCardItem(wraps[i], 0, cardListData[i].frist, cc.v3(-30, 0, 0), isAutoReturn, isAction);
                this.getCardItem(wraps[i], 1, cardListData[i].second, cc.v3(30, 0, 0), isAutoReturn, isAction);
            }
        }
        if (isInit) {
            initShowCard(() => {
                overTurnHandler(0, () => { });
            });
        } else {
            //不是发牌后
            overTurnHandler(0, () => { });
        }
    }
    /**显示结果（牌组类型，赢方区域发光，用户输赢数据，金币飞舞，玩家赢输钱） */
    showReult() {
        console.log('-------------------------------------------------------------');
        console.log(this.getData().gameData.historys[this.getData().gameData.historys.length - 1]);
        console.log(this.getData().gameData.presentResult);
        console.log('-------------------------------------------------------------');
        //const result = this.getData().gameData.historys[this.getData().gameData.historys.length - 1];
        const result: S2CPushRoomPoker = this.getData().gameData.presentResult;
        const resultShowMaster = this.node.getChildByName('masterWrap').getChildByName('resultShow');
        const resultShowShun = this.node.getChildByName('antePanelWrap').getChildByName('shun_bg').getChildByName('resultShow');
        const resultShowQian = this.node.getChildByName('antePanelWrap').getChildByName('qian_bg').getChildByName('resultShow');
        const resultShowWei = this.node.getChildByName('antePanelWrap').getChildByName('wei_bg').getChildByName('resultShow');
        //显示牌型
        const arr = [resultShowMaster, resultShowShun, resultShowQian, resultShowWei];
        for (let i = 0; i < result.results.length; i++) {
            const masterCardShow: cc.Node = cc.instantiate(this.cardResult);
            (masterCardShow.getComponent('CardResult') as CardResult).show(result.results[i].point, result.results[i].type, result.results[i].odds);
            arr[i].x = i === 0 ? 356 : 0;
            arr[i].addChild(masterCardShow);
            arr[i].x -= 50;
            arr[i].opacity = 0;
        }
        const arr2 = [
            this.node.getChildByName('antePanelWrap').getChildByName('shun_bg'),
            this.node.getChildByName('antePanelWrap').getChildByName('qian_bg'),
            this.node.getChildByName('antePanelWrap').getChildByName('wei_bg')
        ];

        this.scheduleOnce(() => {
            //开始发光
            result.winTypes.forEach((item, index) => {
                if (item === 1) {
                    this.setLight(arr2[index], true, { keepTime: 5 });
                }
            });
            //金币回飞
            const fly = (index: number, jetton: cc.Node, player: cc.Node, delay) => {
                if (result.winTypes[index] === 1) {
                    //赢，飞回去
                    const targetCoord = this.convetOtherNodeSpace(player, this.node);
                    cc.tween(jetton).delay(delay * 0.01 > 3 ? 3 : delay * 0.01).to(0.6, { position: targetCoord }, { easing: 'quintOut' }).call(() => { jetton.destroy(); }).start();
                    cc.tween(player).delay(0.5).to(0.1, { scale: player.name === 'playerList' ? 0.9 : 0.9 }).to(0.1, { scale: player.name === 'playerList' ? 1 : 0.8 }).start();
                } else {
                    //输，飞到庄家
                    const targetCoord = this.convetOtherNodeSpace(this.node.getChildByName('masterWrap'), this.node);
                    cc.tween(jetton).delay(delay * 0.01 > 3 ? 3 : delay * 0.01).to(0.6, { position: targetCoord }, { easing: 'quintOut' }).call(() => { jetton.destroy(); }).start();
                }
            }
            this.node.getChildByName('jettonsWrap').children.forEach((jetton, index) => {
                const { fromPlayer, subArea } = jetton['source'];
                if (subArea === 'shun') {
                    fly(0, jetton, fromPlayer, index);
                } else if (subArea === 'qian') {
                    fly(1, jetton, fromPlayer, index);
                } else if (subArea === 'wei') {
                    fly(2, jetton, fromPlayer, index);
                }
            });
            this.scheduleOnce(() => {
                //显示用户头像输赢
                result.playerBalance.forEach(item => {
                    // let isFind = false;
                    this.updatePlayerGloadChange(item.name, item.money, item.changeMoney);
                    // this.subPlayerHeaderLeft.children.forEach(player => {
                    //     const playerScript = player.getComponent('PlayerHead') as PlayerHead;
                    //     if (playerScript.playerId === item.name) {
                    //         isFind = true;
                    //         playerScript.showGlodResult(item.changeMoney, item.money);
                    //     }
                    // });
                    // if (!isFind) {
                    //     this.subPlayerHeaderRight.children.forEach(player => {
                    //         const playerScript = player.getComponent('PlayerHead') as PlayerHead;
                    //         if (playerScript.playerId === item.name) {
                    //             playerScript.showGlodResult(item.changeMoney, item.money);
                    //         }
                    //     });
                    // }
                    if (item.name === this.getSelfPlayer().userName) {
                        const playerScript = this.myHeader.children[0].getComponent('PlayerHead') as PlayerHead;
                        playerScript.showGlodResult(item.changeMoney, item.money);
                    }
                })
            }, 0.8);
        }, 6);

    }
    /**对应玩家充值的金币变化 */
    updatePlayerGloadChange(playerId: string, glod: number, change: number) {
        let isFind = false;
        this.subPlayerHeaderLeft.children.forEach(player => {
            const playerScript = player.getComponent('PlayerHead') as PlayerHead;
            if (playerScript.playerId === playerId) {
                isFind = true;
                playerScript.showGlodResult(change, glod);
            }
        });
        if (!isFind) {
            this.subPlayerHeaderRight.children.forEach(player => {
                const playerScript = player.getComponent('PlayerHead') as PlayerHead;
                if (playerScript.playerId === playerId) {
                    playerScript.showGlodResult(change, glod);
                }
            });
        }
    }
    /**金币飞舞 */
    playerClipFly(userInfo: UserInfo, subArea: 'shun' | 'qian' | 'wei', amount: number) {
        console.log(userInfo, subArea, amount);
        const jetton: cc.Node = cc.instantiate(this['jetton_' + amount]);
        let fromPlayer: cc.Node = null;
        jetton.scale = 0.5;
        jetton.getChildByName('light').active = false;
        const getRadomRata = (base) => (parseInt((Math.random() * base) + ''));
        //获取用户
        const subPlayer_leftArr = this.node.getChildByName("subPlayer_left").children;
        const subPlayer_rightArr = this.node.getChildByName("subPlayer_right").children;
        for (let i = 0; i < subPlayer_leftArr.length; i++) {
            if ((<PlayerHead>subPlayer_leftArr[i].getComponent('PlayerHead')).playerId === userInfo.uid) {
                //转换为世界坐标
                fromPlayer = subPlayer_leftArr[i];
                jetton.position = this.convetOtherNodeSpace(subPlayer_leftArr[i], this.node);
                this.node.getChildByName('jettonsWrap').addChild(jetton);
                jetton['playerNode'] = fromPlayer;

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
                fromPlayer = this.myHeader;//.getChildByName("chouma_" + amount);
            } else {
                fromPlayer = this.node.getChildByName("deskOpreationIconWrap").getChildByName("playerList");
            }
            jetton.position = this.convetOtherNodeSpace(fromPlayer, this.node);
            this.node.getChildByName('jettonsWrap').addChild(jetton);
        }
        if (!jetton['source']) jetton['source'] = {};
        jetton['source'] = { fromPlayer, subArea };
        //jetton.rotation = radomRata();
        //获取目标坐标
        const target = this.node.getChildByName("antePanelWrap").getChildByName(subArea + "_bg").getChildByName("jettonWrap");
        const targetCoord = this.convetOtherNodeSpace(target, this.node);
        //打散
        const sign = () => getRadomRata(10) % 2 === 0 ? -1 : 1;
        const resetPosition = (baseSize) => {
            let deviation = Math.random() * 40;
            targetCoord.x = baseSize * sign() + targetCoord.x + deviation * sign();
            targetCoord.y = baseSize * sign() + targetCoord.y + deviation * sign();
        }
        const redom = getRadomRata(100);
        if (redom < 10) {
            //偏差大于50
            resetPosition(60);
        } else if (redom > 10 && redom < 30) {
            //偏差在80-100
            resetPosition(50);
        } else if (redom > 30 && redom < 50) {
            //偏差在60-80
            resetPosition(40);
        } else if (redom > 50 && redom < 70) {
            //偏差在40-60
            resetPosition(30);
        } else {
            //偏差小于40
            resetPosition(20);
        }
        //开始飞行
        cc.tween(fromPlayer).to(0.1, { scale: fromPlayer.name === 'playerList' ? 0.9 : 0.7 }).to(0.1, { scale: fromPlayer.name === 'playerList' ? 1 : 0.8 }).start();
        cc.tween(jetton).to(0.4, { position: targetCoord, angle: getRadomRata(1000) }, { easing: 'quintOut' }).start();
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
        // this.node.getChildByName('jettonsWrap').removeAllChildren();
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
        const masterTotal = parseInt(this.getData().deskData.playerList.masterPlayer.reduce((total, item) => { return total + item.userInfo.score; }, 0) / 5 + '') ;
        this.node.getChildByName("antePanelWrap").getChildByName("shun_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.shun.totalGold + '/' + masterTotal;
        this.node.getChildByName("antePanelWrap").getChildByName("qian_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.qian.totalGold + '/' + masterTotal;
        this.node.getChildByName("antePanelWrap").getChildByName("wei_bg").getChildByName("headScore").getComponent(cc.Label).string = this.getData().gameData.subData.wei.totalGold + '/' + masterTotal;
    }

    quitGame(){
        this.node.destroy();
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
