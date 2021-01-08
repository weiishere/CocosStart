import Facade from "../../Framework/care/Facade";
import { INotification } from "../../Framework/interfaces/INotification";
import Command from "../../Framework/patterns/command/Command";
import { GatePanelMediator } from "../Mediator/GatePanelMediator";
import { MediatorDefine } from "../MahjongConst/MediatorDefine";
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";
import { GateProxy } from "../Proxy/GateProxy";
import { BaseCommand } from './BaseCommand';
import { ConfigProxy } from "../Proxy/ConfigProxy";

export class GateCommand extends BaseCommand {
    public execute(notification: INotification): void {
        const gateProxy = Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy;
        switch (notification.getType()) {
            /**检查登录状态 */
            case NotificationTypeDefine.LoadConfig:
                this.loadConfig();
                break;
            case NotificationTypeDefine.CheckLogin:
                this.checkLoginStatus();
                break;
            /**登录信息录入 */
            case NotificationTypeDefine.UserLoginOrRegister:
                break;
            case NotificationTypeDefine.GetVerifyCode:
                break;
            //鉴权
            case NotificationTypeDefine.Authentication:
                break;
        }
    }

    private loadConfig(): void {
        let configProxy = <ConfigProxy>this.facade.retrieveProxy(ProxyDefine.Config);
        configProxy.loadConfig();
    }

    private getGateProxy(): GateProxy {
        return <GateProxy>this.facade.retrieveProxy(ProxyDefine.Gate);
    }

    private checkLoginStatus(): void {
        let loginData = this.getLocalCacheDataProxy().getLoginData();
        if (loginData === null) {
            this.sendNotification(CommandDefine.OpenLoginPanel);
        } else {

        }
    }

    public getGetVerifyCode(body): void {
        this.getGateProxy().getVerifyCode(body.phoneNo, () => {
            
        });
    }

    private loginOrRegister(phoneNo): void {

    }
}