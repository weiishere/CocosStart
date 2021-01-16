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
import CardItemView from './CardItemView';
const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordPanel extends ViewComponent {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    recordInfo: cc.Node = null;
    @property(cc.Label)
    roomNoLabel: cc.Label = null;
    @property(cc.Label)
    roundLabel: cc.Label = null;
    @property(cc.Prefab)
    cardItemPrefab: cc.Prefab = null;


    protected bindUI(): void {

    }
    protected bindEvent(): void {
    }

    public getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    public getLocalCacheDataProxy() {
        return <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    start() {
        // this.loadData(n);
        this.loadData(false, "123", 123123, 1, 10, [
            {
                userName: "123", head: "", nickname: "123", huPaiName: "12321", winloss: -10,
                pengValues: [1], gangValues: [1], shouValues: [2], huValues: [2]
            },
            {
                userName: "321", head: "", nickname: "123", huPaiName: "12321", winloss: 10,
                pengValues: [1], gangValues: [1], shouValues: [2], huValues: [2]
            }
        ]);
    }

    loadData(hideBG: boolean, userName: string, roomNo: number, currentGameCount: number, totalGameCount: number,
        playerData: Array<{
            userName: string, head: string, nickname: string, huPaiName: string, winloss: number, pengValues: number[],
            gangValues: number[], shouValues: number[], huValues: number[]
        }>) {
        this.bg.active = !hideBG;
        this.roomNoLabel.string = "房间号：" + roomNo;
        this.roundLabel.string = "局数：" + currentGameCount + "/" + totalGameCount;

        playerData.forEach(v => {
            if (v.userName === userName) {
                this.loadRecordInfo(this.recordInfo, true, v);
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
        huPaiNameLabel.string = playerData.huPaiName;
        let winlossLabel = recordInfo.getChildByName("winloss").getComponent(cc.Label);
        let userInfoLabel = recordInfo.getChildByName("radiusRect").getChildByName("user").getComponent(cc.Label);
        if (isMy) {
            userInfoLabel.string = "自己";
        } else {
            userInfoLabel.string = "对家";
        }

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

        pokerNode.scale = 0.5;
        pokerNode.x = -70;
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
        let cardItemPrefab = cc.instantiate(this.cardItemPrefab)
        let script = <CardItemView>cardItemPrefab.getComponent("CardItemView");
        script.show("mine", "fall", mjValue);

        cardItemPrefab.x = 0;
        cardItemPrefab.y = 0;

        return cardItemPrefab;
    }

    // update (dt) {}
}
