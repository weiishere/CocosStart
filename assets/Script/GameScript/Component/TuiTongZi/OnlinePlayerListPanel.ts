const { ccclass, property } = cc._decorator;

import ViewComponent from "../../Base/ViewComponent";
import { BankerQueuePlayer } from "../../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { DeskBankerPlayer } from "../../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { S2CEnterRoom } from "../../GameData/TuiTongZi/s2c/S2CEnterRoom";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { UserInfo } from "../../repositories/TTZDeskRepository";

@ccclass
export default class OnlinePlayerListPanel extends ViewComponent {
    /** 上庄或者下庄按钮 */
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    playerListNode: cc.Node = null;
    @property(cc.Node)
    playerInfoNode: cc.Node = null;

    player_Info_Node: string = "playerInfoNode";

    bindEvent() {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
        });
    }
    bindUI() {
    }
    start() {
    }

    updatePlayerList(subPlayersParam: Array<UserInfo>, myUser: UserInfo) {
        let subPlayers = subPlayersParam.slice(0, subPlayersParam.length);
        subPlayers.push(myUser);
        subPlayers.sort((v1, v2) => {
            return v2.score - v1.score;
        });
        let removeNodes = [];
        // 先删除不存在的排队玩家
        for (const childrenNode of this.playerListNode.children) {
            let has = false;
            for (const subPlayer of subPlayers) {
                if (childrenNode.name === this.player_Info_Node + subPlayer.uid) {
                    has = true;
                    break;
                }
            }

            if (!has) {
                removeNodes.push(childrenNode);
            }
        }

        for (const node of removeNodes) {
            this.playerListNode.removeChild(node);
        }

        // 添加新的玩家，同时修改已经存在玩家信息
        for (const subPlayer of subPlayers) {
            let has = false;
            for (const childrenNode of this.playerListNode.children) {
                if (childrenNode.name === this.player_Info_Node + subPlayer.uid) {
                    has = true;
                    this.updatePlayerInfo(childrenNode, subPlayer);
                    break;
                }
            }
            if (!has) {
                this.createPlayerInfoNode(subPlayer);
            }
        }
    }

    /**
     * 更新等待玩家列表中的数据
     * @param waitBankerPlayerInfoNode 
     * @param bankerQueuePlayer 
     */
    updatePlayerInfo(playerInfoNode: cc.Node, userInfo: UserInfo) {
        // 昵称
        let nicknameLabel = playerInfoNode.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = userInfo.nickName;
        // 分数
        let scoreLabel = playerInfoNode.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = userInfo.score.toFixed(2);
    }

    /** 创建等待上庄玩家节点 */
    createPlayerInfoNode(userInfo: UserInfo) {
        let playerInfoNodeTmp = cc.instantiate(this.playerInfoNode);
        playerInfoNodeTmp.active = true;
        // 节点的名字加上玩家的名字，方便查到该节点
        playerInfoNodeTmp.name = this.player_Info_Node + userInfo.uid;
        // 昵称
        let nicknameLabel = playerInfoNodeTmp.getChildByName("nicknameLabel").getComponent(cc.Label);
        nicknameLabel.string = userInfo.nickName;
        // 分数
        let scoreLabel = playerInfoNodeTmp.getChildByName("scoreLabel").getComponent(cc.Label);
        scoreLabel.string = userInfo.score.toFixed(2);

        // 获得头像组件
        let headSprite = playerInfoNodeTmp.getChildByName("head").getComponent(cc.Sprite);
        // 加载头像
        SpriteLoadUtil.loadSprite(headSprite, userInfo.headImg);

        this.playerListNode.addChild(playerInfoNodeTmp);
    }
}
