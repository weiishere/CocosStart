// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import ViewComponent from "../Base/ViewComponent";

@ccclass
export default class UserHeader extends ViewComponent {
    private head: cc.Sprite = null;
    private nickname: cc.Label = null;
    private uid: cc.Label = null;
    private glod: cc.Label = null;

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    protected bindUI(): void {
        this.head = this.root.getChildByName("head").getComponent(cc.Sprite);
        this.nickname = this.root.getChildByName("nickname").getComponent(cc.Label);
        this.uid = this.root.getChildByName("IDMark").getChildByName("uid").getComponent(cc.Label);
        this.glod = this.root.getChildByName("gold_show_bg").getChildByName("glod").getComponent(cc.Label);
        //this.glod = cc.find("Canvas/userHeader/gold_show_bg/glod").getComponent(cc.Label);
    }
    protected bindEvent(): void {

    }

    start() {

    }
    showAcount(loginData) {
        // createDate: 1610331705893
        // email: ""
        // gold: 0
        // head: "http://139.9.242.13/static/userHead/r1.png"
        // nickname: "君临浪迹"
        // password: "145b03d331d140d4861e8d4d437637f8"
        // phoneNo: "13688334620"
        // registerType: 0
        // sex: 0
        // shortHead: "r1.png"
        // signature: ""
        // status: 0
        // userName: "4047487"
        const { head, nickname, userName, gold } = loginData;
        this.nickname.string = nickname;
        this.uid.string = userName;
        this.updateGold(gold);

        let headTexture = cc.loader.getRes(head, cc.Texture2D);
        if (headTexture) {
            this.head.spriteFrame = new cc.SpriteFrame(headTexture);
        } else {
            cc.loader.load(head, (error, item) => {
                this.head.spriteFrame = new cc.SpriteFrame(item)
            });
        }
        //this.head.spriteFrame=
    }

    updateGold(gold) {
        this.glod.string = gold;
    }
    // update (dt) {}
}
