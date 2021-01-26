// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ErrorCorrectLevel, QRCode } from "../ts/index";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareAlert extends cc.Component {

    @property(cc.Label)
    inviteCodeLabel: cc.Label = null;
    @property(cc.Node)
    qrCodeNode: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    graphics: cc.Graphics;

    onLoad() {
        this.graphics = this.qrCodeNode.addComponent(cc.Graphics)
    }

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy()
        })
    }

    loadData(inviteCode, shareUrl: string) {
        this.inviteCodeLabel.string = "邀请码：" + inviteCode;

        this.graphics.fillColor = cc.Color.BLACK;
        let qrcode = new QRCode();
        qrcode.setTypeNumber(5);
        // qrcode.setErrorCorrectLevel(ErrorCorrectLevel.H);
        qrcode.addData(shareUrl);
        qrcode.make();

        //块宽高
        let tileW = this.qrCodeNode.width / qrcode.getModuleCount();
        let tileH = this.qrCodeNode.height / qrcode.getModuleCount();

        for (let row = 0; row < qrcode.getModuleCount(); row++) {
            for (let col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    // ctx.fillColor = cc.Color.BLACK;
                    let w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    let h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    this.graphics.rect(Math.round(col * tileW) - this.qrCodeNode.width / 2, Math.round(row * tileH) - this.qrCodeNode.height / 2, w, h);
                    this.graphics.fill();
                }
            }
        }
    }

    // update (dt) {}
}
