import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Mediator from "../../Framework/patterns/mediator/Mediator";
import ViewComponent from "../Base/ViewComponent";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";

export default class BaseMediator extends Mediator {
    public view: ViewComponent = null;

    public constructor(mediatorName: string = null, viewComponent: any = null) {
        super(mediatorName, viewComponent);

    }

    public listNotificationInterests(): string[] {
        return [

        ];
    }

    public handleNotification(notification: INotification): void {
        switch (notification.getName()) {

        }
    }
    public createPrefab(res: string): Promise<any> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(res, cc.Prefab, (err, prefab: cc.Node) => {
                if (prefab) {
                    let _prefab = cc.instantiate(prefab);
                    resolve(_prefab);
                }
            });
        })
    }
}