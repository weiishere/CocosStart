import ViewComponent from '../Base/ViewComponent';
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromptWindow extends ViewComponent {
    @property(cc.Node)
    confirmBtn: cc.Node = null;
    @property(cc.Node)
    cancelBtn: cc.Node = null;
    @property(cc.Label)
    promptText: cc.Label = null;

    confirmBtnCallback = null;

    start() {
    }

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.confirmBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.confirmBtnCallback) {
                this.confirmBtnCallback();
            }
            this.closeWindow();
        });

        this.cancelBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.closeWindow();
        });
    }


    /**
     * 显示按钮
     * @param {*} parentNode 窗口加入到哪一个节点
     * @param {*} promptText 提示内容
     * @param {*} btnType 1：只有确定按钮 0：确定和取消
     * @param {*} confirmBtnCallback 
     */
    showWindow(parentNode: cc.Node, promptText: string, btnType: number, confirmBtnCallback: Function) {
        parentNode.addChild(this.node);
        this.promptText.string = promptText;
        this.confirmBtnCallback = confirmBtnCallback;
        // 为1只有确定按钮
        if (btnType == 1) {
            this.cancelBtn.active = false;
            this.confirmBtn.x = 0;
        }
    }

    closeWindow() {
        this.root.destroy();
    }
    // update (dt) {}
}
