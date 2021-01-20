// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { MayHuCard } from "../repositories/DeskRepository";

const { ccclass, property } = cc._decorator;
export type ModType = 'setUp' | 'fall';
export type FallShowStatus = 'display' | 'hide';
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
    hideFrontFallCardbg: cc.SpriteFrame = null;//对面对手趟下的隐藏牌

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
    private mayHuCardWrap: cc.Node;
    public cardNumber: number;
    public mod: ModType;
    public position: PositionType;
    public scale: number;
    public isPress = false;
    public isDrag = false;
    public isActive = false;//是否允许出牌
    public isChoose = false;
    public isStress = false;
    public isDisable = true;
    public mayHuCards: MayHuCard = null;
    private launch: () => void;
    /**抽出牌 */
    private extractionUp: (cardNumber: number) => void;
    private cardDir: Array<String> = ['', 'wan1', 'wan2', 'wan3', 'wan4', 'wan5', 'wan6', 'wan7', 'wan8', 'wan9', 'tong1', 'tong2', 'tong3', 'tong4', 'tong5', 'tong6', 'tong7', 'tong8', 'tong9', 'tiao1', 'tiao2', 'tiao3', 'tiao4', 'tiao5', 'tiao6', 'tiao7', 'tiao8', 'tiao9']
    private dragStartPosition: cc.Vec2 = null;
    onLoad() {

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
                cc.fadeTo(0.4, 50),
                cc.fadeTo(0.4, 255),
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
        this.isActive = active;
    }
    /**设置可胡的牌 */
    public setHuCard(mayHuCards: MayHuCard): void {
        this.mayHuCards = mayHuCards;
        this.node.getChildByName("down").active = true;//设置可胡的牌
    }
    /**设置为禁用(置灰) */
    setDisable() {
        this.isDisable = false;
        const faceNode = this.node.getChildByName('face');
        this.node.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.GRAY_SPRITE + ''));
        faceNode.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial(cc.Material.BUILTIN_NAME.GRAY_SPRITE + ''));
    }
    /**复位 */
    public reSetChooseFalse(): void {
        this.isChoose = this.isPress = this.isDrag = false;
        cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
        this.mayHuCardWrap && (this.mayHuCardWrap.active = false);
    }
    /**绑定出牌事件 */
    public bindLaunch(launch) {
        this.launch = launch;
    }
    bindEvent(touchEndCallback: (node: cc.Node) => void): void {
        const self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, (touchEvent) => {
            if (!this.isDisable) return;
            this.isPress = true;
            this.dragStartPosition = touchEvent.getLocation();
            this.mayHuCardWrap && (this.mayHuCardWrap.active = false);
            this.node.getChildByName('down').active = false;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent) => {
            //通过touchEvent获取当前触摸坐标点
            if (!this.isDisable) return;
            let location = touchEvent.getLocation();
            if (location.y - this.dragStartPosition.y > 80) {
                if (this.isPress) {
                    this.isChoose = true;
                    this.isDrag = true;
                }
            }
            //修改节点位置，注意要使用父节点进行对触摸点进行坐标转换
            this.node.position = this.node.parent.convertToNodeSpaceAR(location);
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END, (touchEvent) => {
            if (!this.isDisable) return;
            this.onTouchDoneCallBack(touchEndCallback, touchEvent)
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (touchEvent) => {
            if (!this.isDisable) return;
            this.onTouchDoneCallBack(touchEndCallback, touchEvent)
        }, this);
    }
    /**绑定抽出事件 */
    bindExtractionUp(extractionUp: (cardNumber: number) => void) {
        this.extractionUp = extractionUp;
    }
    private onTouchDoneCallBack(touchEndCallback, touchEvent) {
        touchEndCallback && touchEndCallback.call(this);
        this.mayHuCards && this.mayHuCards.huList.length !== 0 && (this.node.getChildByName('down').active = true); 
        if (!this.isChoose) {
            cc.tween(this.node).to(0.1, { position: cc.v3(0, 20) }).start();
            this.extractionUp && this.extractionUp(this.cardNumber);
            if (this.mayHuCards) {
                //抽出显示可胡牌
                this.mayHuCardWrap = this.node.getChildByName("mayHuCardWrap");
                this.mayHuCardWrap.active = true;
                this.mayHuCardWrap.zIndex = 10;
                this.mayHuCardWrap.removeAllChildren();
                this.mayHuCards.huList.forEach((item) => {
                    const newNode = new cc.Node('themayhucard');
                    newNode.setPosition(cc.v2(0, 20));
                    newNode.width = 140;
                    newNode.height = 130;

                    const cardBg = new cc.Node('cardBg');
                    const cardBgComp = cardBg.addComponent(cc.Sprite);
                    cardBgComp.spriteFrame = this.mainCardbg;


                    const cardFace = new cc.Node('cardFace');
                    const cardFaceComp = cardFace.addComponent(cc.Sprite);
                    const weiget = cardFaceComp.addComponent(cc.Widget);
                    weiget.isAlignHorizontalCenter = true;// .horizontalCenter = 1;
                    weiget.isAlignVerticalCenter = true;
                    cardFaceComp.spriteFrame = this[this.cardDir[item.huCard] as string];
                    cardBg.addChild(cardFace);
                    newNode.addChild(cardBg);
                    newNode.setScale(0.6, 0.6);

                    const winInfoNode = new cc.Node('winInfo');
                    winInfoNode.setPosition(cc.v2(0, -100));
                    const winInfoLabe = winInfoNode.addComponent(cc.Label);
                    winInfoLabe.string = `翻数：${item.fanShu}\n剩余：${item.remainNum}`;
                    winInfoLabe.fontSize = 22;
                    winInfoLabe.lineHeight = 26;
                    newNode.addChild(winInfoNode);

                    //const newNodeWeiget = cardFaceComp.addComponent(cc.Widget);
                    // newNodeWeiget.left = 20;
                    // newNodeWeiget.right = 20;
                    // const labelComp = newNode.addComponent(cc.Label);
                    // labelComp.string = `翻数：${item.fanShu}\n剩余：${item.remainNum}`;
                    this.mayHuCardWrap.addChild(newNode);
                });
            }
        } else {
            let location = touchEvent.getLocation();
            if (this.isActive) {
                //需要拖远点才能打出，不然需要恢复原位，或者抽出状态下却不是拖拽状态需要打出
                if ((location.y - this.dragStartPosition.y > 80 && this.isDrag) || !this.isDrag) {
                    this.isActive && this.launch && this.launch.call(this, this.node);
                } else {
                    cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
                }
            } else {
                cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();

            }
            // if (location.y - this.dragStartPosition.y <= 50) {
            //     //this.reSetChooseFalse();
            //     cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
            // } else {
            //     if (this.isAvtive) {
            //         this.isAvtive && this.launch && this.launch.call(this, this.node);
            //     } else {
            //         cc.tween(this.node).to(0.1, { position: cc.v3(0, 0) }).start();
            //     }
            // }
        }
        this.isChoose = !this.isChoose;
        this.isPress = this.isDrag = false;
    }
    show(position: PositionType, mod: ModType, cardNumber?: number, option?: {
        scale?: number,
        active?: boolean,
        fallShowStatus?: FallShowStatus,
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
                    this.isActive = (option && option.active) ? true : false;
                    this.bindEvent(option && option.touchEndCallback);
                } else if (this.mod === "fall") {
                    if (option && option.fallShowStatus && option.fallShowStatus === 'hide') {
                        cardComp.spriteFrame = this.hideFrontFallCardbg;
                        faceNode.active = false;
                    } else {
                        cardComp.spriteFrame = this.lieMineCardbg;
                    }
                    faceNode.setPosition(cc.v2(0, 22));
                }
                faceNode.getComponent(cc.Sprite).spriteFrame = this[this.cardDir[cardNumber] as string];
                break;
            case 'front':
                if (this.mod === 'setUp') {
                    cardComp.spriteFrame = this.hideFrontCardbg;
                    faceNode.active = false;
                } else if (this.mod === "fall") {
                    if (option && option.fallShowStatus && option.fallShowStatus === 'hide') {
                        cardComp.spriteFrame = this.hideFrontFallCardbg;
                        faceNode.active = false;
                    } else {
                        cardComp.spriteFrame = this.lieMineCardbg;
                    }
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
