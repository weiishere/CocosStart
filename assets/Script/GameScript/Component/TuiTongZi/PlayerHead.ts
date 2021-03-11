// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

import ViewComponent from "../../Base/ViewComponent";
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';

@ccclass
export default class PlayerHead extends ViewComponent {

    @property(cc.Node)
    nickName: cc.Label = null;

    @property(cc.Node)
    glodInfo: cc.Node = null;

    @property(cc.Node)
    changeMoney: cc.Node = null;

    public playerId: string = '';
    private playerName: string = '玩家';
    private userImage: string = '';
    private glodMum: number = 0;
    private percent: number = 20;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    bindEvent() {

    }
    bindUI() {

    }
    init(id: string, headImg: string, layout: 'landscape' | 'vertical' | 'simple', glod?: Number, name?: string, percent?: number): void {
        const playerHead = this.node;
        const head = playerHead.getChildByName('head');
        const baifenbi = playerHead.getChildByName('headLine').getChildByName('baifenbi');
        const touming = playerHead.getChildByName('headLine').getChildByName('touming');
        const playerName = playerHead.getChildByName('playerName');
        const amount = playerHead.getChildByName('glodInfo').getChildByName('amount');
        SpriteLoadUtil.loadSprite(head.getComponent(cc.Sprite), headImg);
        this.playerId = id;
        if (percent) {
            baifenbi.getComponent(cc.Label).string = percent + '%';
        } else {
            touming.active = false;
            baifenbi.active = false;
        }
        if (name) {
            playerName.getComponent(cc.Label).string = name;
        } else {
            playerName.active = false;
        }
        if (glod !== undefined) {
            amount.getComponent(cc.Label).string = glod.toFixed(2) + '';
        } else {
            playerHead.getChildByName('glodInfo').active = false;
        }
        if (layout === 'landscape') {
            //横向
            if (name) {
                playerName.anchorX = 0;
                playerName.y = 20;
                playerName.x = 55;
            }
            if (name) {
                playerHead.getChildByName('glodInfo').y = -20;
                playerHead.getChildByName('glodInfo').x = 55;
            }
        } else if (layout === 'simple') {
            playerName.active = false;
            playerHead.getChildByName('glodInfo').active = false;
        }
    }
    /**显示输赢数目 */
    showGlodResult(money: number, resultMoney: number) {
        this.changeMoney.active = true;
        this.changeMoney.getChildByName('changeMoney').active = false;
        this.changeMoney.getChildByName('changeMoney_gray').active = false;
        this.node.getChildByName('glodInfo').getChildByName('amount').getComponent(cc.Label).string = resultMoney.toFixed(2) + '';
        if (money !== 0) {
            let changeMoneyNode;
            const incre = money < 0 ? '-' : '+'
            this.changeMoney.getChildByName('incre').getComponent(cc.Label).string = incre;
            if (incre === '+') {
                changeMoneyNode = this.changeMoney.getChildByName('changeMoney');
                this.changeMoney.getChildByName('incre').color = new cc.Color(231, 165, 99, 255);
            } else {
                changeMoneyNode = this.changeMoney.getChildByName('changeMoney_gray');
                this.changeMoney.getChildByName('incre').color = new cc.Color(138, 138, 138, 255);
            }
            
            changeMoneyNode.active = true;
            changeMoneyNode.getComponent(cc.Label).string = money.toFixed(0);
            this.changeMoney.opacity = 0;
            cc.tween(this.changeMoney).to(0.4, { position: cc.v3(0, 60, 0), opacity: 255 }, { easing: 'quintOut' }).delay(3).to(0.2, { position: cc.v3(0, 30, 0), opacity: 0 }).start();
        }
    }
    start() {

    }

    // update (dt) {}
}
