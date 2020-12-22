const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class ViewComponent extends cc.Component {
    root: cc.Node;

    onLoad() {
        this.root = this.node;
        cc.log(`${this.root.name} onLoad`);
        this.bindUI();
    }

    start() {
        cc.log(`${this.root.name} start`);
    }

    abstract bindUI(): void
}