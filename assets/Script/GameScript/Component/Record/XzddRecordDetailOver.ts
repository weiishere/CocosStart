import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { ProxyDefine } from '../../MahjongConst/ProxyDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import { ConfigProxy } from '../../Proxy/ConfigProxy';
import { LocalCacheDataProxy } from '../../Proxy/LocalCacheDataProxy';
import CardItemView from '../DdYiMahjong/CardItemView';
import BaseRecordDetail, { PlayerRecordData } from './BaseRecordDetail';
const { ccclass, property } = cc._decorator;

@ccclass
export default class OpenRecordAlter extends BaseRecordDetail {

    @property(cc.Node)
    recordList: cc.Node = null;
    @property(cc.Node)
    recordInfo: cc.Node = null;
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
    @property(cc.Node)
    oppositionToggleNode: cc.Node = null;
    @property(cc.Node)
    winlossResult: cc.Node = null;
    @property(cc.Prefab)
    cardItemPrefab: cc.Prefab = null;

    _playerData: Array<PlayerRecordData> = null;
    _thisUserName: string;

    /** 游戏人数 */
    _gamePlayerNum: number = 4;

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
        this._playerData = playerData;
        this._gamePlayerNum = this._playerData.length;
        this._thisUserName = userName;
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

        if (this._gamePlayerNum === 3) {
            this.oppositionToggleNode.active = false;
        }

        let thisSeatNo = this.getThisSeatNo(this._thisUserName);

        playerData.sort((v1, v2) => {
            let seatNo1 = v1.seatNo - thisSeatNo;
            seatNo1 = seatNo1 < 0 ? this._gamePlayerNum - 1 : seatNo1;
            let seatNo2 = v2.seatNo - thisSeatNo;
            seatNo2 = seatNo2 < 0 ? this._gamePlayerNum - 1 : seatNo1;
            return seatNo1 - seatNo2;
        });

        playerData.forEach(v => {
            let re = cc.instantiate(this.recordInfo);
            re.active = true;
            if (v.userName === userName) {
                this.loadRecordInfo(re, true, v, "自己");
                this.winlossResult.getComponent("ExtendSprite").index = v.winloss >= 0 ? 0 : 1;
                this.loadItemContent(v.detailRemark);
            } else {
                let playerData = this.getPlayerData(v.seatNo);
                if (playerData) {
                    this.loadRecordInfo(re, thisSeatNo === v.seatNo, playerData, this.getAzimuthName(thisSeatNo, v.seatNo));
                }
            }

            this.recordList.addChild(re);
        })
    }


    getAzimuthName(myAzimuth: number, azimuthType: number) {
        let duiJiaAzimuth = this.getOppositionSeatNo(myAzimuth);
        // 3人麻将没有对家
        if (this._gamePlayerNum === 3) {
            duiJiaAzimuth = -1;
        }
        let shangJiaAzimuth = this.getUpSeatNo(myAzimuth);
        let xiaJiaAzimuth = this.getNextSeatNo(myAzimuth);

        if (duiJiaAzimuth === azimuthType) {
            return "对家";
        } else if (shangJiaAzimuth === azimuthType) {
            return "上家";
        } else if (xiaJiaAzimuth === azimuthType) {
            return "下家";
        }
        return "自己";
    }

    loadRecordInfo(recordInfo: cc.Node, isMy: boolean, playerData: PlayerRecordData, userInfoStr: string) {
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
            let color = cc.color().fromHEX("#FF0000")
            winlossLabel.node.color = color;
            winlossLabel.string = "+" + playerData.winloss;
        } else {
            let color = cc.color().fromHEX("#008567")
            winlossLabel.node.color = color;
            winlossLabel.string = playerData.winloss + "";
        }
        userInfoLabel.string = userInfoStr;

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
        let cardItemPrefab = cc.instantiate(this.cardItemPrefab)
        let script = <CardItemView>cardItemPrefab.getComponent("CardItemView");
        script.show("mine", "fall", mjValue);

        cardItemPrefab.x = 0;
        cardItemPrefab.y = 0;

        return cardItemPrefab;
    }

    getThisSeatNo(userName): number {
        for (const data of this._playerData) {
            if (data.userName === userName) {
                return data.seatNo;
            }
        }

        return -1;
    }

    getPlayerData(seatNo: number) {
        for (const data of this._playerData) {
            if (data.seatNo === seatNo) {
                return data;
            }
        }
        return null;
    }

    /**
     * 根据参数座位号，获得对家座位
     * @param seatNo 
     */
    getOppositionSeatNo(seatNo: number) {
        if (seatNo === 0) {
            return 2;
        } else if (seatNo === 1) {
            return 3;
        } else if (seatNo === 2) {
            return 0;
        } else if (seatNo === 3) {
            return 1;
        }
        return 0;
    }

    getNextSeatNo(seatNo: number) {
        let nextSeatNo = seatNo + 1;
        if (nextSeatNo >= this._gamePlayerNum) {
            nextSeatNo = 0;
        }
        return nextSeatNo;
    }

    getUpSeatNo(seatNo: number) {
        let nextSeatNo = seatNo - 1;
        if (nextSeatNo < 0) {
            nextSeatNo = this._gamePlayerNum - 1;
        }
        return nextSeatNo;
    }

    menuClick(event) {
        let thisSeatNo = this.getThisSeatNo(this._thisUserName);
        let seatNo = 0;
        let userInfoStr = "";
        this.detailItem.active = false;
        if (event.target.name === "thisToggle") {
            seatNo = thisSeatNo;
            userInfoStr = "自己";
        } else if (event.target.name === "oppositionToggle") {
            seatNo = this.getOppositionSeatNo(thisSeatNo);
            userInfoStr = "对家";
        } else if (event.target.name === "nextToggle") {
            seatNo = this.getNextSeatNo(thisSeatNo);
            userInfoStr = "下家";
        } else if (event.target.name === "upToggle") {
            seatNo = this.getUpSeatNo(thisSeatNo);
            userInfoStr = "上家";
        }

        let playerData = this.getPlayerData(seatNo);
        if (playerData) {
            this.loadRecordInfo(this.recordInfo, thisSeatNo === seatNo, playerData, userInfoStr);
        }
    }

    loadItemContent(detailRemark: string[]) {
        this.detailItemContent.removeAllChildren();
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