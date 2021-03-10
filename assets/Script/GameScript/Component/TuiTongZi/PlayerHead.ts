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
    showGlodResult(money) {
        this.changeMoney.active = true;
        this.changeMoney.getChildByName('changeMoney').getComponent(cc.Label).string = (money < 0 ? '-' : '+') + money;
        this.changeMoney.x -= 100;
        this.changeMoney.opacity = 0;
        cc.tween(this.changeMoney).by(0.2, { position: cc.v3(100, 0, 0), opacity: 255 }).delay(3).by(0.2, { position: cc.v3(-100, 0, 0), opacity: 0 }).start();
    }
    start() {

    }

    // update (dt) {}
}
