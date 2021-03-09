const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class ViewComponent extends cc.Component {
    root: cc.Node;
    //view: cc.Node;
    async onLoad() {
        this.root = this.node;
        //cc.log(`${this.root.name} onLoad`);
        await this.bindUI();
        this.bindEvent();
    }

    start() {
        cc.log(`${this.root.name} start`);
    }
    // public createPrefab(res: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         cc.loader.loadRes(res, cc.Prefab, (err, prefab) => {
    //             if (prefab) {
    //                 let _prefab = cc.instantiate(prefab);
    //                 resolve(_prefab);
    //             }
    //         });
    //     })
    // }
    protected abstract bindUI(): void
    protected abstract bindEvent(): void

    /**
     * 发送自定义事件
     * @param eventName 事件名称
     * @param body 事件内容
     */
    protected dispatchCustomEvent(eventName: string, body: any): void {
        let custom = new cc.Event.EventCustom(eventName, true);
        custom.setUserData(body);
        this.node.dispatchEvent(custom);
    }
}