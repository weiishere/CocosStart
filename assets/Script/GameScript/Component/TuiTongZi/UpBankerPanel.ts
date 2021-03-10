const { ccclass, property } = cc._decorator;

import ViewComponent from "../../Base/ViewComponent";
import { BankerQueuePlayer } from "../../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { DeskBankerPlayer } from "../../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";

@ccclass
export default class UpBankerPanel extends ViewComponent {
    /** 上庄或者下庄按钮 */
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    bankerListNode: cc.Node = null;
    @property(cc.Node)
    waiUpBankerListNode: cc.Node = null;
    @property(cc.Node)
    bankerPlayerInfoNode: cc.Node = null;
    @property(cc.Node)
    waitBankerPlayerInfoNode: cc.Node = null;
    @property(cc.RichText)
    upBankerRemark: cc.RichText = null;
    /** 上庄或者下庄按钮 */
    @property(cc.Node)
    upBankerOrDownBankerBtn: cc.Node = null;

    banker_Player_Info_Node_str: string = "bankerPlayerInfoNode";
    wait_Banker_Player_Info_Node_str: string = "waitBankerPlayerInfoNode";

    bindEvent() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
        });
        this.upBankerOrDownBankerBtn.on(cc.Node.EventType.TOUCH_END, () => {
        });
    }
    bindUI() {
    }
    start() {
    }

    /**
     * 更新庄家列表
     * @param deskBankerPlayer 
     */
    updateBankerPlayerList(deskBankerPlayers: DeskBankerPlayer[]) {
        // 先删除不存在的当庄玩家
        for (const childrenNode of this.bankerListNode.children) {
            let has = false;
            for (const deskBankerPlayer of deskBankerPlayers) {
                if (childrenNode.name === this.banker_Player_Info_Node_str + deskBankerPlayer.acctName) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                this.bankerListNode.removeChild(childrenNode);
            }
        }

        // 添加新的玩家，同时修改已经存在玩家信息
        for (const deskBankerPlayer of deskBankerPlayers) {
            let has = false;
            for (const childrenNode of this.waiUpBankerListNode.children) {
                if (childrenNode.name === this.banker_Player_Info_Node_str + deskBankerPlayer.acctName) {
                    has = true;
                    this.updateBankerPlayerNodeInfo(childrenNode, deskBankerPlayer);
                    break;
                }
            }
            if (!has) {
                this.createBankerPlayerNode(deskBankerPlayer);
            }
        }
    }

    /**
     * 更新等待上庄列表
     * @param bankerWaitList 
     */
    updateWaitUpBankerPlayerList(bankerWaitList: BankerQueuePlayer[]) {
        // 先删除不存在的排队玩家
        for (const childrenNode of this.waiUpBankerListNode.children) {
            let has = false;
            for (const bankerQueuePlayer of bankerWaitList) {
                if (childrenNode.name === this.wait_Banker_Player_Info_Node_str + bankerQueuePlayer.name) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                this.waiUpBankerListNode.removeChild(childrenNode);
            }
        }

        // 添加新的玩家，同时修改已经存在玩家信息
        for (const bankerQueuePlayer of bankerWaitList) {
            let has = false;
            for (const childrenNode of this.waiUpBankerListNode.children) {
                if (childrenNode.name === this.wait_Banker_Player_Info_Node_str + bankerQueuePlayer.name) {
                    has = true;
                    this.updateWaitUpBankerPlayerNodeInfo(childrenNode, bankerQueuePlayer);
                    break;
                }
            }
            if (!has) {
                this.createWaitUpBankerPlayerNode(bankerQueuePlayer);
            }
        }
    }

    /** 创建当庄玩家节点 */
    createBankerPlayerNode(deskBankerPlayer: DeskBankerPlayer) {
        let bankerPlayerInfoNodeTmp = cc.instantiate(this.bankerPlayerInfoNode);
        bankerPlayerInfoNodeTmp.active = true;
        // 节点的名字加上玩家的名字，方便查到该节点
        bankerPlayerInfoNodeTmp.name = this.banker_Player_Info_Node_str + deskBankerPlayer.acctName;
        // 昵称
        let nicknameLabel = bankerPlayerInfoNodeTmp.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = deskBankerPlayer.nickname;
        // 分数
        let scoreLabel = bankerPlayerInfoNodeTmp.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = deskBankerPlayer.money + "";
        // 当庄余额占比
        let scoreRatioLabel = bankerPlayerInfoNodeTmp.getChildByName("scoreRatioLabel").getComponent(cc.Label);
        scoreRatioLabel.string = deskBankerPlayer.percent + "%";
        // 当庄局数
        let roundLabel = bankerPlayerInfoNodeTmp.getChildByName("roundLabel").getComponent(cc.Label);
        roundLabel.string = deskBankerPlayer.totalBankerNum + "/" + deskBankerPlayer.maxBankerNum;

        // 获得头像组件
        let headSprite = bankerPlayerInfoNodeTmp.getChildByName("head").getComponent(cc.Sprite);
        // 加载头像
        SpriteLoadUtil.loadSprite(headSprite, deskBankerPlayer.headName);
        this.bankerListNode.addChild(bankerPlayerInfoNodeTmp);
    }

    /** 创建等待上庄玩家节点 */
    createWaitUpBankerPlayerNode(bankerQueuePlayer: BankerQueuePlayer) {
        let waitBankerPlayerInfoNodeTmp = cc.instantiate(this.waitBankerPlayerInfoNode);
        waitBankerPlayerInfoNodeTmp.active = true;
        // 节点的名字加上玩家的名字，方便查到该节点
        waitBankerPlayerInfoNodeTmp.name = this.wait_Banker_Player_Info_Node_str + bankerQueuePlayer.name;
        // 昵称
        let nicknameLabel = waitBankerPlayerInfoNodeTmp.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = bankerQueuePlayer.nickname;
        // 分数
        let scoreLabel = waitBankerPlayerInfoNodeTmp.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = bankerQueuePlayer.money + "";

        // 获得头像组件
        let headSprite = waitBankerPlayerInfoNodeTmp.getChildByName("head").getComponent(cc.Sprite);
        // 加载头像
        SpriteLoadUtil.loadSprite(headSprite, bankerQueuePlayer.headPic);

        this.waiUpBankerListNode.addChild(waitBankerPlayerInfoNodeTmp);
    }

    /**
     * 更新等待玩家列表中的数据
     * @param waitBankerPlayerInfoNode 
     * @param bankerQueuePlayer 
     */
    updateWaitUpBankerPlayerNodeInfo(waitBankerPlayerInfoNode: cc.Node, bankerQueuePlayer: BankerQueuePlayer) {
        // 昵称
        let nicknameLabel = waitBankerPlayerInfoNode.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = bankerQueuePlayer.nickname;
        // 分数
        let scoreLabel = waitBankerPlayerInfoNode.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = bankerQueuePlayer.money + "";
    }

    /**
     * 更新当庄玩家列表中的数据
     * @param bankerPlayerInfoNode 
     * @param deskBankerPlayer 
     */
    updateBankerPlayerNodeInfo(bankerPlayerInfoNode: cc.Node, deskBankerPlayer: DeskBankerPlayer) {
        // 昵称
        let nicknameLabel = bankerPlayerInfoNode.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = deskBankerPlayer.nickname;
        // 分数
        let scoreLabel = bankerPlayerInfoNode.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = deskBankerPlayer.money + "";

        // 当庄余额占比
        let scoreRatioLabel = bankerPlayerInfoNode.getChildByName("scoreRatioLabel").getComponent(cc.Label);
        scoreRatioLabel.string = deskBankerPlayer.percent + "%";
        // 当庄局数
        let roundLabel = bankerPlayerInfoNode.getChildByName("roundLabel").getComponent(cc.Label);
        roundLabel.string = deskBankerPlayer.totalBankerNum + "/" + deskBankerPlayer.maxBankerNum;
    }
    // update (dt) {}
}
