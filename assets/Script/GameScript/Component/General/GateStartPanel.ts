// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../../Base/ViewComponent";
import Facade from "../../../Framework/care/Facade";
import { ProxyDefine } from "../../MahjongConst/ProxyDefine"
import { CommandDefine } from "../../MahjongConst/CommandDefine"
import { GateProxy } from "../../Proxy/GateProxy";
import { TuiTongZiProxy } from "../../TuiTongZi/TuiTongZiProxy";
import { DymjMusicManager } from '../../Other/DymjMusicManager';
import { ConfigProxy } from "../../Proxy/ConfigProxy";
import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { LoginAfterHttpUtil } from "../../Util/LoginAfterHttpUtil";
import { HttpUtil } from "../../Util/HttpUtil";
import { GameNoDefine } from "../../GameConst/GameNoDefine";

@ccclass
export default class GateStartPanel extends ViewComponent {

    @property(cc.Node)
    settingBtn: cc.Node = null;
    @property(cc.Node)
    myPerformance: cc.Node = null;
    @property(cc.Node)
    bottomNode: cc.Node = null;
    @property(cc.Node)
    helpBtn: cc.Node = null;
    @property(cc.Node)
    wanfaBtn: cc.Node = null;
    @property(cc.Node)
    hlWanfaBtn: cc.Node = null;
    @property(cc.Node)
    msgBtn: cc.Node = null;
    @property(cc.Node)
    shareBtn: cc.Node = null;
    @property(cc.Node)
    logBtn: cc.Node = null;
    @property(cc.Node)
    bonusBtn: cc.Node = null;
    @property(cc.Node)
    NoticeBtn: cc.Node = null;
    @property(cc.Node)
    StoreBtn: cc.Node = null;
    @property(cc.Node)
    HezuoBtn: cc.Node = null;

    @property(cc.Node)
    serviceBtn: cc.Node = null;
    @property(cc.Node)
    exchangeEntrance: cc.Node = null;
    @property(cc.Node)
    gaemContent: cc.Node = null;
    @property(cc.Sprite)
    headSprite: cc.Sprite = null;
    @property(cc.Label)
    nicknameLabel: cc.Label = null;
    @property(cc.Label)
    userNameLabel: cc.Label = null;
    @property(cc.Label)
    goldLabel: cc.Label = null;
    @property(cc.Label)
    clubWaitDeskLabel: cc.Label = null;
    @property(cc.Label)
    clubGameDeskLabel: cc.Label = null;
    @property(cc.Node)
    goldNode: cc.Node = null;
    @property(cc.Node)
    leessangNode: cc.Node = null;
    @property(cc.Label)
    notiveLabel: cc.Label = null;

    private mahjongEntrance: cc.Node;
    private pdkEntrance: cc.Node;
    private otherGamePanel: cc.Node;

    protected async bindUI() {
        this.mahjongEntrance = this.root.getChildByName("gameBg1");
        this.pdkEntrance = this.root.getChildByName("gameBg2");
        this.otherGamePanel = this.root.getChildByName("otherGame");
    }

    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    addButton(node: cc.Node, scale: number = 1.05) {
        let button = node.addComponent(cc.Button);

        button.transition = cc.Button.Transition.SCALE;
        button.zoomScale = 1.05;
        button.duration = 0.1;
    }

    protected async bindEvent() {
        let lianmeng = this.node.getChildByName("m_ract");
        //this.addButton(lianmeng);
        lianmeng.getChildByName('btu_QYQ').on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenQYQPanel, null, '');
        });
        lianmeng.getChildByName('btu_jrfj').on(cc.Node.EventType.TOUCH_END, () => {
            //this.joinClub();
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '抱歉，没有可用房间加入了', toastOverlay: true }, '');

        });
        lianmeng.getChildByName('btu_cjfj').on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '抱歉，您的钻石不足...', toastOverlay: true }, '');
        });

        this.headSprite.node.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenMyCenter, null, '')
        });

        this.bottomNode.children.forEach(node => {
            this.addButton(node, 1.1);
            node.on(cc.Node.EventType.TOUCH_END, (eventData, item) => {
                if (node.name === 'm_hongli') {
                } else if (node.name === 'm_wdyj_btu') {
                }
            }, this, true);
        });

        this.myPerformance.children.forEach(node => {
            this.addButton(node);
            node.on(cc.Node.EventType.TOUCH_END, (eventData, item) => {
                if (node.name === 'm_wdwj_btu') {
                    Facade.Instance.sendNotification(CommandDefine.OpenMyPlayer, null, '');
                } else if (node.name === 'm_wdyj_btu') {
                    Facade.Instance.sendNotification(CommandDefine.OpenMyEnterPrise, null, '');
                } else if (node.name === 'm_wdhl_btu') {
                    Facade.Instance.sendNotification(CommandDefine.OpenBonusIndex, null, '');
                }
            }, this, true);
        });

        this.gaemContent.children.forEach(node => {
            this.addButton(node);
            node.on(cc.Node.EventType.TOUCH_END, (eventData, item) => {
                if (node.name === 'game-cdmj') {
                    this.getGateProxy().joinClub();
                } else if (node.name === 'game-ebg') {
                    this.getGateProxy().joinTuiTongZi();
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

        this.wanfaBtn.on(cc.Node.EventType.TOUCH_END, () => {
            //加载帮助框
            cc.loader.loadRes('prefabs/CDMahjong/CDMJRolePanel', cc.Prefab, (error, item) => {
                const wanfaWindow: cc.Node = cc.instantiate(item);
                this.node.addChild(wanfaWindow);
                wanfaWindow.getChildByName('close').once(cc.Node.EventType.TOUCH_END, () => {
                    wanfaWindow.destroy();
                });
            });
            //Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '开发中，敬请期待...', toastOverlay: true }, '');
        });

        this.hlWanfaBtn.on(cc.Node.EventType.TOUCH_END, () => {
            //加载帮助框
            cc.loader.loadRes('prefabs/CDMahjong/CDMJHLRolePanel', cc.Prefab, (error, item) => {
                const wanfaWindow: cc.Node = cc.instantiate(item);
                this.node.addChild(wanfaWindow);
                wanfaWindow.getChildByName('close').once(cc.Node.EventType.TOUCH_END, () => {
                    wanfaWindow.destroy();
                });
            });
            //Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '开发中，敬请期待...', toastOverlay: true }, '');
        });

        this.msgBtn.on(cc.Node.EventType.TOUCH_END, () => {
            //Facade.Instance.sendNotification(CommandDefine.OpenGiveAwayPanel, {}, '');
            Facade.Instance.sendNotification(CommandDefine.OpenMyPlayer, null, '');
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

        // this.serviceBtn.on(cc.Node.EventType.TOUCH_END, () => {
        //     cc.sys.openURL(this.getConfigProxy().serviceUrl);
        // });

        // this.goldNode.on(cc.Node.EventType.TOUCH_END, () => {
        //     Facade.Instance.sendNotification(CommandDefine.OpenExchangePanel, null, '')
        // });

        this.NoticeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenNoticeAlert, {
                content: this.getConfigProxy().leessang, callback: () => { }
            }, null);
        });
        this.StoreBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '抱歉，商城功能暂未开发，敬请期待...', toastOverlay: true }, '');
        });
        this.HezuoBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: '敬请期待...', toastOverlay: true }, '');
        });
    }

    getConfigProxy() {
        return <ConfigProxy>Facade.Instance.retrieveProxy(ProxyDefine.Config);
    }

    joinClub() {
        this.getGateProxy().joinClub();
    }

    updateUserName(userName: string) {
        if (this.userNameLabel) this.userNameLabel.string = userName;
    }

    updateHead(head: string) {
        this.headSprite && SpriteLoadUtil.loadSprite(this.headSprite, head);
    }

    updateNickname(nickname: string) {
        if (this.nicknameLabel) this.nicknameLabel.string = nickname;
    }

    updateGold(gold: number) {
        //if (this.goldLabel) this.goldLabel.string = gold + "";
    }

    updateClubWaitDeskLabel(value: number) {
        if (this.clubWaitDeskLabel) this.clubWaitDeskLabel.string = `${value}桌等待中`;
    }

    updateClubGameDeskLabel(value: number) {
        if (this.clubGameDeskLabel) this.clubGameDeskLabel.string = `${value}桌游戏中`;
    }

    updateClubSimpleInfo() {
        let url = this.getConfigProxy().facadeUrl + "club/getCreateRoomInfo";
        let param = {
            gameSubClass: 0,
        }
        LoginAfterHttpUtil.send(url, (result) => {
            if (result.hd === 'success') {
                this.updateClubGameDeskLabel(result.bd.gameRoomCount);
                this.updateClubWaitDeskLabel(result.bd.waitBeginRoomCount);
            }
        }, (err) => {

        }, HttpUtil.METHOD_POST, param)
    }

    // onLoad () {
    // }

    start() {
    }

    // update (dt) {}
}
