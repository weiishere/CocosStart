import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import ViewComponent from "../Base/ViewComponent";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { LocalCacheDataProxy } from '../Proxy/LocalCacheDataProxy';
import { PrefabDefine } from '../MahjongConst/PrefabDefine';

export default class BaseMediator extends Mediator {
    public view: cc.Node = null;

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);
    }

    protected async init() {
        // 需要提前加载的预制组件
        let resArr = this.inAdvanceLoadFiles();
        for (let index = 0; index < resArr.length; index++) {
            const res = resArr[index];
            await this.createPrefab(res, true);
        }

        this.createPrefab(this.prefabSource()).then((prefab) => {
            this.viewComponent.addChild(prefab);
            this.view = prefab;
            this.initSucceed();
        });
    }

    protected initSucceed(): void {
    }

    /**
     * 需要预先加载的文件
     */
    protected inAdvanceLoadFiles(): string[] {
        return [PrefabDefine.PromptWindow];
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

    /**
     * 创建预制组件
     * @param res 
     * @param isAdvanceLoad 是否预加载，如果是预加载不会创建实例，之后通过 cc.loader.getRes获取预制组件
     */
    public createPrefab(res: string, isAdvanceLoad: boolean = false): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(res, cc.Prefab, (err, prefab: cc.Node) => {
                if (isAdvanceLoad) {
                    return resolve(null);
                }
                if (prefab) {
                    let _prefab = cc.instantiate(prefab);
                    resolve(_prefab);
                }
            });
        })
    }
}