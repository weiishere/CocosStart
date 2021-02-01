// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import ViewComponent from "../../Base/ViewComponent";
import { ApplicationGlobal } from "../../MahjongConst/ApplicationGlobal";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import Facade from "../../../Framework/care/Facade";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import MyPlayerItem from "./MyPlayerItem"
import PageCommand from "../../Util/PageCommand";
import { ConfigProxy } from "../../Proxy/ConfigProxy";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MyPlayer extends ViewComponent {

    @property(cc.Node)
    closeButton: cc.Node = null;

    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    private _closeCallBack: () => void;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private loading: cc.Node = null;
    private pageSize: number = 20;
    // private currentPage: number = 1;
    // private pageCount: number = 0;
    private firstPageNode: cc.Node;
    private endPageNode: cc.Node;
    private nextPageNode: cc.Node;
    private previousPageNode: cc.Node;

    private pageCommand: PageCommand = new PageCommand();
    //private scrollContent: cc.Node;
    bindUI() {
        this.loading = this.node.getChildByName('loading');
        this.loading.active = true;
        //this.scrollContent = this.node.getChildByName("bg3_hl").getChildByName("playerList").getChildByName("view").getChildByName("content");
        this.pageCommand.init(0, this.pageSize);
        this.pageCommand.bindPageDo(({ currentPage }) => {
            this.httpRequest(currentPage);
        });
        this.bindPageEvent();
    }
    bindPageEvent() {
        this.firstPageNode = this.node.getChildByName('pageWrap').getChildByName('ww_sy');
        this.endPageNode = this.node.getChildByName('pageWrap').getChildByName('ww_wy');
        this.nextPageNode = this.node.getChildByName('pageWrap').getChildByName('ww_xyy');
        this.previousPageNode = this.node.getChildByName('pageWrap').getChildByName('ww_syy');

        this.firstPageNode.on(cc.Node.EventType.TOUCH_END, () => { this.pageCommand.firstPage(); }, this);
        this.endPageNode.on(cc.Node.EventType.TOUCH_END, () => { this.pageCommand.endPage(); }, this);
        this.nextPageNode.on(cc.Node.EventType.TOUCH_END, () => { this.pageCommand.nextPage(); }, this);
        this.previousPageNode.on(cc.Node.EventType.TOUCH_END, () => { this.pageCommand.previousPage(); }, this);
    }
    bindEvent() {
        //关闭
        this.closeButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
            this._closeCallBack();
        }, this);
    }
    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    httpRequest(currentPage) {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        const self = this;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        //${/*localCacheDataProxy.getLoginData().userName*/}
        self.loading.active = true;
        this.scrollViewContent.removeAllChildren();
        HttpUtil.send(bonusUrl + `/api/v1/gamePlayer?userName=${localCacheDataProxy.getLoginData().userName}&pageSize=${this.pageSize}&currentPage=${currentPage}`, res => {
            self.loading.active = false;
            if (res.code === 200) {
                // const p = parseInt((res.data.totalNum / this.pageSize) + '');
                // this.pageCount = (res.data.totalNum % this.pageSize) > 0 ? (p + 1) : p;
                this.pageCommand.init(res.data.totalNum, this.pageSize);
                const userOrderInfo = JSON.parse(window.localStorage['userOrderInfo']);
                cc.loader.loadRes(PrefabDefine.MyPlayerItem, cc.Prefab, (err, myPlayerItem) => {
                    this.node.getChildByName("bg3_hl").getChildByName("playerNum").getComponent(cc.Label).string = "您目前的玩家数量：" + res.data.totalNum;
                    res.data.list.forEach(element => {
                        const myPlayerItemNode: cc.Node = cc.instantiate(myPlayerItem);
                        myPlayerItemNode.getChildByName("name").getComponent(cc.Label).string = element.nickName;
                        myPlayerItemNode.getChildByName("playerId").getComponent(cc.Label).string = element.userName;
                        myPlayerItemNode.getChildByName("playNum").getComponent(cc.Label).string = element.gameNum;
                        myPlayerItemNode.getChildByName("ww_mzicon").active = element.accountType === 666;//是否显示盟主
                        myPlayerItemNode.getChildByName("regTime").getComponent(cc.Label).string = element.createDate;
                        myPlayerItemNode.getChildByName("ww_sq").active = (userOrderInfo.accountType === 666 || userOrderInfo.accountType === 888);//element.accountType === 666;//是否显示分配比例按钮
                            (myPlayerItemNode.getComponent('MyPlayerItem') as MyPlayerItem).init(element);
                        this.scrollViewContent.addChild(myPlayerItemNode);
                    });
                });
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
        }, HttpUtil.METHOD_GET, {})
    }

    start() {
        this.httpRequest(1);
    }
    closeCallBack(fn) {
        this._closeCallBack = fn;
    }

    // update (dt) {}
}
