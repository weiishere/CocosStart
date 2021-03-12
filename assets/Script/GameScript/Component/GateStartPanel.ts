// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import Facade from "../../Framework/care/Facade";
import { ProxyDefine } from "../MahjongConst/ProxyDefine"
import { CommandDefine } from "../MahjongConst/CommandDefine"
import { GateProxy } from "../Proxy/GateProxy";
import { TuiTongZiProxy } from "../Proxy/TuiTongZiProxy";
import { DymjMusicManager } from '../Other/DymjMusicManager';
import { ConfigProxy } from "../Proxy/ConfigProxy";

@ccclass
export default class GateStartPanel extends ViewComponent {

    @property(cc.Node)
    settingBtn: cc.Node = null;
    @property(cc.Node)
    helpBtn: cc.Node = null;
    @property(cc.Node)
    msgBtn: cc.Node = null;
    @property(cc.Node)
    shareBtn: cc.Node = null;
    @property(cc.Node)
    logBtn: cc.Node = null;
    @property(cc.Node)
    bonusBtn: cc.Node = null;
    @property(cc.Node)
    serviceBtn: cc.Node = null;

    private mahjongEntrance: cc.Node;
    private pdkEntrance: cc.Node;
    private exchangeEntrance: cc.Node;
    private otherGamePanel: cc.Node;

    protected async bindUI() {
        this.mahjongEntrance = this.root.getChildByName("gameBg1");
        this.pdkEntrance = this.root.getChildByName("gameBg2");
        this.otherGamePanel = this.root.getChildByName("otherGame");
        this.exchangeEntrance = this.root.getChildByName("gameBg3");
        this.initEffect();
    }

    private initEffect(): void {
        // const pdkNode = this.root.getChildByName("gameBg2").getChildByName("gameItem2");
        // const _action2 = cc.repeatForever(cc.sequence(cc.rotateTo(1, 5), cc.rotateTo(1, -5), cc.callFunc(() => { })));
        // pdkNode.runAction(_action2);


        const mahjongNode = this.root.getChildByName("gameBg1").getChildByName("gameItem1");
        const _action = cc.repeatForever(cc.sequence(cc.moveBy(1, cc.v2(0, 10)), cc.moveBy(1, cc.v2(0, -10)), cc.callFunc(() => { })));
        mahjongNode.runAction(_action);

        const exchangeNode = this.root.getChildByName("gameBg3").getChildByName("gameItem3");
        const _action3 = cc.repeatForever(cc.sequence(cc.scaleTo(1.2, 1.02), cc.scaleTo(1.2, 0.98), cc.callFunc(() => { })));
        exchangeNode.runAction(_action3);

        const erbaGaneNode = this.root.getChildByName("otherGame").getChildByName("game_ebg").getChildByName("hot");
        const _action4 = cc.repeatForever(cc.sequence(cc.scaleTo(0.1, 1.1),cc.scaleTo(0.4, 1.1),
        cc.sequence(cc.rotateBy(0.05, 5), cc.rotateBy(0.05, -5), cc.rotateBy(0.05, 5), cc.rotateBy(0.05, -5), cc.rotateBy(0.05, 5), cc.rotateBy(0.05, -5),
        cc.scaleTo(0.1, 1),cc.scaleTo(0.4, 1), cc.callFunc(() => { }))));
        erbaGaneNode.runAction(_action4);
    }

    protected async bindEvent() {
        this.mahjongEntrance.on(cc.Node.EventType.TOUCH_END, () => {
            (Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy).joinClub();
        }, this, true);

        this.otherGamePanel.children.forEach(node => {
            node.on(cc.Node.EventType.TOUCH_START, (eventData, item) => {
                const _action = cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1), cc.callFunc(() => { }));
                eventData.target.runAction(_action);
                if (node.name === 'game_ebg') {
                    (Facade.Instance.retrieveProxy(ProxyDefine.Gate) as GateProxy).joinTuiTongZi();
                } else {
                    Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '游戏开发中，敬请期待...', toastOverlay: false }, '');
                }
            }, this, true);
        });

        this.exchangeEntrance.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenExchangePanel, null, '')
        }, this, true);

        this.settingBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenSetting, { isShowChangeUserBtn: true }, '')
        });

        this.helpBtn.on(cc.Node.EventType.TOUCH_END, () => {
            //加载帮助框
            cc.loader.loadRes('prefabs/helpAlert', cc.Prefab, (error, item) => {
                this.node.addChild(cc.instantiate(item));
            });
            //Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '开发中，敬请期待...', toastOverlay: true }, '');
        });

        this.msgBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenGiveAwayPanel, {}, '');
        });

        this.shareBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenShare, null, '');
        });

        this.logBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenRecordPanel, null, '');
        });

        this.bonusBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenBonusIndex, null, '');
        });

        this.serviceBtn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.sys.openURL(this.getConfigProxy().serviceUrl);
        });
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    // onLoad () {
    // }

    start() {

    }

    // update (dt) {}
}
