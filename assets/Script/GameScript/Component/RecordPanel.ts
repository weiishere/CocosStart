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


    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
        this.getRecoldLog(1);
    }

    getRecoldLog(pageIndex: number) {
        this.recordContent.removeAllChildren();
        let url = this.getConfigProxy().facadeUrl + "record/getTodayGameRecordInfos";
        let param = {
            userName: this.getLocalCacheDataProxy().getLoginData().userName,
            pageIndex: pageIndex,
            pageCount: 20
        }
        LoginAfterHttpUtil.send(url, (response) => {
            let data: GameRecordInfo[] = <GameRecordInfo[]>response;
            data.forEach(v => {
                this.createRecordItem(v);
            })
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
        let timeLabel = recordItemObj.getChildByName("timeLabel").getComponent(cc.Label);
        // 详情按钮事件
        recordItemObj.getChildByName("detailBtn").on(cc.Node.EventType.TOUCH_END, () => {
        });

        let playerInfoNode = recordItemObj.getChildByName("playerInfo");
        data.roomPlayerCreditDtos.forEach(v => {
            let palyerItem = this.createPlayerItem(v);
            playerInfoNode.addChild(palyerItem);
        });

        this.recordContent.addChild(recordItemObj);
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
