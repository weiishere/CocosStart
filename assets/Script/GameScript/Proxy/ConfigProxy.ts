import BaseProxy from "./BaseProxy";
import { HttpUtil } from '../Util/HttpUtil';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';


export class ConfigProxy extends BaseProxy {

    private _facadeUrl: string;
    private _ggwUrl: string;
    private _staticUrl: string;
    private _bonusUrl: string;
    private _shareUrl: string;
    private _iosDownUrl: string;
    private _serviceUrl: string;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    public loadConfig(): void {
        cc.loader.loadRes("config/config", cc.JsonAsset, (err, res) => {
            if (err) {
                // tips.string = "加载本地配置文件失败！";
                return;
            }

            const versionUrl = res.json.version;
            const configUrl = res.json.configUrl + "?l=" + Math.random();

            HttpUtil.send(configUrl, (response, request, url) => {
                this._facadeUrl = response.facadeUrl;
                this._ggwUrl = response.ggwUrl;
                this._staticUrl = response.staticUrl;
                this._shareUrl = response.shareUrl;
                this._bonusUrl = response.bonusUrl;
                this._iosDownUrl = response.iosDownUrl;
                this._serviceUrl = response.serviceUrl;

                if (this.versionCompare(versionUrl, response.version)) {
                    this.facade.sendNotification(CommandDefine.OpenUpdatePromptAlert, this._shareUrl, "");
                } else {
                    this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
                }
            }, (errorCode, request, state, url) => {
                // tips.string = "配置文件获取失败!";
                console.log("login err: ", errorCode);
            }, HttpUtil.METHOD_GET);
        });
    }

    private versionCompare(localVersion: string, removeVersion: string) {
        let localVersions = localVersion.split(".");
        let removeVersions = removeVersion.split(".");
        if (parseInt(removeVersions[0]) > parseInt(localVersions[0])) {
            return true;
        } else if (parseInt(removeVersions[0]) == parseInt(localVersions[0])) {
            if (parseInt(removeVersions[1]) > parseInt(localVersions[1])) {
                return true;
            } else if (parseInt(removeVersions[1]) == parseInt(localVersions[1])) {
                if (parseInt(removeVersions[2]) > parseInt(localVersions[2])) {
                    return true;
                }
            }
        }

        return false;
    }

    public get facadeUrl(): string {
        return this._facadeUrl;
    }

    public get ggwUrl(): string {
        return this._ggwUrl;
    }

    public get staticUrl(): string {
        return this._staticUrl;
    }

    public get shareUrl(): string {
        return this._shareUrl;
    }
    public get bonusUrl(): string {
        return this._bonusUrl;
    }
    public get iosDownUrl(): string {
        return this._iosDownUrl;
    }
    public get serviceUrl(): string {
        return this._serviceUrl;
    }
}