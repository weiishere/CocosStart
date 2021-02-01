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
import { initNoRecoreNode } from './MyBonus';
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LeaderEnterprise extends ViewComponent {

    @property(cc.Node)
    closeButton: cc.Node = null;

    @property(cc.Node)
    scrollViewContent: cc.Node = null;

    private _closeCallBack: () => void;

    private loading: cc.Node = null;
    private pageSize: number = 20;
    // private currentPage: number = 1;
    // private pageCount: number = 0;
    //private scrollContent: cc.Node;
    private firstPageNode: cc.Node;
    private endPageNode: cc.Node;
    private nextPageNode: cc.Node;
    private previousPageNode: cc.Node;
    private pageCommand: PageCommand = new PageCommand();
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
        HttpUtil.send(bonusUrl + `/api/v1/achievement?userName=${localCacheDataProxy.getLoginData().userName}&pageSize=${this.pageSize}&currentPage=${currentPage}`, res => {
            self.loading.active = false;
            if (res.code === 200) {
                this.pageCommand.init(res.data.totalNum, this.pageSize);
                cc.loader.loadRes(PrefabDefine.MyEnterPriseItem, cc.Prefab, (err, myEnterPriseItem) => {
                    this.node.getChildByName("headerNumWrap").getChildByName("zrs").getComponent(cc.Label).string = res.data.totalNum + "\n总人数";
                    this.node.getChildByName("headerNumWrap").getChildByName("zgx").getComponent(cc.Label).string = (+res.data.todayDividend).toFixed(2) + "\n今日总贡献";
                    this.node.getChildByName("headerNumWrap").getChildByName("ljzgx").getComponent(cc.Label).string = (+res.data.totalDividend).toFixed(2) + "\n累计总贡献";
                    res.data.list.forEach(element => {
                        const myEnterPriseItemNode: cc.Node = cc.instantiate(myEnterPriseItem);
                        myEnterPriseItemNode.getChildByName("name").getComponent(cc.Label).string = element.nickName;
                        myEnterPriseItemNode.getChildByName("playerId").getComponent(cc.Label).string = element.userName;
                        myEnterPriseItemNode.getChildByName("playNum").getComponent(cc.Label).string = "今日总贡献：" + (+element.todayDividend).toFixed(2);
                        myEnterPriseItemNode.getChildByName("regTime").getComponent(cc.Label).string = "累计总贡献：" + (+element.totalDividend).toFixed(2);
                        SpriteLoadUtil.loadSprite(myEnterPriseItemNode.getChildByName("userHead").getComponent(cc.Sprite), element.headUrl);
                        this.scrollViewContent.addChild(myEnterPriseItemNode);
                    });
                    if (res.data.list.length === 0) {
                        this.scrollViewContent.addChild(initNoRecoreNode());
                    }
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

}
