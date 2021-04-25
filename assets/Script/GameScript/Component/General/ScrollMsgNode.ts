// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollMsgNode extends cc.Component {

    @property(cc.Node)
    maskNode: cc.Node = null;

    @property(cc.Label)
    label: cc.Label = null;

    /**
     * 滚动内容
     */
    private contentArr: Array<string> = [];
    private contentIndex: number = 0;
    startPos: cc.Vec2 = null

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (this.contentArr.length == 0) {
            this.node.active = false
        }
    }

    start() {
    }

    public updateContent(content: string) {
        this.contentArr = [];
        this.contentArr.push(content);
    }

    public createContent(content: string, width?: number, spriteFrame?: cc.SpriteFrame,): void {
        if (content == null || content.length == 0) {
            return
        }
        if (width) {
            this.node.getChildByName("MaskNode").width = width;
        }
        if (spriteFrame) {
            (this.node.getChildByName("MaskNode") as cc.Node).getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }
        this.contentArr.push(content);

        this.node.active = true;
        this.updateLabel();
    }

    private updateLabel() {
        this.contentIndex = this.contentIndex === this.contentArr.length - 1 ? 0 : (this.contentIndex + 1);
        this.label.string = this.contentArr[this.contentIndex];
    }

    onDestroy() {
        if (this.label.node) {
            if (this.label.node.getActionByTag(0) != null) {
                this.label.node.stopAction(this.label.node.getActionByTag(0))
            }
        }
    }
    update(dt) {
        if (this.label.node.x < -(this.label.node.width + this.node.width / 2)) {
            this.updateLabel();

            this.label.node.x = this.node.width / 2;
        }

        // 70 表示滚动的速度
        this.label.node.x -= dt * 70;
    }
}
