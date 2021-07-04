// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../../Framework/care/Facade";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import AllotSetting from "./AllotSetting";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MyPlayerItem extends cc.Component {

    @property(cc.Node)
    AllotBtu: cc.Node = null;

    @property(cc.Toggle)
    AllotToggle: cc.Toggle = null;

    @property(cc.Toggle)
    AllotToggle2: cc.Toggle = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private data = {};
    init(data) {
        this.data = data;
    }
    start() {
        const self = this;
        this.AllotBtu.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.AllotSettingAlert, cc.Prefab, (err, item) => {
                const node: cc.Node = cc.instantiate(item);
                (node.getComponent("AllotSetting") as AllotSetting).init(this.data);
                cc.find("Canvas").addChild(node);
            });
        }, this);
    }
    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }
    checkChange(e) {
        // console.log(this.data['userName']);
        // console.log(e.isChecked);
        const value = this.AllotToggle.isChecked;
        const value2 = this.AllotToggle2.isChecked;
        this.AllotToggle.interactable = false;
        this.AllotToggle2.interactable = false;
        let bonusUrl = this.getConfigProxy().bonusUrl;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        const param = {
            userName: this.data['userName'],
            status: value ? 1 : (value2 ? 2 : 0),
            loginUser: localCacheDataProxy.getLoginData().userName
        }
        HttpUtil.send(bonusUrl + `/api/v1/account/set/game/startOrStop`, res => {
            this.AllotToggle.interactable = true;
            this.AllotToggle2.interactable = true;
            if (res.code === 200) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '操作已完成', toastOverlay: true }, '');
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
                this.AllotToggle.isChecked = !value;
                this.AllotToggle2.isChecked = !value;
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
            this.AllotToggle.isChecked = !value;
            this.AllotToggle2.isChecked = !value;
        }, HttpUtil.METHOD_POST, param);



    }

    // update (dt) {}
}
