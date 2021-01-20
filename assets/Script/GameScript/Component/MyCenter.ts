import ViewComponent from '../Base/ViewComponent';
import { LoginData } from '../GameData/LoginData';
import { SpriteLoadUtil } from '../Other/SpriteLoadUtil';
import Facade from '../../Framework/care/Facade';
import { ProxyDefine } from '../MahjongConst/ProxyDefine';
import { GateProxy } from '../Proxy/GateProxy';

const { ccclass, property } = cc._decorator;

@ccclass
export default class MyCenter extends ViewComponent {

    @property(cc.Label)
    nicknameLabel: cc.Label = null;
    @property(cc.Label)
    phoneNoLabel: cc.Label = null;
    @property(cc.Label)
    inviteCodeLabel: cc.Label = null;
    @property(cc.Sprite)
    headSprite: cc.Sprite = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    copyBtn: cc.Node = null;

    protected bindUI(): void {
    }
    protected bindEvent(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.copyBtn.on(cc.Node.EventType.TOUCH_END, (event) => {
            let inviteCode = this.inviteCodeLabel.string;
            if (!inviteCode) {
                return;
            }
            if (CC_JSB) {
                (<any>jsb).copyTextToClipboard(inviteCode);
                this.getGateProxy().toast("邀请码复制成功");
            }
        });
    }

    loadData(loginData: LoginData, inviteCode: string) {
        this.nicknameLabel.string = loginData.nickname;
        this.phoneNoLabel.string = loginData.phoneNo;
        this.inviteCodeLabel.string = inviteCode;
        SpriteLoadUtil.loadSprite(this.headSprite, loginData.head);
    }

    getGateProxy() {
        return <GateProxy>Facade.Instance.retrieveProxy(ProxyDefine.Gate);
    }

    start() {

    }

    // update (dt) {}
}
