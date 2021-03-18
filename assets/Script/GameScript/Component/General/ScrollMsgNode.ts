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
        this.startPos = cc.v2(this.maskNode.width / 2, 0)

        if (this.contentArr.length == 0) {
            this.node.active = false
        }
        this.label.node.setPosition(this.startPos)
    }

    start() {

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
        this.startScroll();
    }
    /**
    * 开始滚动信息
    * @param content 滚动内容
    */
    private startScroll(): void {

        //let self = this

        this.node.active = true
        if (this.label.node.getActionByTag(0) != null && this.label.node.getActionByTag(0).isDone() == false)//如果正在播放只插入数据
        {
            return
        }

        let scrollFunc = () => {
            if (this.contentArr.length > 0) {
                this.contentIndex = this.contentIndex === this.contentArr.length - 1 ? 0 : (this.contentIndex + 1);
                this.label.string = this.contentArr[this.contentIndex];//.shift();
                //需要先更新标签的宽度，不然下一帧才更新，这里取到的值就会是原来的值，导致宽度计算错误
                this.label['_forceUpdateRenderData'](true);
                this.label.node.setPosition(this.startPos);
                let distance: number = this.label.node.width + this.label.node.parent.width;
                let duration: number = distance / 100;
                let seq = cc.sequence(
                    cc.moveBy(duration, cc.v2(-distance, 0)),
                    cc.callFunc(() => {
                        this.label.string = "";
                        this.label.node.setPosition(this.startPos);
                        //self.label.node.position = self.startPos

                        scrollFunc.call(this);
                    })
                )
                seq.setTag(0);
                this.label.node.runAction(seq);
            }
            else {
                this.node.active = false
            }
        }
        scrollFunc.call(this);
    }


    onDestroy() {
        if (this.label.node) {
            if (this.label.node.getActionByTag(0) != null) {
                this.label.node.stopAction(this.label.node.getActionByTag(0))
            }
        }
    }
    // update (dt) {}
}
