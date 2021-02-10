// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewComponent from "../../Base/ViewComponent";
import { ApplicationGlobal } from "../../MahjongConst/ApplicationGlobal"
import { HttpUtil } from "../../Util/HttpUtil";
import Facade from "../../../Framework/care/Facade";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
const { ccclass, property } = cc._decorator;

/**获取用户信息 */
export const getUserOrderInfo = (targetId?, callBack?) => {
    let bonusUrl = (<ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config)).bonusUrl;
    let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
    HttpUtil.send(bonusUrl + `/api/v1/account/get?userName=${targetId || localCacheDataProxy.getLoginData().userName}`, res => {
        if (res.code === 200) {
            if (!targetId) window.localStorage['userOrderInfo'] = JSON.stringify(res.data);
            /*accountType: 1
            inviteCode: "6043388"
            privilege: 1*/
        } else {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
        }
        callBack(res);
    }, (err) => {
        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
    }, HttpUtil.METHOD_GET, {})
}


export const initNoRecoreNode = (): cc.Node => {
    const node = new cc.Node('noRecord');
    const label = node.addComponent(cc.Label);
    label.fontSize = 24;
    label.string = '无记录';
    return node;
}


@ccclass
export default class MyBonus extends ViewComponent {

    // LIFE-CYCLE CALLBACKS:


    @property(cc.Node)
    closeButton: cc.Node = null;
    @property(cc.Node)
    myPlayer_btn: cc.Node = null;
    @property(cc.Node)
    myEnterPrise_btn: cc.Node = null;
    @property(cc.Node)
    leaderEnterPrise_btn: cc.Node = null;
    @property(cc.Node)
    extractRecord_btn: cc.Node = null;
    @property(cc.Node)
    extractBonus_btn: cc.Node = null;

    private loading: cc.Node = null;
    private isInited = true;

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    bindUI() {
        this.loading = this.node.getChildByName('loading');
        getUserOrderInfo(undefined, (res) => {
            //判断是不是盟主
            this.node.getChildByName("bg").getChildByName("bg2_hl").active = true;
            this.node.getChildByName("bg").getChildByName("bg3_hl").getChildByName("item_title_2").active = true;
            this.node.getChildByName("bg").getChildByName("bg3_hl").getChildByName("item_title_4").active = true;
            if (res.data.accountType === 666 || res.data.accountType === 888) {
                this.node.getChildByName("bg").getChildByName("bg3_hl").getChildByName("item_title_1").active = true;
                this.node.getChildByName("bg").getChildByName("bg3_hl").getChildByName("item_title_3").active = true;
            }
        });
    }

    bindEvent() {
        //关闭
        this.closeButton.on(cc.Node.EventType.TOUCH_END, () => { this.node.destroy(); }, this);
        //我的玩家
        this.myPlayer_btn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.MyPlayer, cc.Prefab, (err, prefab) => {
                if (!err) {
                    this.node.active = false;
                    const node: cc.Node = cc.instantiate(prefab);
                    cc.find('Canvas/GateStartPanel').addChild(node);
                    node.getComponent('MyPlayer').closeCallBack(() => {
                        this.node.active = true;
                    });
                }
            });
        }, this);
        //我的业绩
        this.myEnterPrise_btn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.MyEnterPrise, cc.Prefab, (err, prefab) => {
                if (!err) {
                    this.node.active = false;
                    const node: cc.Node = cc.instantiate(prefab);
                    cc.find('Canvas/GateStartPanel').addChild(node);
                    node.getComponent('MyEnterprise').closeCallBack(() => {
                        this.node.active = true;
                    });
                }
            });
        }, this);
        //盟主业绩
        this.leaderEnterPrise_btn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.LeaderEnterPrise, cc.Prefab, (err, prefab) => {
                if (!err) {
                    this.node.active = false;
                    const node: cc.Node = cc.instantiate(prefab);
                    cc.find('Canvas/GateStartPanel').addChild(node);
                    node.getComponent('LeaderEnterprise').closeCallBack(() => {
                        this.node.active = true;
                    });
                }
            });
        }, this);

        //提取记录
        this.extractRecord_btn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.loader.loadRes(PrefabDefine.ExtractRecord, cc.Prefab, (err, prefab) => {
                if (!err) {
                    this.node.active = false;
                    const node: cc.Node = cc.instantiate(prefab);
                    cc.find('Canvas/GateStartPanel').addChild(node);
                    node.getComponent('ExtractRecord').closeCallBack(() => {
                        this.node.active = true;
                    });
                }
            });
        }, this);

        let bonusUrl = this.getConfigProxy().bonusUrl;
        //提取红利
        this.extractBonus_btn.on(cc.Node.EventType.TOUCH_END, () => {
            if (!this.isInited) {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '红利处理中，请勿连续操作，请稍后~', toastOverlay: true }, '');
                return;
            };
            this.isInited = false;
            if (this.node.getChildByName("bg").getChildByName("bg2_hl").getChildByName("hlye_value").getComponent(cc.Label).string === '0') return;
            let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
            HttpUtil.send(bonusUrl + '/api/v1/capital/add/withdrawal?serialType=3&amount=0&userName=' + localCacheDataProxy.getLoginData().userName, res => {
                this.loading.active = false;
                this.isInited = true;
                if (res.code === 200) {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '提取红利成功~' }, '');
                    this.httpRequest();
                } else {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
                }
            }, (err) => {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
            }, HttpUtil.METHOD_POST, {})
        }, this);
    }

    start() {
        this.httpRequest();
    }
    httpRequest() {
        /**我的红利 */
        const self = this;
        let bonusUrl = this.getConfigProxy().bonusUrl;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        HttpUtil.send(bonusUrl + '/api/v1/dividend?userName=' + localCacheDataProxy.getLoginData().userName, res => {
            self.loading.active = false;
            if (res.code === 200) {
                self.node.getChildByName("bg").getChildByName("bg2_hl").getChildByName("hlye_value").getComponent(cc.Label).string = res.data.surplusDividend;//红利余额
                self.node.getChildByName("bg").getChildByName("bg2_hl").getChildByName("ljzhl_value").getComponent(cc.Label).string = res.data.totalDividend;//累计总红利
                self.node.getChildByName("bg").getChildByName("bg2_hl").getChildByName("ljztq_value").getComponent(cc.Label).string = res.data.drawDividend;//累计总提取
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
        }, HttpUtil.METHOD_GET, {})
    }

    // update (dt) {}
}
