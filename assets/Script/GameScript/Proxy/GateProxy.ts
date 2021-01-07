import Proxy from "../../Framework/patterns/proxy/Proxy";
import { CommandDefine } from "../GameConst/CommandDefine";
import { GateRepository, UserInfo } from "../repositories/GateRepository";


export class GateProxy extends Proxy {
    private repository: GateRepository;
    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        debugger
        this.repository = new GateRepository();
    }
    /**检查登录状态 */
    public checkLogin(): boolean {
        return this.repository.userInfo.uid ? true : false;
    }
    public login(userInfo: UserInfo): void {
        this.repository.userInfo = userInfo;
    }
}
