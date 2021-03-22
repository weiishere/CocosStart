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

const { ccclass, property } = cc._decorator;

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
    @property(cc.Node)
    chooseSpeedPanel: cc.Node = null;

    waitHandleDesk = [];

    private roomType: number = -1;
    private roomInfoArray: S2CClubRoomInfoBase[] = null;
    private basicScoreList: Array<number> = [];

    start() {
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
            this.openChooseSpeedPanel((score) => {
                //console.log(score);
                this.dispatchCustomEvent(DeskListEventDefine.SpeedJoinDeskEvent, score);
            })

        });
    }
    closeChooseSpeedPanel() {
        this.chooseSpeedPanel.active = false;
        if (this.chooseSpeedPanel.opacity === 0) return;
        cc.tween(this.chooseSpeedPanel).to(0.05, { opacity: 0, position: cc.v3(this.chooseSpeedPanel.x, this.chooseSpeedPanel.y) }).call(() => { }).start();
    }
    openChooseSpeedPanel(clickHandler) {
        this.chooseSpeedPanel.active = true;
        this.chooseSpeedPanel.opacity = 0;
        this.chooseSpeedPanel.setPosition(cc.v3(this.chooseSpeedPanel.x, this.chooseSpeedPanel.y + 30));
        cc.loader.loadRes(PrefabDefine.ScoreChooseBtu, cc.Prefab, (err, chooseScoreBtu) => {
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

        });

    }
    loadDeskList(s2CJoinClubInfo: S2CJoinClubInfo) {
        if (!s2CJoinClubInfo) {
            return;
        }

        this.roomInfoArray = s2CJoinClubInfo.roomInfos;
        if (!this.roomInfoArray) {
            this.roomInfoArray = [];
        }

        this.loadDeskNode();

        for (const deskNode of this.deskContainer.children) {
            let script = deskNode.getComponent(BaseDesk) as BaseDesk;
            this.basicScoreList.push(script.basicScore);
        }
        this.basicScoreList = Array.from(new Set(this.basicScoreList));
        this.basicScoreList.sort((a, b) => a - b)
    }

    loadDeskNode() {
        // 先删除所有子节点，避免重复显示
        this.deskContainer.removeAllChildren();

        let roomInfos = this.getRoomInfos();
        for (const roomInfo of roomInfos) {
            this.addDeskNode(roomInfo);
        }

        this.sortDesk();
    }

    getRoomInfos(): S2CClubRoomInfoBase[] {
        let roomInfos: S2CClubRoomInfoBase[] = [];

        if (this.roomType > -1) {
            this.roomInfoArray.forEach(v => {
                if (this.roomType === v.roomType) {
                    roomInfos.push(v);
                }
            });
        } else {
            roomInfos = this.roomInfoArray;
        }

        return roomInfos;
    }

    addDesk(roomInfo: S2CClubRoomInfoBase) {
        if (this.isRoomExist(roomInfo.roomNo)) {
            return;
        }

        // 如果当前添加房间类型和选中的类型不相同，就直接添加到数组中
        if (this.roomType > -1 && this.roomType !== roomInfo.roomType) {
            this.roomInfoArray.push(roomInfo);
            return;
        }

        this.waitHandleDesk.push(roomInfo);
    }

    addDeskNode(roomInfo: S2CClubRoomInfoBase) {
        if (this.getDeskNode(roomInfo.roomNo)) {
            return;
        }

        let desk = this.createDeskPrefab(roomInfo.gameSubClass);
        if (!desk) {
            return;
        }

        this.deskContainer.addChild(desk);

        let script = <BaseDesk>desk.getComponent(BaseDesk);
        script.initData(roomInfo);
    }

    isRoomExist(roomNo: number) {
        for (const roomInfo of this.roomInfoArray) {
            if (roomInfo.roomNo === roomNo) {
                return true;
            }
        }
        return false;
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
        this.waitHandleDesk.push(roomNo);
    }

    deleteDeskNode(roomNo: number) {
        this.removeRoomInfo(roomNo);
        let deskScript = this.getDeskNode(roomNo);
        if (deskScript == null) {
            return;
        }
        deskScript.node.destroy();
    }

    sortDesk() {
        this.deskContainer.children.sort((d1, d2) => {
            let script1 = <BaseDesk>d1.getComponent(BaseDesk);
            let script2 = <BaseDesk>d2.getComponent(BaseDesk);

            // 根据座位人数排序
            let res = script2.getSitDownCount() - script1.getSitDownCount();
            if (res === 0) {
                res = script1.basicScore - script2.basicScore;
            }
            return res;
        })
    }

    changeDeskAfterSort() {
        this.deskContainer.children.sort((d1, d2) => {
            let script1 = <BaseDesk>d1.getComponent(BaseDesk);
            let script2 = <BaseDesk>d2.getComponent(BaseDesk);

            // 根据座位人数排序
            let res = script2.getSitDownCount() - script1.getSitDownCount();
            if (res === 0) {
                res = script1.basicScore - script2.basicScore;
            }
            return res;
        })
    }

    sitDown(s2CClubRoomSitDown: S2CClubRoomSitDown) {
        let deskScript = this.getDeskNode(s2CClubRoomSitDown.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.sitDown(s2CClubRoomSitDown.head, s2CClubRoomSitDown.nickname, s2CClubRoomSitDown.seatNo);
        this.changeDeskAfterSort();
    }

    standUp(s2CClubRoomStandUp: S2CClubRoomStandUp) {
        let deskScript = this.getDeskNode(s2CClubRoomStandUp.roomNo);

        if (!deskScript) {
            return;
        }

        deskScript.standUp(s2CClubRoomStandUp.seatNo);
        this.changeDeskAfterSort();
    }

    setRoundCount(s2CClubPushRoomRound: S2CClubPushRoomRound) {
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
            if (score === script.basicScore && script.getSitDownCount() < 2) {
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

    selectRoomType(toggle: cc.Toggle) {
        if (toggle.node.name === 'roomTypeAll') {
            this.roomType = -1;
        } else if (toggle.node.name === 'roomType21') {
            this.roomType = 0;
        } else if (toggle.node.name === 'roomType22') {
            this.roomType = 1;
        } else if (toggle.node.name === 'roomType32') {
            this.roomType = 2;
        } else if (toggle.node.name === 'roomType43') {
            this.roomType = 3;
        }

        this.loadDeskNode();
    }

    update(dt) {

        if (this.waitHandleDesk.length === 0) {
            return;
        }

        let value = this.waitHandleDesk.shift();
        if ('number' === typeof (value)) {
            this.deleteDeskNode(value);
        } else {
            this.addDeskNode(value);
        }
    }
}
