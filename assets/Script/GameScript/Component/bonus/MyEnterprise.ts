// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Facade from "../../../Framework/care/Facade";
import ViewComponent from "../../Base/ViewComponent";
import { ApplicationGlobal } from "../../MahjongConst/ApplicationGlobal";
import { CommandDefine } from "../../MahjongConst/CommandDefine";
import { PrefabDefine } from "../../MahjongConst/PrefabDefine";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { LocalCacheDataProxy } from "../../Proxy/LocalCacheDataProxy";
import { HttpUtil } from "../../Util/HttpUtil";
import PageCommand from "../../Util/PageCommand";
import { getUserOrderInfo, initNoRecoreNode } from './MyBonus';
const { ccclass, property } = cc._decorator;

@ccclass
export default class MyEnterprise extends ViewComponent {

    @property(cc.Node)
    scrollView: cc.Node = null;

    @property(cc.SpriteFrame)
    spriteFrameChoose: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    spriteActiveFrameChoose: cc.SpriteFrame = null;

    @property(cc.Node)
    closeButton: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    private headerWrap: cc.Node;
    private loading: cc.Node = null;
    private pageCommand: PageCommand = null;
    private pageCommand1: PageCommand = new PageCommand();
    private pageCommand2: PageCommand = new PageCommand();
    private pageCommand3: PageCommand = new PageCommand();
    private pageSize: number = 20;
    // private page1 = {
    //     level: 1,
    //     pageSize: 10,
    //     currentPage: 1,
    //     pageCount: 0,
    // }
    // private page2 = {
    //     level: 2,
    //     pageSize: 10,
    //     currentPage: 1,
    //     pageCount: 0,
    // }
    // private page3 = {
    //     level: 3,
    //     pageSize: 10,
    //     currentPage: 1,
    //     pageCount: 0,
    // }

    private firstPageNode: cc.Node;
    private endPageNode: cc.Node;
    private nextPageNode: cc.Node;
    private previousPageNode: cc.Node;

    private _closeCallBack: () => void;
    bindUI() {
        this.loading = this.node.getChildByName('loading');
        this.loading.active = true;
        this.headerWrap = this.node.getChildByName("headerWrap");
        this.headerWrap.getChildByName("wdwj_title").on(cc.Node.EventType.TOUCH_END, () => {
            this.pageCommand = this.pageCommand1;
            this.pageCommand.bindPageDo(({ currentPage }) => { this.httpRequest(1); });
            this.pageCommand.firstPage();
            //this.httpRequest(1);
            this.chooseSpriteFrameHander(this.headerWrap.getChildByName("wdwj_title"));
        }, this);
        this.headerWrap.getChildByName("ejdl_title").on(cc.Node.EventType.TOUCH_END, () => {
            this.pageCommand = this.pageCommand2;
            this.pageCommand.bindPageDo(({ currentPage }) => { this.httpRequest(2); });
            this.pageCommand.firstPage();
            //this.httpRequest(2);
            this.chooseSpriteFrameHander(this.headerWrap.getChildByName("ejdl_title"));
        }, this);
        this.headerWrap.getChildByName("sjdl_title").on(cc.Node.EventType.TOUCH_END, () => {
            this.pageCommand = this.pageCommand3;
            this.pageCommand.bindPageDo(({ currentPage }) => { this.httpRequest(3); });
            this.pageCommand.firstPage();
            //this.httpRequest(3);
            this.chooseSpriteFrameHander(this.headerWrap.getChildByName("sjdl_title"));
        }, this);
        this.bindPageEvent();
    }

    chooseSpriteFrameHander(target: cc.Node) {
        this.headerWrap.getChildByName("wdwj_title").getComponent(cc.Sprite).spriteFrame = this.spriteFrameChoose;
        this.headerWrap.getChildByName("ejdl_title").getComponent(cc.Sprite).spriteFrame = this.spriteFrameChoose;
        this.headerWrap.getChildByName("sjdl_title").getComponent(cc.Sprite).spriteFrame = this.spriteFrameChoose;
        target.getComponent(cc.Sprite).spriteFrame = this.spriteActiveFrameChoose;
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
    // onLoad () {}
    bindEvent() {
        //关闭
        this.closeButton.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
            this._closeCallBack && this._closeCallBack();
        }, this);
    }
    start() {
        this.pageCommand = this.pageCommand1;
        this.pageCommand.bindPageDo(({ currentPage }) => { this.httpRequest(1); });
        this.pageCommand.firstPage();
        //this.httpRequest(1);
    }
    closeCallBack(fn) {
        this._closeCallBack = fn;
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    httpRequest(level) {
        let bonusUrl = this.getConfigProxy().bonusUrl;
        const self = this;
        let localCacheDataProxy = <LocalCacheDataProxy>Facade.Instance.retrieveProxy(ProxyDefine.LocalCacheData);
        //${/*localCacheDataProxy.getLoginData().userName*/}
        self.loading.active = true;
        this.scrollView.removeAllChildren();
        HttpUtil.send(bonusUrl + `/api/v1/my/achievement?userName=${localCacheDataProxy.getLoginData().userName}&pageSize=${this.pageSize}&level=${level}&currentPage=${this.pageCommand.currentPage}`, res => {
            self.loading.active = false;
            if (res.code === 200) {
                this.pageCommand.init(res.data.totalNum, this.pageSize);
                cc.loader.loadRes(PrefabDefine.MyEnterPriseItem, cc.Prefab, (err, myEnterpriseItem) => {
                    this.node.getChildByName("headerNumWrap").getChildByName("zrs").getComponent(cc.Label).string = res.data.totalNum;
                    this.node.getChildByName("headerNumWrap").getChildByName("zgx").getComponent(cc.Label).string = (+res.data.todayDividend).toFixed(2);
                    this.node.getChildByName("headerNumWrap").getChildByName("ljzgx").getComponent(cc.Label).string = (+res.data.totalDividend).toFixed(2);
                    res.data.list.forEach(element => {
                        const enterPriseItemNode: cc.Node = cc.instantiate(myEnterpriseItem);
                        enterPriseItemNode.getChildByName("name").getComponent(cc.Label).string = element.nickName;
                        enterPriseItemNode.getChildByName("playerId").getComponent(cc.Label).string = element.userName;
                        enterPriseItemNode.getChildByName("playNum").getComponent(cc.Label).string = "今日总贡献：" + (+element.todayDividend).toFixed(2);
                        enterPriseItemNode.getChildByName("regTime").getComponent(cc.Label).string = "累计总贡献：" + (+element.totalDividend).toFixed(2);
                        SpriteLoadUtil.loadSprite(enterPriseItemNode.getChildByName("userHead").getComponent(cc.Sprite), element.headUrl);
                        this.scrollView.addChild(enterPriseItemNode);
                    });
                    if (res.data.list.length === 0) {
                        this.scrollView.addChild(initNoRecoreNode());
                    }
                });
            } else {
                Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: res.msg, toastOverlay: true }, '');
            }
        }, (err) => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '数据服务未响应', toastOverlay: true }, '');
        }, HttpUtil.METHOD_GET, {})
    }


    // update (dt) {}
}
