import ViewComponent from '../../Base/ViewComponent';
import { LoginData } from '../../GameData/LoginData';
import { S2CJoinClubInfo } from '../../GameData/Club/s2c/S2CJoinClubInfo';
import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';
import DymjDesk from './DymjDesk';
import { S2CClubRoomSitDown } from '../../GameData/Club/s2c/S2CClubRoomSitDown';
import { S2CClubRoomStandUp } from '../../GameData/Club/s2c/S2CClubRoomStandUp';
import { S2CClubPushRoomRound } from '../../GameData/Club/s2c/S2CClubPushRoomRound';
import { DeskListEventDefine } from '../../GameConst/Event/DeskListEventDefine';
import { PrefabDefine } from '../../MahjongConst/PrefabDefine';
import BaseDesk from './BaseDesk';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
import { S2CClubRoomPlayerInfo } from '../../GameData/Club/s2c/S2CClubRoomPlayerInfo';
import { CommonUtil } from '../../Util/CommonUtil';
import { GateProxy } from '../../Proxy/GateProxy';
import Facade from '../../../Framework/care/Facade';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import List from '../../Util/List';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { getUserOrderInfo } from '../bonus/MyBonus';

const { ccclass, property } = cc._decorator;


const DUAN_GOU_KA_ROOM_TYPE = 100;

const ROOM_LIST = [
    {
        gameName: "全部玩法",
        value: -1,
    }, {
        gameName: "断勾卡",
        value: DUAN_GOU_KA_ROOM_TYPE,
    }, {
        gameName: "两人一房",
        value: 0,
    }, {
        gameName: "两人两房",
        value: 1,
    }, {
        gameName: "三人两房",
        value: 2,
    }, {
        gameName: "血战到底",
        value: 3,
        // }, {
        //     gameName: "四人癞子",
        //     value: 88,
        // }, {
        //     gameName: "二人癞子",
        //     value: 88,
        // }, {
        //     gameName: "四人一房",
        //     value: 88,
        // }, {
        //     gameName: "跑得快",
        //     value: 88,
        // }, {
        //     gameName: "斗地主",
        //     value: 88,
    }

]

@ccclass
export default class DeskList extends ViewComponent {
    @property(cc.Node)
    quitClubBtn: cc.Node = null;
    @property(cc.Node)
    kuaiSuBtn: cc.Node = null;
    @property(cc.Prefab)
    dymjDesk: cc.Prefab = null;
    @property(cc.Node)
    deskContainer: cc.Node = null;
    @property(List)
    deskContainerList: List = null;
    @property(cc.ScrollView)
    deskContainerScrollView: cc.ScrollView = null;
    @property(cc.Node)
    chooseSpeedPanel: cc.Node = null;
    @property(cc.Node)
    roomTypeNode: cc.Node = null;
    @property(cc.Node)
    roomTypeNodeContent: cc.Node = null;
    @property(cc.Node)
    triggerBar: cc.Node = null;
    @property(cc.Label)
    fullLabel: cc.Label = null;
    @property(cc.Label)
    waitLabel: cc.Label = null;
    @property(cc.Node)
    userHeaderNode: cc.Node = null;
    @property(cc.Node)
    anteNode: cc.Node = null;
    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(cc.Node)
    shouyi_btu: cc.Node = null;

    @property(cc.Node)
    chengyuan_btu: cc.Node = null;

    @property(cc.Node)
    zhanji_btu: cc.Node = null;

    @property(cc.Node)
    hongli_btu: cc.Node = null;


    waitHandleDesk = [];

    /** 可视范围个数 */
    private displayAreaCount: number = 10;
    private loadCount = 6;

    private selectAnte: number = 0;
    private roomType: number = -1;
    private roomInfoArray: S2CClubRoomInfoBase[] = null;
    private basicScoreList: Array<number> = [];
    /** 所有底分 */
    private antes: number[] = [];

    private isLoadDesk: boolean = false;

    private isShow: boolean = false;

    /** 是否点击过房间类型，用于处理底分显示位置 */
    private isClickRoomType: boolean = false;

    /** 当前显示的内容 */
    private displayRoomInfos: S2CClubRoomInfoBase[] = null;

    start() {
        this.initRoomType();
    }

    protected bindUI(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.closeChooseSpeedPanel();
        }, this);
    }
    protected bindEvent(): void {
        this.quitClubBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.dispatchCustomEvent(DeskListEventDefine.ClubQuitEvent, null);
        });

        this.kuaiSuBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.chooseSpeedPanel.active === true) {
                this.closeChooseSpeedPanel();
            } else {
                this.openChooseSpeedPanel((score) => {
                    this.dispatchCustomEvent(DeskListEventDefine.SpeedJoinDeskEvent, score);
                })
            }
        });

        this.triggerBar.on(cc.Node.EventType.TOUCH_END, () => {
            let deskContainer = this.node.getChildByName("DeskContainer");

            let moveDistance = 238;
            // let isShow = this.roomTypeNode.x > -700;
            let deskAction = null;
            let action = null;

            if (this.isShow) {
                this.isShow = false;
                action = cc.moveBy(0.3, -moveDistance, 0);
                deskAction = cc.moveBy(0.3, -moveDistance, 0);
            } else {
                this.isShow = true;
                action = cc.moveBy(0.3, moveDistance, 0);
                deskAction = cc.moveBy(0.3, moveDistance, 0);
            }
            deskContainer.runAction(deskAction);
            this.roomTypeNode.runAction(action);
        });

        this.roomTypeNode.on("scroll-began", () => {
            if (!this.anteNode.active) {
                return;
            }
            this.anteNode.active = false;
        })

        this.schedule(() => {
            if (!this.isLoadDesk) {
                return;
            }

            this.isLoadDesk = false;
            this.loadDeskNode();
        }, 5)

        this.shouyi_btu.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenMyEnterPrise, null, '');
        });
        this.chengyuan_btu.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenMyPlayer, null, '');
        });
        this.zhanji_btu.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenRecordPanel, null, '');
        });

        this.hongli_btu.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenBonusIndex, null, '');
        });
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        getUserOrderInfo(localCacheDataProxy.getLoginData().userName, ({ data }) => {
            if (data.accountType === 666) {
                //盟主
                this.shouyi_btu.active = true;
                this.chengyuan_btu.active = true;
            }
        });

    }

    private initRoomType() {
        let contentNode = this.roomTypeNode.getChildByName("view").getChildByName("content");
        let nodeTmp = contentNode.children[0];
        contentNode.removeAllChildren();

        ROOM_LIST.forEach(v => {
            let node = cc.instantiate(nodeTmp);
            node.name = "roomType_" + v.value;
            node.getChildByName("txtNode").getChildByName("label").getComponent(cc.Label).string = v.gameName;

            if (v.value === 88) {
                node.getChildByName("txtNode").getChildByName("more_btu").active = false;
            }

            contentNode.addChild(node);

            node.on(cc.Node.EventType.TOUCH_END, () => {
                this.selectRoomType11(node);
            });
        });
    }

    addButton(node: cc.Node, scale: number = 1.5) {
        let button = node.addComponent(cc.Button);

        button.transition = cc.Button.Transition.SCALE;
        button.zoomScale = scale;
        button.duration = 0.1;
    }

    closeChooseSpeedPanel() {
        this.chooseSpeedPanel.active = false;
        if (this.chooseSpeedPanel.opacity === 0) return;
        cc.tween(this.chooseSpeedPanel).to(0.05, { opacity: 0, position: cc.v3(this.chooseSpeedPanel.x, this.chooseSpeedPanel.y) }).call(() => { }).start();
    }

    getUserHeaderScript() {
        return this.userHeaderNode.getComponent("UserHeader");
    }

    openChooseSpeedPanel(clickHandler) {
        this.chooseSpeedPanel.active = true;
        this.chooseSpeedPanel.opacity = 0;
        this.chooseSpeedPanel.setPosition(cc.v3(this.chooseSpeedPanel.x, this.chooseSpeedPanel.y + 30));

        let chooseScoreBtu = cc.loader.getRes(PrefabDefine.ScoreChooseBtu, cc.Prefab);
        this.chooseSpeedPanel.getChildByName("panel").removeAllChildren();
        this.basicScoreList.forEach(item => {
            const _chooseScoreBtu: cc.Node = cc.instantiate(chooseScoreBtu);
            _chooseScoreBtu.getChildByName("Label").getComponent(cc.Label).string = item + '底分';
            this.chooseSpeedPanel.getChildByName("panel").addChild(_chooseScoreBtu);
            _chooseScoreBtu.on(cc.Node.EventType.TOUCH_END, () => {
                clickHandler(item);
                this.closeChooseSpeedPanel();
            }, this);
            cc.tween(this.chooseSpeedPanel).to(0.1, { opacity: 255, position: cc.v3(this.chooseSpeedPanel.x, this.chooseSpeedPanel.y - 30) }).call(() => { }).start();
        });
    }
    loadDeskList(s2CJoinClubInfo: S2CJoinClubInfo) {
        if (!s2CJoinClubInfo) {
            return;
        }

        this.roomInfoArray = s2CJoinClubInfo.roomInfos;
        if (!this.roomInfoArray) {
            this.roomInfoArray = [];
        } else {
            this.sortRoomInfo(this.roomInfoArray);
        }
        this.displayRoomInfos = this.roomInfoArray;

        this.deskContainerList.numItems = this.roomInfoArray.length;

        this.updateFullAndWaitStatus();
        this.loadBasicScoreList();
        this.loadAnteNode();
    }

    loadBasicScoreList() {
        this.basicScoreList = [];
        for (const roomInfo of this.displayRoomInfos) {
            this.basicScoreList.push(roomInfo.basicScore);
        }
        this.basicScoreList = Array.from(new Set(this.basicScoreList));
        this.basicScoreList.sort((a, b) => a - b);
    }

    /**
     * List组件中的渲染方法
     * @param item 
     * @param idx 
     */
    onListGridRender(item: cc.Node, idx: number) {
        let roomInfo = this.displayRoomInfos[idx];

        let script = <BaseDesk>item.getComponent(BaseDesk);
        script.initData(roomInfo);
    }

    /** List 组件中的单击事件 */
    onListGridSelectEvent(event: cc.Event) {
    }

    sortRoomInfo(roomInfos: S2CClubRoomInfoBase[]) {
        roomInfos.sort((d1, d2) => {
            let count1 = d1.userInfos.length;
            if (count1 >= d1.maxPlayerNum) {
                if (this.roomType >= 0 || this.selectAnte > 0) {
                    count1 = 6;
                } else {
                    count1 = 5;
                }
            } else if (count1 === 0) {  //空桌往后靠
                if (this.roomType >= 0 || this.selectAnte > 0) {
                    count1 = 5;
                } else {
                    count1 = 6;
                }
            }

            let count2 = d2.userInfos.length;
            if (count2 >= d2.maxPlayerNum) {
                if (this.roomType >= 0 || this.selectAnte > 0) {
                    count2 = 6;
                } else {
                    count2 = 5;
                }
            } else if (count2 === 0) {
                if (this.roomType >= 0 || this.selectAnte > 0) {
                    count2 = 5;
                } else {
                    count2 = 6;
                }
            }

            // 根据座位人数排序
            let res = count1 - count2;
            if (res === 0) {
                if (this.roomType < 0 && this.selectAnte === 0) {
                    res = d1.userInfos.length - d2.userInfos.length;
                }
                if (res === 0) {
                    res = d1.basicScore - d2.basicScore;
                }
            }
            return res;
        })
    }

    loadDeskNode() {
        // 先删除所有子节点，避免重复显示
        // this.deskContainerScrollView.scrollToBottomLeft(0.01);
        // this.deskContainer.removeAllChildren();

        this.displayRoomInfos = this.getRoomInfos();
        this.loadBasicScoreList();

        this.sortRoomInfo(this.displayRoomInfos);
        // 设置显示个数
        this.deskContainerList.numItems = this.displayRoomInfos.length;
        this.updateFullAndWaitStatus();
    }

    loadAnteNode() {
        this.anteNode.removeAllChildren();

        let roomInfos = this.getRoomInfosNotFilterAnte();

        let antes = [];
        roomInfos.forEach(v => {
            antes.push(v.basicScore);
        });
        antes = Array.from(new Set(antes));
        antes.push(-1);
        antes.sort((a, b) => a - b);

        antes.forEach(v => {
            let res = cc.instantiate(this.selectNode);
            this.anteNode.addChild(res);
            if (v === -1) {
                res.name = "selectNodeAll";
                res.getChildByName("label").getComponent(cc.Label).string = `全部`;
                res.getChildByName("label").setScale(1.5);
            } else {
                res.name = "selectNode" + v;
                res.getChildByName("label").getComponent(cc.Label).string = `${v}`;
                res.getChildByName("label").setScale(1.5);
            }

            this.addButton(res);
            res.on(cc.Node.EventType.TOUCH_END, () => {
                this.selectRoomAnte11(res);
            });
        });

        this.anteNode.children.reverse();
    }

    updateFullAndWaitStatus() {
        let fullCount = 0;
        let waitCount = 0;

        let roomInfos = this.getRoomInfos();
        for (const roomInfo of roomInfos) {
            if (roomInfo.maxPlayerNum === roomInfo.userInfos.length) {
                fullCount++;
            } else if (roomInfo.userInfos.length > 0) {
                waitCount++;
            }
        }

        this.fullLabel.string = `满人:${fullCount}桌`;
        this.waitLabel.string = `等待:${waitCount}桌`;
    }

    /**
     * 获得没有通过底分过滤的房间列表
     * @returns 
     */
    getRoomInfosNotFilterAnte(): S2CClubRoomInfoBase[] {
        let roomInfos: S2CClubRoomInfoBase[] = [];

        if (this.roomType > -1) {
            this.roomInfoArray.forEach(v => {
                if (this.roomType === DUAN_GOU_KA_ROOM_TYPE && v.gameSubClass === GameNoDefine.DA_YI_ER_REN_MAHJONG) {
                    roomInfos.push(v);
                } else if (v.gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI && this.roomType === v.roomType) {
                    roomInfos.push(v);
                }
            });
        } else {
            roomInfos = this.roomInfoArray;
        }

        return roomInfos;
    }

    getRoomInfos(): S2CClubRoomInfoBase[] {
        let roomInfos: S2CClubRoomInfoBase[] = [];

        if (this.roomType > -1) {
            this.roomInfoArray.forEach(v => {
                if (this.roomType === DUAN_GOU_KA_ROOM_TYPE && v.gameSubClass === GameNoDefine.DA_YI_ER_REN_MAHJONG) {
                    roomInfos.push(v);
                } else if (v.gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI && this.roomType === v.roomType) {
                    roomInfos.push(v);
                }
            });
        } else {
            roomInfos = this.roomInfoArray;
        }

        let tmpRoomInfos = [];
        if (this.selectAnte > 0) {
            roomInfos.forEach(v => {
                if (v.basicScore === this.selectAnte) {
                    tmpRoomInfos.push(v);
                }
            });
        } else {
            tmpRoomInfos = roomInfos;
        }

        return tmpRoomInfos;
    }

    addDesk(roomInfo: S2CClubRoomInfoBase) {
        if (this.getRoomInfo(roomInfo.roomNo)) {
            cc.log("addDesk ==== 1");
            return;
        }

        this.roomInfoArray.push(roomInfo);
        // 如果当前添加房间类型和选中的类型不相同，就直接添加到数组中
        if (this.roomType > -1) {
            if (this.roomType === DUAN_GOU_KA_ROOM_TYPE && roomInfo.gameSubClass !== GameNoDefine.DA_YI_ER_REN_MAHJONG) {
                return;
            } else if (roomInfo.gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI && this.roomType !== roomInfo.roomType) {
                cc.log("addDesk ==== 2");
                return;
            }
        }

        if (this.selectAnte > 0 && this.selectAnte !== roomInfo.basicScore) {
            cc.log("addDesk ==== 3");
            return;
        }

        // this.waitHandleDesk.push(roomInfo);
        this.isLoadDesk = true;
    }

    addDeskNode(roomInfo: S2CClubRoomInfoBase) {
        this.loadDeskNode();

        // if (this.getDeskNode(roomInfo.roomNo)) {
        //     cc.log("addDeskNode ==== 1");
        //     return;
        // }

        // let desk = this.createDeskPrefab(roomInfo.gameSubClass);
        // if (!desk) {
        //     cc.log("addDeskNode ==== " + roomInfo.gameSubClass);
        //     return;
        // }

        // this.deskContainer.addChild(desk);

        // let script = <BaseDesk>desk.getComponent(BaseDesk);
        // script.initData(roomInfo);
    }

    getRoomInfo(roomNo: number): S2CClubRoomInfoBase {
        for (const roomInfo of this.roomInfoArray) {
            if (roomInfo.roomNo === roomNo) {
                return roomInfo;
            }
        }
        return null;
    }

    removeRoomInfo(roomNo: number) {
        for (let index = 0; index < this.roomInfoArray.length; index++) {
            const roomInfo = this.roomInfoArray[index];
            if (roomInfo.roomNo === roomNo) {
                this.roomInfoArray.splice(index, 1);
                break;
            }
        }
    }

    createDeskPrefab(gameSubClass: number) {
        if (gameSubClass === GameNoDefine.DA_YI_ER_REN_MAHJONG) {
            return cc.instantiate(this.dymjDesk);
        } else if (gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI) {
            let xzddDeskPrefab = cc.loader.getRes(PrefabDefine.XzddDesk, cc.Prefab);
            return cc.instantiate(xzddDeskPrefab);
        }
        return null;
    }

    deteleDesk(roomNo: number) {
        this.removeRoomInfo(roomNo);
        // this.waitHandleDesk.push(roomNo);

        this.isLoadDesk = true;
    }

    deleteDeskNode(roomNo: number) {
        this.loadDeskNode();
        // let deskScript = this.getDeskNode(roomNo);
        // if (deskScript == null) {
        //     return;
        // }
        // deskScript.node.destroy();
    }

    sortDesk() {
        this.deskContainer.children.sort((d1, d2) => {
            let script1 = <BaseDesk>d1.getComponent(BaseDesk);
            let script2 = <BaseDesk>d2.getComponent(BaseDesk);

            let count1 = script1.getSitDownCount();
            if (script1.isFull()) {
                count1 = -1;
            }
            let count2 = script2.getSitDownCount();
            if (script2.isFull()) {
                count2 = -1;
            }

            // 根据座位人数排序
            let res = count2 - count1;
            if (res === 0) {
                res = script1.basicScore - script2.basicScore;
            }
            return res;
        })
    }

    addRoomPlayer(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        let roomInfo = this.getRoomInfo(s2CClubRoomSitDown.roomNo);
        if (roomInfo === null) {
            return;
        }

        let isExist = false;
        for (const userInfo of roomInfo.userInfos) {
            if (userInfo.userName === s2CClubRoomSitDown.userName) {
                isExist = true;
                break;
            }
        }

        if (!isExist) {
            let userInfo = new S2CClubRoomPlayerInfo();
            userInfo.userName = s2CClubRoomSitDown.userName;
            userInfo.head = s2CClubRoomSitDown.head;
            userInfo.seatNo = s2CClubRoomSitDown.seatNo;
            userInfo.nickname = s2CClubRoomSitDown.nickname;

            roomInfo.userInfos.push(userInfo);
        }

        this.updateFullAndWaitStatus();
    }

    removeRoomPlayer(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        let roomInfo = this.getRoomInfo(s2CClubRoomStandUp.roomNo);
        if (roomInfo === null) {
            return;
        }

        for (let index = 0; index < roomInfo.userInfos.length; index++) {
            const userInfo = roomInfo.userInfos[index];
            if (userInfo.userName === s2CClubRoomStandUp.userName) {
                roomInfo.userInfos.splice(index, 1);
                break;
            }
        }
        this.updateFullAndWaitStatus();
    }

    updateRoomInfo(s2CClubPushRoomRound: S2CClubPushRoomRound) {
        let roomInfo = this.getRoomInfo(s2CClubPushRoomRound.roomNo);
        if (roomInfo === null) {
            return;
        }

        roomInfo.currentGameCount = s2CClubPushRoomRound.roundCount;
        roomInfo.gameCount = s2CClubPushRoomRound.gameCount;
    }

    sitDown(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        this.addRoomPlayer(s2CClubRoomSitDown);
        let deskScript = this.getDeskNode(s2CClubRoomSitDown.roomNo);
        if (!deskScript) {
            return;
        }

        deskScript.sitDown(s2CClubRoomSitDown.head, s2CClubRoomSitDown.nickname, s2CClubRoomSitDown.seatNo);
        this.isLoadDesk = true;
        // this.sortDesk();
    }

    standUp(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        this.removeRoomPlayer(s2CClubRoomStandUp);
        let deskScript = this.getDeskNode(s2CClubRoomStandUp.roomNo);
        if (!deskScript) {
            return;
        }

        deskScript.standUp(s2CClubRoomStandUp.seatNo);
        this.isLoadDesk = true;
        // this.sortDesk();
    }

    setRoundCount(s2CClubPushRoomRound: S2CClubPushRoomRound) {
        this.updateRoomInfo(s2CClubPushRoomRound);
        let deskScript = this.getDeskNode(s2CClubPushRoomRound.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.setRoundCount(s2CClubPushRoomRound.roundCount, s2CClubPushRoomRound.gameCount);
    }

    getDeskNode(roomNo: number): BaseDesk {
        for (const deskNode of this.deskContainer.children) {
            let script = deskNode.getComponent(BaseDesk);
            if (script.roomNo === roomNo) {
                return script;
            }
        }

        return null;
    }

    /**
     * 快速查到桌子
     * @param myGold 
     */
    speedFindDeskNo(myGold: number) {
        let desks = [];
        for (const deskNode of this.deskContainer.children) {
            let script = <BaseDesk>deskNode.getComponent(BaseDesk);
            if (myGold >= script.enterLimit && script.getSitDownCount() < 2) {
                desks.push(deskNode);
            }
        }

        if (desks.length === 0) {
            return null;
        }

        desks.sort((a, b) => {
            let script1 = <BaseDesk>a.getComponent(BaseDesk);
            let script2 = <BaseDesk>b.getComponent(BaseDesk);
            return script1.getSitDownCount() - script2.getSitDownCount();
        })

        return desks[0].getComponent(BaseDesk).roomNo;
    }
    /**
         * 根据底分查到桌子
         * @param myGold 
         */
    speedFindDeskNoAndBasicscore(score: number) {
        let desks = [];
        for (const deskNode of this.deskContainer.children) {
            let script = <BaseDesk>deskNode.getComponent(BaseDesk);
            if (score === script.basicScore && script.getSitDownCount() < script.getMaxPlayerNum()) {
                desks.push(deskNode);
            }
        }

        if (desks.length === 0) {
            return null;
        }

        desks.sort((a, b) => {
            let script1 = <BaseDesk>a.getComponent(BaseDesk);
            let script2 = <BaseDesk>b.getComponent(BaseDesk);
            return script2.getSitDownCount() - script1.getSitDownCount();
        })

        return desks[0].getComponent(BaseDesk).roomNo;
    }

    selectRoomAnte(toggle: cc.Toggle) {
        // let name = toggle.node.name.replace("selectNode", "");

        // this.anteNode.active = false;

        // if (name === 'All') {
        //     this.selectAnte = 0;
        // } else {
        //     this.selectAnte = Number(name);
        // }
        // this.sortRoomInfo(this.roomInfoArray);

        // this.loadDeskNode();
    }

    selectRoomAnte11(anteNode: cc.Node) {
        let name = anteNode.name.replace("selectNode", "");

        this.anteNode.active = false;

        if (name === 'All') {
            this.selectAnte = 0;
        } else {
            this.selectAnte = Number(name);
        }
        this.sortRoomInfo(this.roomInfoArray);

        this.loadDeskNode();
    }

    selectRoomType(toggle: cc.Toggle) {
        // this.anteNode.active = true;

        // if (toggle.node.name === 'allGame') {
        //     this.roomType = -1;
        // } else if (toggle.node.name === 'roomType21') {
        //     this.roomType = 0;
        // } else if (toggle.node.name === 'roomType22') {
        //     this.roomType = 1;
        // } else if (toggle.node.name === 'roomType32') {
        //     this.roomType = 2;
        // } else if (toggle.node.name === 'roomType43') {
        //     this.roomType = 3;
        // } else if (toggle.node.name === 'roomTypeDgk') {
        //     this.roomType = DUAN_GOU_KA_ROOM_TYPE;
        // } else {
        //     CommonUtil.toast("敬请期待.....")
        //     return;
        // }
        // this.sortRoomInfo(this.roomInfoArray);

        // this.loadDeskNode();
    }

    selectRoomType11(node: cc.Node) {
        let roomTypeTmp = parseInt(node.name.split("_")[1]);
        if (roomTypeTmp === 88) {
            CommonUtil.toast("敬请期待.....")
            this.anteNode.active = false;
            return;
        }

        if (roomTypeTmp === this.roomType && this.isClickRoomType) {
            this.anteNode.active = !this.anteNode.active;
            return;
        }

        this.isClickRoomType = true;

        this.roomType = roomTypeTmp;
        this.anteNode.active = true;
        let po = node.convertToWorldSpaceAR(node.getPosition());
        po = this.node.convertToNodeSpaceAR(po);
        this.anteNode.x = po.x - node.getPosition().x;

        this.sortRoomInfo(this.roomInfoArray);

        this.loadDeskNode();
    }

    copyID() {
        let userName = this.getLocalCacheDataProxy().getLoginData().userName;
        if (CC_JSB) {
            (<any>jsb).copyTextToClipboard(userName);
            this.getGateProxy().toast("复制成功");
        }
    }

    public getGateProxy(): GateProxy {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    public getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    update(dt) {
        // let value = this.waitHandleDesk.shift();
        // if ('number' === typeof (value)) {
        //     this.deleteDeskNode(value);
        // } else {
        //     this.addDeskNode(value);
        // }
    }

    getDeskPosition(node: cc.Node) {
        let pos = this.deskContainer.convertToWorldSpaceAR(node.getPosition());
        pos.x -= 400 / 2;
        pos = this.deskContainer.parent.parent.convertToNodeSpaceAR(pos);

        return pos;
    }
}
