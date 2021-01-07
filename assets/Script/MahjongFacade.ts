// import { OpenLoginPanelCommand } from "./GameScript/Command/OpenLoginPanelCommand";
// import { UserLoginRequestCommand } from "./GameScript/Command/UserLoginRequestCommand";
import { CheckedLoginStateCommand } from "./GameScript/Command/CheckedLoginStateCommand";
import { StartupCommand } from "./GameScript/Command/StartupCommand";
import Facade from "./Framework/care/Facade";
import { CommandDefine } from "./GameScript/MahjongConst/CommandDefine";
// import { ProxyDefine } from "./GameScript/GameConst/ProxyDefine";
// import { LoginRequestProxy } from "./GameScript/Proxy/LoginRequestProxy";

export class MahjongFacade extends Facade {
    public initializeController(): void {
        super.initializeController();
        this.registerCommand(CommandDefine.StartUp, StartupCommand);
        
        //this.registerCommand(CommandDefine.CheckLoginState, CheckedLoginStateCommand);
        // this.registerCommand(CommandDefine.OpenLoginPanel, OpenLoginPanelCommand);
        // this.registerCommand(CommandDefine.UserLoginRequest, UserLoginRequestCommand);
    }

    public initializeModel(): void {
        super.initializeModel();

        //this.registerProxy(new LoginRequestProxy(ProxyDefine.LoginRequest));
    }

    public initializeView(): void {
        super.initializeView();
    }

    public startup(): void {
        this.sendNotification(CommandDefine.StartUp);
        this.sendNotification(CommandDefine.InitGatePanel, {});
    }
}   