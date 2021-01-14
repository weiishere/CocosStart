// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
export type ModType = 'setUp' | 'fall';
export type PositionType = 'mine' | 'front' | 'left' | 'right';

@ccclass
export default class CardItemView extends cc.Component {

    carNum: number = 0;

    @property(cc.SpriteFrame)
    mainCardbg: cc.SpriteFrame = null;//玩家主牌

    @property(cc.SpriteFrame)
    hideLeftCardbg: cc.SpriteFrame = null;//左对手隐藏牌

    @property(cc.SpriteFrame)
    hideFrontCardbg: cc.SpriteFrame = null;//对面对手隐藏牌

    @property(cc.SpriteFrame)
    hideRightCardbg: cc.SpriteFrame = null;//右对手隐藏牌

    // @property(cc.SpriteFrame)
    // lieFrontCardbg: cc.SpriteFrame = null;//对面趟牌

    @property(cc.SpriteFrame)
    lieLeftCardbg: cc.SpriteFrame = null;//左方趟牌

    // @property(cc.SpriteFrame)
    // lieRightCardbg: cc.SpriteFrame = null;//右方趟牌

    @property(cc.SpriteFrame)
    lieMineCardbg: cc.SpriteFrame = null;//玩家趟牌

    @property(cc.SpriteFrame)
    wan1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan4: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan5: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan6: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan7: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan8: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wan9: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    tiao1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao4: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao5: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao6: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao7: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao8: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    tiao9: cc.SpriteFrame = null;

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

    public cardNumber: number;
    public mod: ModType;
    public position: PositionType;
    public scale: number;
    private cardDir: Array<String> = ['wan1', 'wan2', 'wan3', 'wan4', 'wan5', 'wan6', 'wan7', 'wan8', 'wan9', 'tong1', 'tong2', 'tong3', 'tong4', 'tong5', 'tong6', 'tong7', 'tong8', 'tong9', 'tiao1', 'tiao2', 'tiao3', 'tiao4', 'tiao5', 'tiao6', 'tiao7', 'tiao8', 'tiao9']
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    show(position: PositionType, mod: ModType, cardNumber?: number, scale?: number) {
        this.cardNumber = cardNumber;
        this.mod = mod;
        this.position = position;
        let bgFrame;
        const cardComp = this.node.getComponent(cc.Sprite);
        const faceNode = this.node.getChildByName('face');
        faceNode.setScale(0.9,0.9);
        switch (this.position) {
            case 'mine':
                //玩家牌
                if (this.mod === 'setUp') {
                    cardComp.spriteFrame = this.mainCardbg;
                } else if (this.mod === "fall") {
                    cardComp.spriteFrame = this.lieMineCardbg;
                    faceNode.setPosition(cc.v2(0,22));
                }
                faceNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[cardNumber] as string];
                break;
            case 'front':
                //对家牌
                break;
            case 'left':
                //左方牌
                break;
            case 'right':
                //右方牌
                break;
        }
    }
    getFaceByCode() {

    }
    private initCardFaceView() {

    }
    // update (dt) {}
}
