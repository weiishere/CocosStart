import ViewComponent from "../../Base/ViewComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupWindow extends ViewComponent {
    @property(cc.Node)
    closeBtu: cc.Node = null;
    @property(cc.Label)
    titleLabel: cc.Label = null;
    @property(cc.Label)
    contentLabel: cc.Label = null;

    bindUI() {
    }
    bindEvent() {
        this.closeBtu.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
    }

    start() {
    }

    show(parentNode: cc.Node, title: string, content: string) {
        parentNode.addChild(this.node);
        if (title && title.length > 0) this.titleLabel.string = title;
        this.contentLabel.string = content;
    }

    // update (dt) {}
}
