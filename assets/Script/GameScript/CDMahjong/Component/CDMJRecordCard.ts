import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import CardItemView from '../../Component/DdYiMahjong/CardItemView';
import { CDMJProxyDefine } from '../CDMJConst/CDMJProxyDefine';
import { CDMJDeskProxy } from '../CDMJDeskProxy';
import { DeskRepository } from '../CDMJDeskRepository';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CDMJRecordCard extends ViewComponent {

    @property(cc.Prefab)
    CardItemNode: cc.Prefab = null;

    @property(cc.Node)
    closeBtu: cc.Node = null;

    @property(cc.Node)
    cardLine: cc.Node = null;

    @property(cc.Node)
    corner_count: cc.Node = null;

    getData(): DeskRepository {
        return (Facade.Instance.retrieveProxy(CDMJProxyDefine.CDMJDesk) as CDMJDeskProxy).repository;
    }

    bindUI() {
        let outCard = {}; let arrList = [];
        for (let i = 1; i <= 27; i++) outCard['c_' + i] = 0;
        arrList = arrList.concat(this.getData().gameData.myCards.outCardList);
        this.getData().gameData.myCards.touchCard.forEach(item => outCard['c_' + item] += 3);
        this.getData().gameData.myCards.barCard.forEach(item => outCard['c_' + item.barCard] += 4);
        if (this.getData().gameData.myCards.handCard) outCard['c_' + this.getData().gameData.myCards.handCard]++;
        if (this.getData().gameData.myCards.hadHuCard) outCard['c_' + this.getData().gameData.myCards.hadHuCard]++;
        this.getData().gameData.myCards.curCardList.forEach(item => outCard['c_' + item]++);
        
        this.getData().gameData.partnerCardsList.forEach(p => {
            arrList = arrList.concat(p.partnerCards.outCardList);
            p.partnerCards.touchCard.forEach(item => outCard['c_' + item] += 3);
            p.partnerCards.barCard.forEach(item => outCard['c_' + item.barCard] += 4);
            if (p.partnerCards.hadHuCard) outCard['c_' + p.partnerCards.hadHuCard]++;
        })

        arrList.forEach(item => { outCard['c_' + item]++; });
        //const outCard=this.getData().gameData.myCards.outCardList;
        for (let i = 1; i <= 27; i++) {
            const cardItem = <cc.Node>cc.instantiate(this.CardItemNode);
            (cardItem.getComponent('CardItemView') as CardItemView).show('mine', 'setUp', i);
            cardItem.setScale(0.9);
            this.node.getChildByName('wrapNode').addChild(cardItem);
            // const remainLabel = new cc.Node('remainCount');
            // remainLabel.addComponent(cc.Label).string = (4 - outCard['c_' + i]) + '';
            if (4 - outCard['c_' + i] === 0) {
                (cardItem.getComponent('CardItemView') as CardItemView).setDisable();
            } else {
                const remainLabel = cc.instantiate(this.corner_count); remainLabel.active = true;
                remainLabel.getChildByName('count').getComponent(cc.Label).string = (4 - outCard['c_' + i]) + '';
                cardItem.addChild(remainLabel);
            }
        }
    }

    bindEvent() {
        this.closeBtu.on(cc.Node.EventType.TOUCH_END, () => {
            cc.tween(this.node).to(0.1, { opacity: 0, scale: 0.9 }).call(() => {
                this.node.destroy();
            }).start();
        }, this);
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
