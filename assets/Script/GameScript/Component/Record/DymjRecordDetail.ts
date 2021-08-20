import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { GameNoDefine } from '../../GameConst/GameNoDefine';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import CardItemView from '../DdYiMahjong/CardItemView';
import BaseRecordDetail, { PlayerRecordData } from './BaseRecordDetail';
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordDetail extends BaseRecordDetail {

    @property(cc.Node)
    recordInfo: cc.Node = null;
    @property(cc.Prefab)
    cardItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    detailBtn: cc.Node = null;
    @property(cc.Node)
    detailItem: cc.Node = null;
    @property(cc.Node)
    detailItemContent: cc.Node = null;
    @property(cc.Node)
    shouQiBtn: cc.Node = null;
    @property(cc.Node)
    itemContent: cc.Node = null;

    protected bindUI(): void {

    }
    protected bindEvent(): void {
        this.detailBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.detailItem.active = true;
        });
        this.shouQiBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.detailItem.active = false;
        });
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
    }

    loadData(showBG: boolean, userName: string, roomNo: number, currentGameCount: number, totalGameCount: number,
        playerData: Array<PlayerRecordData>, gameSubClass: number, timer?: string) {
        this.bg.active = showBG;
        this.roomNoLabel.string = "房间号：" + roomNo;
        if (totalGameCount > 0) {
            this.roundLabel.string = "局数：" + currentGameCount + "/" + totalGameCount;
        } else {
            this.roundLabel.node.active = false;
        }
        if (timer) {
            this.timeLabel.string = timer;
        } else {
            this.timeLabel.string = "";
        }

        playerData.forEach(v => {
            if (v.userName === userName) {
                this.loadRecordInfo(this.recordInfo, true, v);

                // if (gameSubClass === GameNoDefine.XUE_ZHAN_DAO_DI) {
                this.loadItemContent(v.detailRemark);
                // } else {
                //     this.detailBtn.active = false;
                // }
            } else {
                let re = cc.instantiate(this.recordInfo);
                re.y = -124;
                this.node.addChild(re);
                this.loadRecordInfo(re, false, v);
            }
        })
    }

    loadRecordInfo(recordInfo: cc.Node, isMy: boolean, playerData: any) {
        let headSprite = recordInfo.getChildByName("head").getComponent(cc.Sprite);
        if (playerData.head) {
            SpriteLoadUtil.loadSprite(headSprite, playerData.head);
        }
        let nicknameLabel = recordInfo.getChildByName("nickname").getComponent(cc.Label);
        nicknameLabel.string = playerData.nickname;

        let huPaiNameLabel = recordInfo.getChildByName("huPaiName").getComponent(cc.Label);
        if (playerData.huPaiName) {
            huPaiNameLabel.string = playerData.huPaiName;
        } else {
            huPaiNameLabel.string = "未胡牌";
        }
        let winlossLabel = recordInfo.getChildByName("winloss").getComponent(cc.Label);
        let userInfoLabel = recordInfo.getChildByName("radiusRect").getChildByName("user").getComponent(cc.Label);

        if (playerData.winloss >= 0) {
            recordInfo.getChildByName("win").active = true;
            recordInfo.getChildByName("lose").active = false;

            let color = cc.color().fromHEX("#FF0000")
            winlossLabel.node.color = color;
            winlossLabel.string = "+" + playerData.winloss;
        } else {
            recordInfo.getChildByName("win").active = false;
            recordInfo.getChildByName("lose").active = true;

            let color = cc.color().fromHEX("#008567")
            winlossLabel.node.color = color;
            winlossLabel.string = playerData.winloss + "";
        }
        if (isMy) {
            this.detailBtn.active = true;
            userInfoLabel.string = "本家";
        } else {
            userInfoLabel.string = "对家";
            recordInfo.getChildByName("win").active = false;
            recordInfo.getChildByName("lose").active = false;
        }

        let pengValue = playerData.pengValues;
        let gangValue = playerData.gangValues;
        let shouValue = playerData.shouValues;
        let huValue = playerData.huValues;

        let pokerNode = recordInfo.getChildByName("poker");
        pokerNode.removeAllChildren();
        if (pengValue.length > 0) {
            pengValue.forEach(v => {
                pokerNode.addChild(this.buildPengCard(v));
            });
        }

        if (gangValue.length > 0) {
            gangValue.forEach(v => {
                pokerNode.addChild(this.buildGangCard(v));
            });
        }

        pokerNode.addChild(this.buildShouCard(shouValue));

        if (huValue.length > 0) {
            pokerNode.addChild(this.buildHuCard(huValue));
        }
    }

    buildPengCard(mjValue: number) {
        let cardNode = this.buildCardContainer();

        for (let i = 0; i < 3; i++) {
            let node = this.buildCardItemPrefab(mjValue);
            cardNode.addChild(node);
        }

        return cardNode;
    }

    buildGangCard(mjValue: number) {
        let cardNode = this.buildCardContainer();

        let secondCard: cc.Node = null;
        for (let i = 0; i < 3; i++) {
            let node = this.buildCardItemPrefab(mjValue);
            cardNode.addChild(node);

            if (i === 1) {
                secondCard = node;
            }
        }

        // 第4张的牌杠牌放到第二张的上面
        let node = this.buildCardItemPrefab(mjValue);
        node.y = 26;
        secondCard.addChild(node);

        return cardNode;
    }

    buildHuCard(mjValue: number[]) {
        let cardNode = this.buildCardContainer();

        mjValue.forEach(v => {
            let node = this.buildCardItemPrefab(mjValue);
            cardNode.addChild(node);
        });

        return cardNode;
    }

    buildShouCard(mjValue: number[]) {
        let cardNode = this.buildCardContainer();

        mjValue.forEach(v => {
            let node = this.buildCardItemPrefab(v);
            cardNode.addChild(node);
        });

        return cardNode;
    }

    buildCardContainer() {
        let cardNode = new cc.Node();
        let layout = cardNode.addComponent(cc.Layout);
        layout.type = cc.Layout.Type.HORIZONTAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

        return cardNode;
    }

    buildCardItemPrefab(mjValue) {
        // 从游戏记录中获取的牌值需要加+1，由于结算的时候保存到数据库的牌值是没有加+1的
        if (this.bg.active) {
            mjValue++;
        }
        let cardItemPrefab = cc.instantiate(this.cardItemPrefab)
        let script = <CardItemView>cardItemPrefab.getComponent("CardItemView");
        script.show("mine", "fall", mjValue);

        cardItemPrefab.x = 0;
        cardItemPrefab.y = 0;

        return cardItemPrefab;
    }

    loadItemContent(detailRemark: string[]) {
        this.detailItemContent.removeAllChildren();
        if (!detailRemark) {
            return;
        }
        for (const detailValue of detailRemark) {
            let values = detailValue.split(",");

            let content = cc.instantiate(this.itemContent);
            content.active = true;
            for (let index = 0; index < content.childrenCount; index++) {
                const tmpNode = content.children[index];
                tmpNode.getComponent(cc.Label).string = values[index];
            }

            this.detailItemContent.addChild(content);
        }
    }

}
