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
    //#region 
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
    //#endregion
    public cardNumber: number;
    public mod: ModType;
    public position: PositionType;
    public scale: number;
    public isPress = false;
    public isDrag = false;
    public isAvtive = false;//是否允许出牌
    public isChoose = false;
    public isStress = false;
    private launch: () => void;
    private cardDir: Array<String> = ['', 'wan1', 'wan2', 'wan3', 'wan4', 'wan5', 'wan6', 'wan7', 'wan8', 'wan9', 'tong1', 'tong2', 'tong3', 'tong4', 'tong5', 'tong6', 'tong7', 'tong8', 'tong9', 'tiao1', 'tiao2', 'tiao3', 'tiao4', 'tiao5', 'tiao6', 'tiao7', 'tiao8', 'tiao9']

    onLoad() {
        this.setArrows();
    }
    start() {

    }
    public setArrows(active?: boolean) {
        const arrows = this.node.getChildByName('cardArrows');
        const _action2 = cc.repeatForever(
            cc.sequence(
                cc.moveBy(0.3, 0, -10),
                cc.moveBy(0.3, 0, 10),
                cc.callFunc(() => { })));
        if (active) {

            arrows.active = true;
            arrows.runAction(_action2);
        } else {
            //arrows.stopAllActions();
            arrows && (arrows.active = false);
        }

    }
    /**设置是否选中 */
    public setStress(stress?: boolean) {
        const cardChoose = this.node.getChildByName('cardChoose');
        const _action1 = cc.repeatForever(
            cc.sequence(
                cc.scaleTo(0.3,50),
                cc.scaleTo(0.3, 255),
                cc.callFunc(() => { })));

        if (stress) {
            cardChoose.active = true;
            cardChoose.runAction(_action1);
        } else {
            stress && (cardChoose.active = false);
        }

    }
    /**设置是否可以出牌操作 */
    public setActive(active: boolean): void {
        this.isAvtive = active;
    }
    /**复位 */
    public reSetChooseFalse(): void {
        this.isChoose = this.isPress = this.isDrag = false;
        cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
    }
    /**绑定出牌事件 */
    public bindLaunch(launch) {
        this.launch = launch;
    }
    bindEvent(touchEndCallback: (node: cc.Node) => void): void {
        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            this.isPress = true;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent) => {
            if (this.isPress) {
                this.isChoose = true;
                this.isDrag = true;
                //通过touchEvent获取当前触摸坐标点
                let location = touchEvent.getLocation();
                //修改节点位置，注意要使用父节点进行对触摸点进行坐标转换
                this.node.position = this.node.parent.convertToNodeSpaceAR(location);
            }
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, (touchEvent) => {
            this.onTouchDoneCallBack(touchEndCallback, touchEvent)
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (touchEvent) => {
            this.onTouchDoneCallBack(touchEndCallback, touchEvent)
        }, this);
    }
    private onTouchDoneCallBack(touchEndCallback, touchEvent) {
        touchEndCallback && touchEndCallback.call(this);
        if (!this.isChoose) {
            cc.tween(this.node).to(0.1, { position: cc.v3(0, 15) }).start();
        } else {
            if (this.isAvtive) {
                this.isAvtive && this.launch && this.launch.call(this, this.node);
            } else {
                cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
            }
        }
        this.isChoose = !this.isChoose;
        this.isPress = this.isDrag = false;
    }
    show(position: PositionType, mod: ModType, cardNumber?: number, option?: {
        scale?: number,
        active?: boolean,
        touchEndCallback?: (node: cc.Node) => void
    }): void {
        this.cardNumber = cardNumber ? cardNumber : -1;
        this.mod = mod;
        this.position = position;
        const cardComp = this.node.getComponent(cc.Sprite);
        const faceNode = this.node.getChildByName('face');
        faceNode.setScale(0.9, 0.9);
        switch (this.position) {
            case 'mine':
                //玩家牌
                if (this.mod === 'setUp') {
                    cardComp.spriteFrame = this.mainCardbg;
                    this.isAvtive = (option && option.active) ? true : false;
                    this.bindEvent(option && option.touchEndCallback);
                } else if (this.mod === "fall") {
                    cardComp.spriteFrame = this.lieMineCardbg;
                    faceNode.setPosition(cc.v2(0, 22));
                }
                faceNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[cardNumber] as string];
                break;
            case 'front':
                if (this.mod === 'setUp') {
                    cardComp.spriteFrame = this.hideFrontCardbg;
                    faceNode.active = false;
                } else if (this.mod === "fall") {
                    cardComp.spriteFrame = this.lieMineCardbg;
                    faceNode.setPosition(cc.v2(0, 6));
                    faceNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[cardNumber] as string];
                }
                faceNode.setRotation(180)
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
