// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { TuiTongZiSuitType } from "../../GameData/TuiTongZi/TuiTongZiSuitType";
import { TTZMusicManager } from '../../Other/TTZMusicManager';

const { ccclass, property } = cc._decorator;
@ccclass
export default class CardResult extends cc.Component {



    type: TuiTongZiSuitType;
    num: number;
    times: number

    @property(cc.Node)
    dian: cc.Node = null;

    @property(cc.Node)
    cardNumType: cc.Node = null;

    @property(cc.Node)
    timesNum: cc.Node = null;

    @property(cc.Node)
    cardType: cc.Node = null;

    @property(cc.SpriteFrame)
    duizi: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    erbaGang: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    pieShi: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    yaojiDui: cc.SpriteFrame = null;

    /**
     * 
     * @param num 点数
     * @param type 类别
     * @param times 倍数
     */
    show(num: number, type: TuiTongZiSuitType, times: number) {
        this.num = num;
        this.type = type;
        this.times = times;
        if (type === TuiTongZiSuitType.POINT_POKER) {
            //点数
            this.cardType.active = false;
            this.cardNumType.getChildByName('num').getComponent(cc.Label).string = parseInt(num + '') + '';
            this.cardNumType.getChildByName('ban').active = !(~~num === num);
        } else {
            //特殊牌型
            this.cardNumType.active = false;
            const typeShow = this.cardType.getChildByName('typeShow');
            switch (type) {
                case TuiTongZiSuitType.AO_TEN:
                    typeShow.getComponent(cc.Sprite).spriteFrame = this.pieShi;
                    break;
                case TuiTongZiSuitType.PAIR:
                    typeShow.getComponent(cc.Sprite).spriteFrame = this.duizi;
                    break;
                case TuiTongZiSuitType.TWO_EIGHT_GANG:
                    typeShow.getComponent(cc.Sprite).spriteFrame = this.erbaGang;
                    break;
                case TuiTongZiSuitType.YAO_JI_PAIR:
                    typeShow.getComponent(cc.Sprite).spriteFrame = this.yaojiDui;
                    break;
            }
        }
        //TTZMusicManager.playResult(type, num);
        if (times !== 1) {
            this.timesNum.getChildByName('num').getComponent(cc.Label).string = times + '';
        } else {
            this.timesNum.active = false;
        }
        // this.scheduleOnce(() => {
        //     this.node.active = false;
        // }, 2);
    }

    start() {

    }

}
