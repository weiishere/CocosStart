// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import CardItemView from '../../Component/DdYiMahjong/CardItemView';
import { CDMJProxyDefine } from '../CDMJConst/CDMJProxyDefine';
import { CDMJDeskProxy } from '../CDMJDeskProxy';
import { DeskRepository } from '../CDMJDeskRepository';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CDMJRtRemainHuCard extends ViewComponent {

    @property(cc.Node)
    ItemNode: cc.Node = null;

    @property(cc.Node)
    closeBtu: cc.Node = null;

    @property(cc.Prefab)
    CardItemNode: cc.Prefab = null;

    getData(): DeskRepository {
        return (Facade.Instance.retrieveProxy(CDMJProxyDefine.CDMJDesk) as CDMJDeskProxy).repository;
    }

    bindUI() {
        this.getData().gameData.myCards.mayHuCardsRT.forEach(item => {
            //[{ huValue: 3, remainNum: 2, fanNum: 3 }, { huValue: 6, remainNum: 1, fanNum: 3 }, { huValue: 9, remainNum: 1, fanNum: 2 }].forEach(item => {
            const itemWrap = cc.instantiate(this.ItemNode);
            const cardItem = <cc.Node>cc.instantiate(this.CardItemNode);
            (cardItem.getComponent('CardItemView') as CardItemView).show('mine', 'setUp', item.huValue);
            itemWrap.addChild(cardItem);
            itemWrap.getChildByName('remainCount').getComponent(cc.Label).string = item.remainNum + "";
            itemWrap.getChildByName('timesCount').getComponent(cc.Label).string = item.fanNum + "";
            itemWrap.active = true;
            this.node.getChildByName('m_panel2').addChild(itemWrap);
        })
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
