// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import ViewComponent from "../../Base/ViewComponent";
const { ccclass, property } = cc._decorator;
import { GameData, DeskData, TTZDeskRepository } from "../../repositories/TTZDeskRepository"
import PlayerHead from "./PlayerHead";
import { PrefabDefine } from "../../TuiTongZiConst/PrefabDefine";
import Facade from "../../../Framework/care/Facade";
import { ProxyDefine } from "../../TuiTongZiConst/ProxyDefine";
import { TuiTongZiProxy } from "../../Proxy/TTZDeskProxy";

@ccclass
export default class TTZDeskView extends ViewComponent {

    private deskOpreationIconWrap: cc.Node;
    private antePanelWrap: cc.Node;
    private chipWrap: cc.Node;
    private myHeader: cc.Node;

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    chip_1: cc.Node = null;
    @property(cc.Node)
    chip_5: cc.Node = null;
    @property(cc.Node)
    chip_10: cc.Node = null;
    @property(cc.Node)
    chip_50: cc.Node = null;
    @property(cc.Node)
    chip_100: cc.Node = null;
    // onLoad () {}
    bindUI() {
        this.deskOpreationIconWrap = this.node.getChildByName("deskOpreationIconWrap");
        this.myHeader = this.node.getChildByName("myHeaderWrap");
        ///this.deskBtus = this.deskOpreationIconWrap.children;
        for (let i in this.deskOpreationIconWrap.children) {
            if (this.deskOpreationIconWrap.children[i] instanceof cc.Node) {
                (this.deskOpreationIconWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.deskOpreationIconWrap.children[i].dispatchEvent(new cc.Event.EventCustom("deskOpreation", true));
                }, this);
            }
        }
        //下注砝码
        this.chipWrap = this.node.getChildByName("chipWrap");
        for (let i in this.chipWrap.children) {
            if (this.chipWrap.children[i] instanceof cc.Node) {
                this.setLight(this.chipWrap.children[i], false);
                (this.chipWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.chipWrap.children[i].dispatchEvent(new cc.Event.EventCustom("chipChose", true));
                }, this);
            }
        }
        //下注区域
        this.antePanelWrap = this.node.getChildByName("antePanelWrap");
        for (let i in this.antePanelWrap.children) {
            if (this.antePanelWrap.children[i] instanceof cc.Node) {
                this.setLight(this.antePanelWrap.children[i], false);
                (this.antePanelWrap.children[i] as cc.Node).on(cc.Node.EventType.TOUCH_START, (eventData) => {
                    this.antePanelWrap.children[i].dispatchEvent(new cc.Event.EventCustom("anteAreaChose", true));
                }, this);
            }
        }

    }
    bindEvent() {

    }
    start() {

    }
    getData(): TTZDeskRepository {
        return (Facade.Instance.retrieveProxy(ProxyDefine.TTZDesk) as TuiTongZiProxy).repository;
    }
    //设置发光
    setLight(node: cc.Node, isLight?: boolean, option?: { isFlicker?: boolean, keepTime?: number }) {
        const _option = Object.assign({ isFlicker: false, keepTime: 0 }, option || {});
        const light = node.getChildByName('light');
        light.active = isLight || false;
        if (!isLight) {
            light.opacity = 255;
            light.stopAllActions();
            return;
        };
        if (_option.isFlicker) {
            light.opacity = 0;
            const action = cc.repeatForever(
                cc.sequence(cc.fadeTo(0.4, 50), cc.fadeTo(0.4, 255), cc.callFunc(() => { })));
            light.runAction(action);
        }
        if (_option.keepTime) {
            this.scheduleOnce(() => {
                const action = cc.sequence(cc.fadeTo(0.2, 0), cc.callFunc(() => {
                    light.opacity = 255;
                    light.active = false;
                }));
                light.runAction(action);
            }, _option.keepTime);
        }
    }
    /**刷新头像 */
    updatePlayerHead() {
        //设置玩家自己头像
        const selfPlayer = this.getData().deskData.playerList.mySelf;
        cc.loader.loadRes(PrefabDefine.PlayerHead, cc.Prefab, (err, head) => {
            const playerHead: cc.Node = cc.instantiate(head);
            (playerHead.getComponent("PlayerHead") as PlayerHead).init(selfPlayer.uid, selfPlayer.headImg, "landscape");
            this.myHeader.addChild(playerHead);
        })
    }
    /**绑定砝码点击操作 */
    public bindClipOpreationEvent(callBack: (node: cc.Node, clipNum: number) => void): void {
        let isDone = true;
        this.chipWrap.on('chipChose', (eventData) => {
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            this.chipWrap.children.map(item => {
                this.setLight(item, false);
                cc.tween(item).to(0.1, { scale: 1 }).start();
            });
            cc.tween(eventData.target).to(0.1, { scale: 1.3 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, +eventData.target.name.split("_")[1]);
                this.setLight(eventData.target, true, { isFlicker: true });
                isDone = true;
            }).start();
        }, this);
    }
    /**绑定桌面操作事件（设置、记录按钮等） */
    public bindDskOpreationEvent(callBack: (node: cc.Node) => void): void {
        let isDone = true;
        this.deskOpreationIconWrap.on('deskOpreation', (eventData) => {
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            cc.tween(eventData.target).to(0.1, { scale: 0.95, position: cc.v3(x, y - 10) }).to(0.1, { scale: 1, position: cc.v3(x, y) }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node);
                isDone = true;
            }).start();
        }, this);
    }
    /**绑定点击下注区域时间 */
    public bindAnteAreaEvent(callBack: (node: cc.Node, anteCode: string) => void): void {
        let isDone = true;
        this.antePanelWrap.on('anteAreaChose', (eventData) => {
            const { x, y } = eventData.target;
            if (!isDone) return;
            isDone = false;
            cc.tween(eventData.target).to(0.1, { scale: 1.05 }).to(0.1, { scale: 1 }).call(() => {
                console.log(`按下${eventData.target.name}`, eventData.target);
                callBack(eventData.target as cc.Node, eventData.target.name.split("_")[0]);
                this.setLight(eventData.target, true, { keepTime: 3 });
                isDone = true;
            }).start();
        }, this);
    }
    // update (dt) {}
}
