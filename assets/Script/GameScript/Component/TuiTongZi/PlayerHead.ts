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

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    private playerId: string = '';
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
    init(id: string, headImg: string, glod?: number, name?: string, percent?: number): void {
        const playerHead = this.node.getChildByName('playerHead');
        const head = playerHead.getChildByName('head');
        const baifenbi = playerHead.getChildByName('headLine').getChildByName('baifenbi');
        const touming = playerHead.getChildByName('headLine').getChildByName('touming');
        const playerName = playerHead.getChildByName('playerName');
        const amount = playerHead.getChildByName('heagInfoBg').getChildByName('amount');
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
        if (glod) {
            amount.getComponent(cc.Label).string = glod + '';
        } else {
            playerHead.getChildByName('heagInfoBg').active = false;
        }
    }
    start() {

    }

    // update (dt) {}
}
