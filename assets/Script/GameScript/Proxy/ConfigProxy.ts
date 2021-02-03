import BaseProxy from "./BaseProxy";
import { HttpUtil } from '../Util/HttpUtil';
import { CommandDefine } from "../MahjongConst/CommandDefine";
import { NotificationTypeDefine } from '../MahjongConst/NotificationTypeDefine';
import { GateProxy } from "./GateProxy";
import { ProxyDefine } from "../MahjongConst/ProxyDefine";


export class ConfigProxy extends BaseProxy {

    private _facadeUrl: string;
    private _ggwUrl: string;
    private _staticUrl: string;
    private _bonusUrl: string;
    private _shareUrl: string;
    private _iosDownUrl: string;
    private _serviceUrl: string;
    private _configUrl: string;

    private _configName: string;
    private _version: string;
    private _port: string;

    private _leessang: string;

    private _ips = [];
    private currentRemoteIp = "";

    private isOther = false;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    public loadOtherConfig() {

    }

    public loadConfig(): void {
        cc.loader.loadRes("config/config", cc.JsonAsset, (err, res) => {
            if (err) {
                // tips.string = "加载本地配置文件失败！";
                return;
            }
            this._version = res.json.version;
            this._configUrl = res.json.configUrl;
            this._configName = res.json.configName;
            this._port = res.json.port;

            let otherUrl = res.json.otherUrl;
            // otherUrl = "";
            // this.isOther = true;
            // this._port = "80";
            // this.currentRemoteIp = "139.9.242.13";

            if (otherUrl && this._port) {
                this.resOtherUrl(otherUrl);
            } else {
                this.loadLocalConfig(this._configUrl);
            }

        });
    }

    public getGateProxy() {
        return <GateProxy>this.facade.retrieveProxy(ProxyDefine.Gate);
    }

    public resOtherUrl(url) {
        HttpUtil.send(url, (response) => {
            this._ips = response.ip;
            this._shareUrl = response.url[0];
            if (!this._ips || this._ips.length === 0) {
                this.getGateProxy().toast("没有配置！");
                return;
            }

            // this._ips[0] = "127.0.0.1";
            // 递归获取配置
            this.loadLocalConfigRepeatedly(this._ips, 0);
        }, (err) => {
            this.getGateProxy().toast("获取配置失败！");
        }, HttpUtil.METHOD_GET);
    }

    public loadLocalConfigRepeatedly(_ips: string[], index: number) {
        let ip = this._ips[index];
        this.currentRemoteIp = ip;
        let configUrl = "http://" + ip + ":" + this._port + this._configName;

        let isSueeccd = false;
        HttpUtil.send(configUrl, (response, request, url) => {
            this._facadeUrl = this.replaceUrl(response.facadeUrl, this.currentRemoteIp + ":" + this._port);
            this._ggwUrl = this.replaceUrl(response.ggwUrl, this.currentRemoteIp + ":" + this._port);
            this._staticUrl = this.replaceUrl(response.staticUrl, this.currentRemoteIp + ":" + this._port);
            if (!this._shareUrl) {
                this._shareUrl = this.replaceUrl(response.shareUrl, this.currentRemoteIp + ":" + this._port);
            }
            this._bonusUrl = this.replaceUrl(response.bonusUrl, this.currentRemoteIp + ":" + this._port);
            this._iosDownUrl = this.replaceUrl(response.iosDownUrl, this.currentRemoteIp + ":" + this._port);
            this._serviceUrl = response.serviceUrl;
            this._leessang = response._leessang;

            if (this.versionCompare(this._version, response.version)) {
                this.facade.sendNotification(CommandDefine.OpenUpdatePromptAlert, this._shareUrl, "");
            } else {
                this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
            }
        }, (errorCode, request, state, url) => {
            // tips.string = "配置文件获取失败!";
            console.log("login err: ", errorCode);
            index++;
            if (index < _ips.length) {
                this.loadLocalConfigRepeatedly(_ips, index);
            } else {
                this.getGateProxy().toast("获取远程配置失败！");
            }
        }, HttpUtil.METHOD_GET);
    }

    public loadLocalConfig(configUrl) {
        let isSueeccd = false;
        HttpUtil.send(configUrl, (response, request, url) => {
            this._facadeUrl = this.replaceUrl(response.facadeUrl, this.currentRemoteIp + ":" + this._port);
            this._ggwUrl = this.replaceUrl(response.ggwUrl, this.currentRemoteIp + ":" + this._port);
            this._staticUrl = this.replaceUrl(response.staticUrl, this.currentRemoteIp + ":" + this._port);
            this._shareUrl = this.replaceUrl(response.shareUrl, this.currentRemoteIp + ":" + this._port);
            this._bonusUrl = this.replaceUrl(response.bonusUrl, this.currentRemoteIp + ":" + this._port);
            this._iosDownUrl = this.replaceUrl(response.iosDownUrl, this.currentRemoteIp + ":" + this._port);
            this._serviceUrl = response.serviceUrl;

            if (this.versionCompare(this._version, response.version)) {
                this.facade.sendNotification(CommandDefine.OpenUpdatePromptAlert, this._shareUrl, "");
            } else {
                this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
            }
            isSueeccd = true;
        }, (errorCode, request, state, url) => {
            // tips.string = "配置文件获取失败!";
            console.log("login err: ", errorCode);
            isSueeccd = false;
        }, HttpUtil.METHOD_GET);

        return isSueeccd;
    }

    private replaceUrl(url: string, ip: string) {
        return url.replace("@remote_ip@", ip);
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
    public get leessang(): string {
        return this._leessang;
    }
}