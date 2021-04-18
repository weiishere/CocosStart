// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtendSprite extends cc.Component {

    @property(cc.SpriteFrame)
    spriteFrames: cc.SpriteFrame[] = [];

    _index: number = 0;
    _sprite: cc.Sprite = null;

    start() {

    }

    get index() {
        return this._index;
    }
    set index(_index: number) {
        this._index = _index;

        this._setSpriteFrame();
    }

    _setSpriteFrame() {
        if (!this._sprite) {
            this._sprite = this.node.getComponent(cc.Sprite);
            if (!this._sprite) {
                return;
            }
        }

        let spriteFrame = this.spriteFrames[this._index];
        if (!spriteFrame) {
            this._sprite.spriteFrame = null;
            return;
        }
        this._sprite.spriteFrame = spriteFrame;
    }

    // update (dt) {}
}
