// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewComponent from "../../Base/ViewComponent";
const { ccclass, property } = cc._decorator;

@ccclass
export default class TTZCardItemView extends ViewComponent {

    private cardDir: Array<String> = ['', 'wan1', 'wan2', 'wan3', 'wan4', 'wan5', 'wan6', 'wan7', 'wan8', 'wan9', 'tong1', 'tong2', 'tong3', 'tong4', 'tong5', 'tong6', 'tong7', 'tong8', 'tong9', 'tiao1', 'tiao2', 'tiao3', 'tiao4', 'tiao5', 'tiao6', 'tiao7', 'tiao8', 'tiao9']
    @property(cc.SpriteFrame)
    faceCardhide: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    faceCardhideOverTurn_1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    faceCardhideOverTurn_2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    mainCardbg: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    tiao1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong4: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong5: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong6: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong7: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong8: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tong9: cc.SpriteFrame = null;

    @property(cc.Node)
    cardNumberNode: cc.Node = null;

    public cardNumber = 0;
    bindEvent() {

    }
    bindUI() {

    }
    /**翻转 */
    overTurn(isAction: boolean) {
        if (this.cardNumber === 0) { return }
        if (this.node.getComponent(cc.Sprite).spriteFrame === this.mainCardbg) {
            //已经是翻开状态
            this.cardNumberNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[this.cardNumber] as string];
            return;
        }
        this.cardNumberNode.active = false;
        if (isAction) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.faceCardhideOverTurn_1;
            cc.tween(this.node)
                .to(0.1, {}).call(() => {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.faceCardhideOverTurn_2;
                })
                .to(0.1, {}).call(() => {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.mainCardbg;
                    this.cardNumberNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[this.cardNumber] as string];
                    this.cardNumberNode.active = true;
                }).start();
        } else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.mainCardbg;
            this.cardNumberNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[this.cardNumber] as string];
            this.cardNumberNode.active = true;
        }
    }
    /**复位（盖住） */
    reset() {
        //this.cardNumber = 0;
        this.cardNumberNode.active = false;
        this.node.getComponent(cc.Sprite).spriteFrame = this.faceCardhide;
    }
    start() {

    }

    // update (dt) {}
}