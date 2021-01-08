import BaseProxy from "./BaseProxy";
import { HttpUtil } from '../Util/HttpUtil';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';


export class ConfigProxy extends BaseProxy {

    private _facadeUrl: string;
    private _ggwUrl: string;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    public loadConfig(): void {
        cc.loader.loadRes("config/config", cc.JsonAsset, (err, res) => {
            if (err) {
                // tips.string = "加载本地配置文件失败！";
                return;
            }

            let configUrl = res.json.configUrl + "?l=" + Math.random();

            HttpUtil.send(configUrl, (response, request, url) => {
                this._facadeUrl = response.facadeUrl;
                this._ggwUrl = response.ggwUrl;

                this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
            }, (errorCode, request, state, url) => {
                // tips.string = "配置文件获取失败!";
                console.log("login err: ", errorCode);
            }, HttpUtil.METHOD_GET);
        });
    }

    public get facadeUrl(): string {
        return this._facadeUrl;
    }

    public get ggwUrl(): string {
        return this._ggwUrl;
    }
}