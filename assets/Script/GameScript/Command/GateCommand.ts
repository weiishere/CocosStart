import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";

export class GateCommand extends Command {
    public execute(notification: INotification): void {
        const gateProxy = Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy;
        switch (notification.getType()) {
            /**检查登录状态 */
            case NotificationTypeDefine.CheckLogin:
                const { callback } = notification.getBody();
                const isLogin = gateProxy.checkLogin();
                callback && callback(isLogin, (isLogin && gateProxy.getUserInfo()));
                break;
            /**登录信息录入 */
            case NotificationTypeDefine.UserLogin:
                const { uid, nickName, gender, headImg, score, phone, openId } = notification.getBody().userInfo;
                //虚拟登录
                gateProxy.login({
                    uid: '0000112',
                    nickName: 'visitor', 
                    gender: 0,
                    headImg: '',
                    score: 0,
                    phone: '13000000000',
                    openId: 'XXX'
                });
                break;
            //鉴权
            case NotificationTypeDefine.Authentication:

                break;
        }
    }

}