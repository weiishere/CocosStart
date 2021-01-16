// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";
import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { SpriteLoadUtil } from '../Other/SpriteLoadUtil';

@ccclass
export default class UserHeader extends ViewComponent {


    @property(cc.Node)
    goldBgNode: cc.Node = null;

    private head: cc.Sprite = null;
    private nickname: cc.Label = null;
    private uid: cc.Label = null;
    private glod: cc.Label = null;


    // onLoad () {}
    protected bindUI(): void {
        this.head = this.root.getChildByName("head").getComponent(cc.Sprite);
        this.nickname = this.root.getChildByName("nickname").getComponent(cc.Label);
        this.uid = this.root.getChildByName("IDMark").getChildByName("uid").getComponent(cc.Label);
        this.glod = this.root.getChildByName("gold_show_bg").getChildByName("glod").getComponent(cc.Label);
    }
    protected bindEvent(): void {
        this.goldBgNode.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenExchangePanel, null, '')
        });
    }

    start() {

    }
    showAcount(loginData) {
        const { head, nickname, userName, gold } = loginData;
        this.nickname.string = nickname;
        this.uid.string = userName;
        this.updateGold(gold);

        SpriteLoadUtil.loadSprite(this.head, head);
    }

    updateGold(gold) {
        this.glod.string = gold;
    }
}
