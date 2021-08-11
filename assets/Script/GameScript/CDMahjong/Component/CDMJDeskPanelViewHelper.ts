import CardItemView, { PositionType } from '../../Component/DdYiMahjong/CardItemView';
import { PartnerCard, BarType } from '../CDMJDeskRepository';
import CDMJDeskPanelView from './CDMJDeskPanelView';
const helper = {
    /**换三张的抽出牌helper，是否可以抽出 */
    bindSwitchExtractionUpHelper: function (cardNumber) {
        const self: CDMJDeskPanelView = this;
        const wan = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const tong = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        const tiao = [19, 20, 21, 22, 23, 24, 25, 26, 27];
        //const faceArr = [{ name: 'wan', list: wan }, { name: 'tong', list: tong }, { name: 'tiao', list: tiao }];
        const faceArr = [wan, tong, tiao];
        const chooseSwitchCard = self.mainCardList.filter(card => (card.getComponent("CardItemView") as CardItemView).isChoose).map(card => (card.getComponent("CardItemView") as CardItemView).cardNumber);

        let thenFace: Array<number> = faceArr.find(item => {
            return item.indexOf(cardNumber) !== -1 ? true : false;
        });
        //先判断点出来的牌的同花色数量是否小于3
        let _count = 0;
        if (thenFace.indexOf(self.getData().gameData.myCards.handCard) !== -1) _count++;
        _count += self.getData().gameData.myCards.curCardList.filter(item => {
            return thenFace.indexOf(item) !== -1 ? true : false;
        }).length;

        let lastFace = chooseSwitchCard.length === 0 ? [] : faceArr.find(item => {
            return item.indexOf(chooseSwitchCard[0]) !== -1 ? true : false;
        });
        if (!lastFace) return true;
        if (lastFace.indexOf(cardNumber) === -1) {
            //当前选择的牌是否与之前的选择的花色不同，之前的全部落下

            if (_count >= 3) this.mainCardList.forEach(card => (card.getComponent("CardItemView") as CardItemView).reSetChooseFalse());
        } else {
            //花色相同
            //if (chooseSwitchCard.length === 3) return false;
            if (chooseSwitchCard.length === 3) {
                const _last = self.mainCardList.filter(card => (card.getComponent("CardItemView") as CardItemView).isChoose)[2];
                (_last.getComponent("CardItemView") as CardItemView).reSetChooseFalse();
            }
        }
        return _count < 3 ? false : true;
    },
    /**-----更新杠、碰牌组辅助方法 */
    updateMyBarAndTouchCardHelper: function (partner: PartnerCard, playerBarCard: cc.Node, playerTouchCard: cc.Node, position: PositionType) {
        const self: CDMJDeskPanelView = this;
        helper.isAllowUpdatehelper<BarType>(playerBarCard, partner.partnerCards.barCard, (param) => param.barCard, (item) => {
            const barItem = new cc.Node('barItem');
            const layoutCom = barItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (position === 'front') {
                if (item.barType === 0 || item.barType === 1) {
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-144, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 28) });
                } else if (item.barType === 2) {
                    //----------------------------------------暗杠,最上面一张需要盖住
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-144, 0) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(-72, 29), fallShowStatus: 'hide' });
                }
            } else {
                if (item.barType === 0 || item.barType === 1) {
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 90) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 60) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 30) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 74) });
                } else if (item.barType === 2) {
                    //----------------------------------------暗杠,最上面一张需要盖住
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 90) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 60) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 30) });
                    self.addCardToNode(barItem, item.barCard, position, "fall", { position: cc.v2(0, 74), fallShowStatus: 'hide' });
                }
            }
            return barItem;
        })


        helper.isAllowUpdatehelper<number>(playerTouchCard, partner.partnerCards.touchCard, (param) => param, (item) => {
            const touchItem = new cc.Node('touchItem');
            const layoutCom = touchItem.addComponent(cc.Layout);
            layoutCom.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            if (position === 'front') {
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(-72, 0) });//.setPosition(cc.v2(-36, 0));
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(72, 0) });//.setPosition(cc.v2(36, 0));
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(0, 28));
            } else {
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 32) });//.setPosition(cc.v2(-36, 0));
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, 0) });//.setPosition(cc.v2(36, 0));
                self.addCardToNode(touchItem, item, position, "fall", { position: cc.v2(0, -32) });//.setPosition(cc.v2(0, 28));
            }
            return touchItem;
        });
    },
    dingzhangIconBuild: function (headNode: cc.Node, dz: number) {
        if (dz === -1) {
            const _face = headNode.getChildByName("face");
            if (_face) {
                _face.destroy();
                headNode.removeChild(_face);
            }
            return;
        } else {
            const _face = headNode.getChildByName("face");
            if (_face) {
                return;
            }
        }

        // const fase = headNode.getChildByName('face');
        // if (fase) { headNode.removeChild(fase); fase.destroy(); }
        const newNode = new cc.Node('face');
        const sprite = newNode.addComponent(cc.Sprite);
        newNode.setScale(0.8);
        //newNode.setRotation(180);
        newNode.angle = -180;
        newNode.opacity = 0;
        newNode.x += 40;
        newNode.y += 80;
        cc.loader.loadRes(`textures/desk/desk`, cc.SpriteAtlas, (err, item) => {
            //0：万 1： 筒 2： 条
            sprite.spriteFrame = item.getSpriteFrame(['img_wan', 'img_tong', 'img_tiao'][dz]);
        });
        headNode.addChild(newNode);
        cc.tween(newNode).to(0.3, { scale: 0.4, opacity: 255, rotation: 0 }).start();
    },
    updateHandCardAndHuCardHelper: function (partner: PartnerCard, playerHuCard: cc.Node, tingNode: cc.Node, huNode: cc.Node, position: PositionType): void {
        const self: CDMJDeskPanelView = this;
        if (helper.isHadHu(self, partner.playerId) && playerHuCard.children.length !== 0) return;
        const _hadHuCard = self.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.hadHuCard;
        playerHuCard.destroyAllChildren();
        playerHuCard.width = 0;
        playerHuCard.height = 0;
        if (_hadHuCard !== 0) {
            self.addCardToNode(playerHuCard, _hadHuCard, position, 'fall');
        }
        //对家是否听牌
        const status = self.getData().gameData.partnerCardsList.find(item => item.playerId === partner.playerId).partnerCards.status;
        if (status.isBaoHu) {
            tingNode.active = true;
        }
        huNode.active = status.isHadHu;
        if (status.isHadHu) {
            if (status.huType === 1) huNode.getChildByName('zimoSign').active = true;
            else huNode.getChildByName('huSign').active = true;
        }
    },
    createOutCardHelper: function (playerOutCardList: cc.Node, playerIndex: number, scale: number, position: PositionType): cc.Node {
        const self: CDMJDeskPanelView = this;
        const player = self.getPlayerByIndex(playerIndex);
        const partner: PartnerCard = self.getData().gameData.partnerCardsList.find(item => item.playerId === player.playerId);
        const card = self.addCardToNode(playerOutCardList, partner.partnerCards.outCardList[partner.partnerCards.outCardList.length - 1], position, "fall")
        card.setPosition(cc.v2(0, 0));
        card.setScale(scale);
        return card;
    },
    updateOutCardHelper: function (partner: PartnerCard, playerOutCardList: cc.Node, scale: number, position: PositionType) {
        const self: CDMJDeskPanelView = this;
        if (helper.isHadHu(self, partner.playerId) && playerOutCardList.children.length !== 0) return;
        playerOutCardList.destroyAllChildren();
        partner.partnerCards.outCardList.map((item, index) => {
            const card = self.addCardToNode(playerOutCardList, item, position, "fall")
            card.setPosition(cc.v2(0, 0));
            card.setScale(scale);
        });
    },
    isAllowUpdatehelper<T>(parentNode: cc.Node, source: Array<T>, getNumber: (param: T) => number, addItemHandler: (cardNumber: T) => cc.Node, addHandler?: () => void): boolean {
        if (source.length === 0) {
            parentNode.destroyAllChildren();
            parentNode.width = 0;
            parentNode.height = 0;
            return false;
        } else if (source.length > 0) {
            if (parentNode.children.length === source.length) {
                return false;
            } else if (parentNode.children.length > source.length) {
                parentNode.destroyAllChildren();
                parentNode.width = 0;
                parentNode.height = 0;
                source.forEach(item => parentNode.addChild(addItemHandler(item)));
            } else if (parentNode.children.length < source.length) {
                source.forEach(so => {
                    const isCloud = parentNode.children.length === 0 ? false : parentNode.children.some(child => {
                        const c = child.children[0].getComponent("CardItemView") as CardItemView;
                        return c.cardNumber === getNumber(so);
                    });
                    if (!isCloud) {
                        parentNode.addChild(addItemHandler(so));
                    }
                })
                addHandler && addHandler();
            }
        }
    },
    /**如果已经胡牌了返回true */
    isHadHu: (that: CDMJDeskPanelView, playerId: string): boolean => {
        const _gameIndex = that.getIndexByPlayerId(playerId).gameIndex;
        let playerHuCard: cc.Node;
        if (that.positionNode[_gameIndex].name === 'p-top') {
            playerHuCard = that.frontHuCard;
        } else if (that.positionNode[_gameIndex].name === 'p-left') {
            playerHuCard = that.leftHuCard;
        } else if (that.positionNode[_gameIndex].name === 'p-right') {
            playerHuCard = that.rightHuCard;
        } else if (that.positionNode[_gameIndex].name === 'p-bottom') {
            playerHuCard = that.huCard;
        }
        const partnerPlayer = that.getData().gameData.partnerCardsList.find(item => item.playerId === playerId);
        let _hadHuCard = partnerPlayer ? partnerPlayer!.partnerCards.hadHuCard : that.getData().gameData.myCards.hadHuCard;
        return _hadHuCard !== 0 && playerHuCard.children.length !== 0;//已经胡了就不更新了
    }
}

export default helper;