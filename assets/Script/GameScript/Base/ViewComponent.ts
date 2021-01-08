const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class ViewComponent extends cc.Component {
    root: cc.Node;
    //view: cc.Node;
    async onLoad() {
        this.root = this.node;
        cc.log(`${this.root.name} onLoad`);
        await this.bindUI();
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
    public abstract bindUI(): void
}