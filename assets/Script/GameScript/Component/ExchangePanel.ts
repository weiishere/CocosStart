import ViewComponent from '../Base/ViewComponent';
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangePanel extends ViewComponent {

    @property(cc.Node)
    goldBuyList: cc.Node = null;
    @property(cc.Node)
    logNode: cc.Node = null;
    @property(cc.Node)
    convertNode: cc.Node = null;
    @property(cc.Node)
    logContentItem: cc.Node = null;
    @property(cc.Node)
    logContentContainer: cc.Node = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    hideNode() {
        this.goldBuyList.active = false;
        this.logNode.active = false;
        this.convertNode.active = false;
    }

    updateLogContent(cotnent: cc.Node, timeStr, typeStr, moneyStr, statusStr) {
        let timeLabel = cotnent.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = cotnent.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = cotnent.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;
        let statusLabel = cotnent.getChildByName("StatusLabel").getComponent(cc.Label);
        statusLabel.string = statusStr;
    }

    addLogContent() {
        this.logContentContainer.removeAllChildren();
        let node = cc.instantiate(this.logContentItem);
        // this.updateLogContent(node, "");
        this.logContentContainer.addChild(node);
    }

    updateLogTitle(timeStr, typeStr, moneyStr) {
        let node = <cc.Node>this.logNode.getChildByName("Title");
        let timeLabel = node.getChildByName("TimeLabel").getComponent(cc.Label);
        timeLabel.string = timeStr;
        let typeLabel = node.getChildByName("TypeLabel").getComponent(cc.Label);
        typeLabel.string = typeStr;
        let moneyLabel = node.getChildByName("MoneyLabel").getComponent(cc.Label);
        moneyLabel.string = moneyStr;
        // let StatusLabel = node.getChildByName("StatusLabel").getComponent(cc.Label);
    }

    exchangeLogTitleUpdate() {
        this.updateLogTitle("充值时间", "充值方式", "充值金额");
    }

    convertLogTitleUpdate() {
        this.updateLogTitle("兑换时间", "兑换方式", "兑换金额");
    }

    menuClick(event) {
        this.hideNode();
        if (event.target.name === "goldBuyItem") {
            this.goldBuyList.active = true;
        } else if (event.target.name === "exchangeLogItem") {
            this.exchangeLogTitleUpdate();
            this.logNode.active = true;
        } else if (event.target.name === "convert") {
            this.convertNode.active = true;
        } else if (event.target.name === "convertLog") {
            this.convertLogTitleUpdate();
            this.logNode.active = true;
        }
    }

    // update (dt) {}
}
