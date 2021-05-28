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
    private _downUrl: string;
    private _iosDownUrl: string;
    private _serviceUrl: string;
    private _rechargeServiceUrl: string;
    private _configUrl: string;

    private _configName: string;
    private _version: string;
    private _port: string;

    private _leessang: string;

    private _ips = [];
    private currentRemoteIp = "";
    private loadingPanel: cc.Node;
    private isOther = false;

    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
    }

    public loadOtherConfig() {

    }

    public loadConfig(): void {
        this.loadingPanel = new cc.Node('Loading');
        const label = this.loadingPanel.addComponent(cc.Label);
        label.string = "Loading";
        cc.find("Canvas").addChild(this.loadingPanel);
        cc.loader.loadRes("config/config", cc.JsonAsset, (err, res) => {
            if (err) {
                // tips.string = "加载本地配置文件失败！";
                return;
            }

            cc.loader.loadRes("config/config_" + res.json.profile, cc.JsonAsset, (err, res) => {
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

                if (res.json.profile === 'pro') {
                    this.resOtherUrl(otherUrl);
                } else {
                    this.loadLocalConfig(this._configUrl);
                }
            });
        });
    }

    public getGateProxy() {
        return <GateProxy><unknown>this.facade.retrieveProxy(ProxyDefine.Gate);
    }

    public resOtherUrl(url) {
        HttpUtil.send(url, (response) => {
            this.loadingPanel.destroy();
            this._ips = response.ip;
            this._shareUrl = response.url[0];
            if (!this._ips || this._ips.length === 0) {
                this.getGateProxy().toast("没有配置！");
                return;
            }

            // 递归获取配置
            this.loadLocalConfigRepeatedly(this._ips, 0);
        }, (err) => {
            this.loadingPanel.destroy();
            this.getGateProxy().toast("获取配置失败！");
        }, HttpUtil.METHOD_GET);
    }

    public loadLocalConfigRepeatedly(_ips: string[], index: number) {
        let ip = this._ips[index];
        this.currentRemoteIp = ip;
        let configUrl = "";
        if (this._port) {
            configUrl = "http://" + ip + ":" + this._port + this._configName;
        } else {
            configUrl = "http://" + ip + this._configName;
        }

        let isSueeccd = false;
        HttpUtil.send(configUrl, (response, request, url) => {

            let replaceIp = this.currentRemoteIp;
            if (this._port) {
                replaceIp = this.currentRemoteIp + ":" + this._port;
            }

            this._facadeUrl = this.replaceUrl(response.facadeUrl, replaceIp);
            this._ggwUrl = this.replaceUrl(response.ggwUrl, replaceIp);
            this._staticUrl = this.replaceUrl(response.staticUrl, replaceIp);
            if (!this._shareUrl) {
                this._shareUrl = this.replaceUrl(response.shareUrl, replaceIp);
            }
            this._downUrl = this.replaceUrl(response.downUrl, replaceIp);
            this._bonusUrl = this.replaceUrl(response.bonusUrl, replaceIp);
            this._iosDownUrl = this.replaceUrl(response.iosDownUrl, replaceIp);
            this._serviceUrl = response.serviceUrl;
            this._rechargeServiceUrl = response.rechargeServiceUrl;
            this._leessang = response.leessang;

            if (this.versionCompare(this._version, response.version)) {
                this.facade.sendNotification(CommandDefine.OpenUpdatePromptAlert, { shareUrl: this._downUrl, iosDownUrl: this._iosDownUrl }, "");
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
        // 在配置后面增加一个时间戳，避免缓存
        configUrl += `?t=${new Date().getTime()}`;

        let isSueeccd = false;
        HttpUtil.send(configUrl, (response, request, url) => {
            this._facadeUrl = this.replaceUrl(response.facadeUrl, this.currentRemoteIp + ":" + this._port);
            this._ggwUrl = this.replaceUrl(response.ggwUrl, this.currentRemoteIp + ":" + this._port);
            this._staticUrl = this.replaceUrl(response.staticUrl, this.currentRemoteIp + ":" + this._port);
            this._shareUrl = this.replaceUrl(response.shareUrl, this.currentRemoteIp + ":" + this._port);
            this._downUrl = this.replaceUrl(response.downUrl, this.currentRemoteIp + ":" + this._port);
            this._bonusUrl = this.replaceUrl(response.bonusUrl, this.currentRemoteIp + ":" + this._port);
            this._iosDownUrl = this.replaceUrl(response.iosDownUrl, this.currentRemoteIp + ":" + this._port);
            this._serviceUrl = response.serviceUrl;
            this._rechargeServiceUrl = response.rechargeServiceUrl;
            this._leessang = response.leessang;

            if (this.versionCompare(this._version, response.version)) {
                this.facade.sendNotification(CommandDefine.OpenUpdatePromptAlert, { shareUrl: this._downUrl, iosDownUrl: this._iosDownUrl }, "");
            } else {
                this.facade.sendNotification(CommandDefine.GateCommand, null, NotificationTypeDefine.CheckLogin);
            }
            isSueeccd = true;
            this.loadingPanel.destroy();
        }, (errorCode, request, state, url) => {
            // tips.string = "配置文件获取失败!";
            console.log("login err: ", errorCode);
            isSueeccd = false;
            this.loadingPanel.destroy();
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

    public get version(): string {
        return this._version;
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
    public get downUrl(): string {
        return this._downUrl;
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
    public get rechargeServiceUrl(): string {
        return this._rechargeServiceUrl;
    }
    public get leessang(): string {
        return this._leessang;
    }

    public set leessang(_lessang: string) {
        this._leessang = _lessang;
    }
}