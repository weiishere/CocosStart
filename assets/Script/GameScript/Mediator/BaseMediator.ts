import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import ViewComponent from "../Base/ViewComponent";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { PrefabDefine } from '../MahjongConst/PrefabDefine';
import { ConfigProxy } from "../Proxy/ConfigProxy";

export default class BaseMediator extends Mediator {
    public view: cc.Node = null;

    public constructor(mediatorName: string = null, viewComponent: cc.Node = null) {
        super(mediatorName, viewComponent);
    }

    protected async init() {
        // 需要提前加载的预制组件
        let resArr = this.inAdvanceLoadFiles();
        for (let index = 0; index < resArr.length; index++) {
            const res = resArr[index];
            await this.createPrefab(res, true);
        }

        if (this.isLoadAfterShowPrefavSource()) {
            const prefab = await this.createPrefab(this.prefabSource());
            this.viewComponent.addChild(prefab);
            this.view = prefab;
            this.initSucceed();
            // this.createPrefab(this.prefabSource()).then((prefab) => {
            //     this.viewComponent.addChild(prefab);
            //     this.view = prefab;
            //     this.initSucceed();
            // });
        } else {
            await this.createPrefab(this.prefabSource(), true);
        }
    }

    /**
     * 是否加载后就显示主预制组件
     */
    protected isLoadAfterShowPrefavSource(): boolean {
        return true;
    }

    protected initSucceed(): void {
    }

    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [];
    }

    /**
     * 预制组件资源，需要子类实现
     */
    protected prefabSource(): string {
        return null;
    }

    public listNotificationInterests(): string[] {
        return [

        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {

        }
    }

    public getLocalCacheDataProxy(): LocalCacheDataProxy {
        return <LocalCacheDataProxy>this.facade.retrieveProxy(ProxyDefine.LocalCacheData);
    }

    public getConfigProxy(): ConfigProxy {
        return <ConfigProxy>this.facade.retrieveProxy(ProxyDefine.Config);
    }

    /**
     * 创建预制组件
     * @param res 
     * @param isAdvanceLoad 是否预加载，如果是预加载不会创建实例，之后通过 cc.loader.getRes获取预制组件
     */
    public createPrefab(res: string, isAdvanceLoad: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(res, cc.Prefab, (err, prefab: cc.Node) => {
                if (isAdvanceLoad) {
                    resolve(null);
                    return;
                }
                if (prefab) {
                    let _prefab = cc.instantiate(prefab);
                    resolve(_prefab);
                }
            });
        })
    }
}