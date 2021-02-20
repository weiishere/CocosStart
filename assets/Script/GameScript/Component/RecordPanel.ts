import ViewComponent from '../Base/ViewComponent';
import { SpriteLoadUtil } from '../Other/SpriteLoadUtil';
import { LoginAfterHttpUtil } from '../Util/LoginAfterHttpUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { ConfigProxy } from '../Proxy/ConfigProxy';
import { HttpUtil } from '../Util/HttpUtil';
import { GameRecordInfo } from '../GameData/GameRecordInfo';
import { RoomPlayerCredit } from '../GameData/RoomPlayerCredit';
import RecordDetailList from './RecordDetailList';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { GateProxy } from '../Proxy/GateProxy';
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordPanel extends ViewComponent {

    @property(cc.Node)
    recordContent: cc.Node = null;
    @property(cc.Node)
    recordItem: cc.Node = null;
    @property(cc.Node)
    playerItem: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    recordTipsLabel: cc.Node = null;
    @property(cc.Node)
    upPageBtn: cc.Node = null;
    @property(cc.Node)
    downPageBtn: cc.Node = null;
    @property(cc.Prefab)
    recordDetailList: cc.Prefab = null;

    beforePageIndex = 1;
    pageIndex = 1;
    pageCount = 10;
    /** 是否最后一页 */
    isLastPage: boolean;


    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.upPageBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.pageIndex--;
            if (this.pageIndex < 1) {
                this.pageIndex = 1;
                this.getGateProxy().toast("已经在第一页了");
                return;
            }
            this.isLastPage = false;
            this.getRecoldLog(this.pageIndex);
        });

        this.downPageBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.isLastPage) {
                this.getGateProxy().toast("已经最后一页了");
                return;
            }
            this.pageIndex++;
            this.getRecoldLog(this.pageIndex);
        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
        this.getRecoldLog(this.pageIndex);
    }

    getRecoldLog(pageIndex: number) {
        this.recordContent.removeAllChildren();
        let url = this.getConfigProxy().facadeUrl + "record/getTodayGameRecordInfos";
        let param = {
            userName: this.getLocalCacheDataProxy().getLoginData().userName,
            pageIndex: pageIndex,
            pageCount: this.pageCount,
        }
        LoginAfterHttpUtil.send(url, (response) => {
            let data: GameRecordInfo[] = <GameRecordInfo[]>response;
            if (data && data.length > 0) {
                this.recordTipsLabel.active = false;
                data.forEach(v => {
                    this.createRecordItem(v);
                })
                this.beforePageIndex = this.pageIndex;
            } else {
                this.recordTipsLabel.active = true;
            }

            if (!data || data.length < this.pageCount) {
                this.pageIndex = this.beforePageIndex;
                this.isLastPage = true;
            }
        }, (err) => {
        }, HttpUtil.METHOD_POST, param);
    }

    /**
     * 创建记录项
     */
    createRecordItem(data: GameRecordInfo) {
        let recordItemObj = cc.instantiate(this.recordItem);
        recordItemObj.active = true;

        let roomNoLabel = recordItemObj.getChildByName("roomNoLabel").getComponent(cc.Label);
        roomNoLabel.string = "房间号：" + data.roomNo;
        let timeLabel = recordItemObj.getChildByName("timeLabel").getComponent(cc.Label);
        timeLabel.string = data.endTime;
        // 详情按钮事件
        recordItemObj.getChildByName("detailBtn").on(cc.Node.EventType.TOUCH_END, () => {
            this.openRecordDetailList(data.roomRoundNo);
        }); 

        let playerInfoNode = recordItemObj.getChildByName("playerInfo");
        data.roomPlayerCreditDtos.forEach(v => {
            let palyerItem = this.createPlayerItem(v);
            playerInfoNode.addChild(palyerItem);
        });

        this.recordContent.addChild(recordItemObj);
    }

    private openRecordDetailList(roomRoundNo: string) {
        // let recordDetailListNode = cc.instantiate(this.recordDetailList);
        // this.root.addChild(recordDetailListNode);
        // let recordRetailListScript = <RecordDetailList>recordDetailListNode.getComponent("RecordDetailList");
        // recordRetailListScript.loadData(roomRoundNo);

        Facade.Instance.sendNotification(CommandDefine.OpenRecordDetailList, roomRoundNo, "");
    }

    /**
     * 创建用户项
     */
    createPlayerItem(playerData: RoomPlayerCredit) {
        let playerItemObj = cc.instantiate(this.playerItem);
        let head = playerData.head;
        playerItemObj.active = true;
        let nicknameLabel = playerItemObj.getChildByName("nickname").getComponent(cc.Label);
        nicknameLabel.string = playerData.nickname;
        let playerIdLabel = playerItemObj.getChildByName("id").getComponent(cc.Label);
        playerIdLabel.string = "ID：" + playerData.userName;
        let winlossLabel = playerItemObj.getChildByName("winloss").getComponent(cc.Label);
        if (playerData.credit >= 0) {
            let color = cc.color().fromHEX("#FF0000")
            winlossLabel.node.color = color;
            winlossLabel.string = "+" + playerData.credit;
        } else {
            let color = cc.color().fromHEX("#008567")
            winlossLabel.node.color = color;
            winlossLabel.string = playerData.credit + "";
        }
        let headSprite = playerItemObj.getChildByName("head").getComponent(cc.Sprite);

        SpriteLoadUtil.loadSprite(headSprite, head);
        return playerItemObj;
    }

    // update (dt) {}
}
