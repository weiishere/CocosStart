const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class ViewComponent extends cc.Component {
    root: cc.Node;
    prefab: cc.Node;
    async onLoad() {
        this.root = this.node;
        cc.log(`${this.root.name} onLoad`);
        const _view = await this.bindUI();
        if (_view) this.prefab = _view;
    }

    start() {
        cc.log(`${this.root.name} start`);
    }
    public createPrefab(res: string): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(res, cc.Prefab, (err, prefab) => {
                if (prefab) {
                    let _prefab = cc.instantiate(prefab);
                    resolve(_prefab);
                }
            });
        })

        // let prefab = cc.loader.getRes(res, cc.Prefab);
        // if (prefab) {
        //     let node = cc.instantiate(prefab);
        //     return node;
        // }

        // cc.log(`getRes时资源不存在: ${res}`);
        // return null;
    }
    public abstract bindUI(): Promise<cc.Node> | void
}