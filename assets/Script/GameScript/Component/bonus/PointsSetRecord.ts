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
import PageCommand from "../../Util/PageCommand";
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { initNoRecoreNode } from './MyBonus';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PointsSetRecord extends ViewComponent {

    private loading: cc.Node = null;
    private pageSize: number = 10;
    // private currentPage: number = 1;
    // private pageCount: number = 0;
    private firstPageNode: cc.Node;
    private endPageNode: cc.Node;
    private nextPageNode: cc.Node;
    private previousPageNode: cc.Node;
    private playerId: string;

    private pageCommand: PageCommand = new PageCommand();
    @property(cc.Node)
    closeButton: cc.Node = null;

    @property(cc.Node)
    scrollViewContent1: cc.Node = null;


    private _closeCallBack: () => void;
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
            this._closeCallBack && this._closeCallBack();
        }, this);
    }

    init(data) {
        //console.log(data);
        this.playerId = data.userName;
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
        this.scrollViewContent1.removeAllChildren();
        HttpUtil.send(bonusUrl + `/api/v1/list/give?userName=${this.playerId}&pageSize=${this.pageSize}&currentPage=${currentPage}`, res => {
            self.loading.active = false;
            if (res.code === 200) {
                this.pageCommand.init(res.data.totalElements, this.pageSize);
                cc.loader.loadRes(PrefabDefine.PointsSetRecordItem, cc.Prefab, (err, pointsSetItemNode) => {
                    res.data.content.forEach((element, index) => {
                        const _pointsSetItemNode: cc.Node = cc.instantiate(pointsSetItemNode);
                        this.scrollViewContent1.addChild(_pointsSetItemNode);
                        _pointsSetItemNode.getChildByName("itemTime").getComponent(cc.Label).string = element.createTime;
                        _pointsSetItemNode.getChildByName("itemSum").getComponent(cc.Label).string = element.amount;
                        _pointsSetItemNode.getChildByName("itemState").getComponent(cc.Label).string = element.status === 1 ? '已完成' : '取消';

                    });
                    if (res.data.content.length === 0) {
                        this.scrollViewContent1.addChild(initNoRecoreNode());
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


    // update (dt) {}
}
