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
import { PhoneRegisterOrLoginData } from '../GameData/PhoneRegisterOrLoginData';
import { UserOfflineData } from '../GameData/UserOfflineData';
import { GameNoDefine } from '../GameConst/GameNoDefine';
import { OfflineGameData } from '../GameData/OfflineGameData';
import { DymjProxy } from '../Proxy/DymjProxy';
import { TuiTongZiProxy } from "../TuiTongZi/TuiTongZiProxy";
import { MusicManager } from "../Other/MusicManager";
import { AudioSourceDefine } from "../MahjongConst/AudioSourceDefine";
import { XzddProxy } from "../CDMahjong/XzddProxy";

export class GateCommand extends BaseCommand {
    private musicManager;
    constructor() {
        super();
        this.musicManager = new MusicManager();
    }
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
                this.loginOrRegister(notification.getBody())
                break;
            case NotificationTypeDefine.GetVerifyCode:
                this.getGetVerifyCode(notification.getBody());
                break;
            /** websocket鉴权成功之后收到的消息 */
            case NotificationTypeDefine.Authentication:
                // 这里处理后续功能
                cc.log("websocket 鉴权成功");

                // 测试用的
                // this.getGateProxy().joinClub();


                this.sendNotification(CommandDefine.CloseLoginPanel);

                let loginData = this.getLocalCacheDataProxy().getLoginData();
                this.sendNotification(CommandDefine.InitGateMainPanel, { loginData })

                this.handleOfflineData();
                break;
            // case NotificationTypeDefine.BgMusicPlay:
            //     this.musicManager.playMusic(notification.getBody().bgMusic || AudioSourceDefine.BackMusic2);
            //     break;
        }
    }

    private getGatePanelMediator(): GatePanelMediator {
        return <GatePanelMediator>this.facade.retrieveMediator(MediatorDefine.GatePanel);
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
            this.getGateProxy().localCahceLogin(loginData);
            // this.sendNotification(CommandDefine.InitGateMainPanel, { loginData })
        }
    }

    public getGetVerifyCode(body: PhoneRegisterOrLoginData): void {
        this.getGateProxy().getVerifyCode(body.phoneNo, () => {
            this.getGatePanelMediator().startLoginVerifyCountdown();
        });
    }

    private loginOrRegister(body: PhoneRegisterOrLoginData): void {
        this.getGateProxy().loginOrRegiter(body);
    }

    private handleOfflineData(): void {
        let userOfflineData = this.getGateProxy().userOfflineData;

        if (!userOfflineData) {
            return;
        }

        let clubGameNo = GameNoDefine.CLUB_SERVER;
        let clubOfflineData = <OfflineGameData>userOfflineData.offlineGameDatas[clubGameNo];
        if (clubOfflineData) {
            this.getGateProxy().joinClub();
        }

        let xzddOfflineData = <OfflineGameData>userOfflineData.offlineGameDatas[GameNoDefine.XUE_ZHAN_DAO_DI];
        if (xzddOfflineData) {
            if (xzddOfflineData.level2 > 0) {
                this.getXzddProxy().loginGame(xzddOfflineData.level2);
            }
        }

        let dymjOfflineData = <OfflineGameData>userOfflineData.offlineGameDatas[GameNoDefine.DA_YI_ER_REN_MAHJONG];
        if (dymjOfflineData) {
            if (dymjOfflineData.level2 > 0) {
                this.getDymjProxy().loginGame(dymjOfflineData.level2);
            }
        }

        let ttzOfflineData = <OfflineGameData>userOfflineData.offlineGameDatas[GameNoDefine.TUI_TONG_ZI];
        if (ttzOfflineData) {
            this.getTuiTongZiProxy().loginGame();
        }
    }

    public getXzddProxy(): XzddProxy {
        return <XzddProxy>this.facade.retrieveProxy(ProxyDefine.Xzdd);
    }

    public getDymjProxy(): DymjProxy {
        return <DymjProxy>this.facade.retrieveProxy(ProxyDefine.Dymj);
    }

    public getTuiTongZiProxy(): TuiTongZiProxy {
        return <TuiTongZiProxy>this.facade.retrieveProxy(ProxyDefine.TuiTongZi);
    }

}