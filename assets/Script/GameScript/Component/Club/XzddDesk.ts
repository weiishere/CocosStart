import Facade from '../../../Framework/care/Facade';
import { S2CClubRoomInfoBase } from '../../GameData/Club/s2c/S2CClubRoomInfoBase';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import { SpriteLoadUtil } from '../../Other/SpriteLoadUtil';
import BaseDesk from './BaseDesk';
import DeskList from './DeskList';

const { ccclass, property } = cc._decorator;


class MahjongVipRule {
    /** 自摸加底 */
    public static ZI_MO_JIA_DI = 0;
    /** 自摸加番 */
    public static ZI_MO_JIA_FAN = 1;
    /** 天地胡 */
    public static TIAN_DI_HU = 2;
    /** 幺九将对 */
    public static YAO_JIU_JIANG_DUI = 3;
    /** 点杠花（点炮） */
    public static DIAN_GANG_HUA_DIAN_PAO = 4;
    /** 点杠花（自摸） */
    public static DIAN_GANG_HUA_ZI_MO = 5;
    /** 天胡 */
    public static TIAN_HU = 6;
    /** 地胡 */
    public static DI_HU = 7;
    /** 换3张 */
    public static Huan3Zhang = 16;
    /** 门清 */
    public static MEN_QING = 19;
    /** 中张 */
    public static ZHONG_ZHANG = 20;
    /** 海底捞 */
    public static HAI_DI_LAO = 21;
    /** 海底炮 */
    public static HAI_DI_PAO = 23;
    /** 至少2番起胡 */
    public static MIN_TWO_FAN_HU = 25;

    public static values = [
        {
            key: MahjongVipRule.ZI_MO_JIA_DI,
            name: "自摸加底"
        },
        {
            key: MahjongVipRule.ZI_MO_JIA_FAN,
            name: "自摸加番"
        },
        {
            key: MahjongVipRule.TIAN_DI_HU,
            name: "天地胡"
        },
        {
            key: MahjongVipRule.YAO_JIU_JIANG_DUI,
            name: "幺九将对"
        },
        {
            key: MahjongVipRule.DIAN_GANG_HUA_DIAN_PAO,
            name: "点杠花(点炮)"
        },
        {
            key: MahjongVipRule.DIAN_GANG_HUA_ZI_MO,
            name: "点杠花(自摸)"
        },
        // {
        //     key: MahjongVipRule.TIAN_HU,
        //     name: "天胡"
        // },
        // {
        //     key: MahjongVipRule.DI_HU,
        //     name: "地胡"
        // },
        {
            key: MahjongVipRule.Huan3Zhang,
            name: "换三张"
        },
        {
            key: MahjongVipRule.MEN_QING,
            name: "门清"
        },
        {
            key: MahjongVipRule.ZHONG_ZHANG,
            name: "断幺九"
        },
        {
            key: MahjongVipRule.HAI_DI_LAO,
            name: "海底捞"
        },
        {
            key: MahjongVipRule.HAI_DI_PAO,
            name: "海底炮"
        },
        {
            key: MahjongVipRule.MIN_TWO_FAN_HU,
            name: "2番起胡"
        },
    ];

    public static getRuleName(ruleValue: number) {
        for (const value of this.values) {
            if (value.key === ruleValue) {
                return value.name;
            }
        }
        return "";
    }
}

@ccclass
export default class XzddDesk extends BaseDesk {

    @property(cc.Label)
    roomTypeLabel: cc.Label = null;
    @property(cc.Label)
    anteLabel: cc.Label = null;
    @property(cc.Label)
    enterLimitLabel: cc.Label = null;
    @property(cc.Label)
    roundCountLabel: cc.Label = null;
    @property(cc.Node)
    deskBG: cc.Node = null;
    @property(cc.Sprite)
    head1: cc.Sprite = null;
    @property(cc.Sprite)
    head2: cc.Sprite = null;
    @property(cc.Sprite)
    head3: cc.Sprite = null;
    @property(cc.Sprite)
    head4: cc.Sprite = null;
    @property(cc.Node)
    detailBtn: cc.Node = null;

    _maxPlayerNum: number;
    ruleStr: string;

    bindEvent() {
        super.bindEvent();

        this.detailBtn.on(cc.Node.EventType.TOUCH_END, () => {
            Facade.Instance.sendNotification(CommandDefine.OpenXzddRuleDetail, { content: this.ruleStr, roomNo: this.roomNo }, null);
        });
    }

    initData(s2CClubRoomInfoBase: S2CClubRoomInfoBase) {
        this.head1.node.active = false;
        this.head2.node.active = false;
        this.head3.node.active = false;
        this.head4.node.active = false;

        let roomType = "";
        if (s2CClubRoomInfoBase.roomType === 0) {
            roomType = "两人一房";
        } else if (s2CClubRoomInfoBase.roomType === 1) {
            roomType = "两人两房";
        } else if (s2CClubRoomInfoBase.roomType === 2) {
            roomType = "三人两房";
        } else if (s2CClubRoomInfoBase.roomType === 3) {
            roomType = "血战到底";
        }

        this.setRuleStr(s2CClubRoomInfoBase)

        this._maxPlayerNum = s2CClubRoomInfoBase.maxPlayerNum;

        this.setDeskBG();

        this.roomNo = s2CClubRoomInfoBase.roomNo;
        this.basicScore = s2CClubRoomInfoBase.basicScore;
        this.enterLimit = s2CClubRoomInfoBase.enterLimit;
        this.roomType = s2CClubRoomInfoBase.roomType;
        this.roomTypeLabel.string = roomType;
        this.anteLabel.string = `分:${s2CClubRoomInfoBase.basicScore}`;
        this.enterLimitLabel.string = `入:${s2CClubRoomInfoBase.enterLimit}`;
        this.setRoundCount(s2CClubRoomInfoBase.currentGameCount, s2CClubRoomInfoBase.gameCount);

        let userInfos = s2CClubRoomInfoBase.userInfos;

        let gameParamObj = JSON.parse(s2CClubRoomInfoBase.gameParam);
        if (this.isHuanSanZhang(gameParamObj)) {
            this.roomTypeLabel.string += `(换三张)`
        }

        for (const userInfo of userInfos) {
            this.sitDown(userInfo.head, userInfo.nickname, userInfo.seatNo);
        }
    }

    setRuleStr(s2CClubRoomInfoBase: S2CClubRoomInfoBase) {
        this.ruleStr = "首局自动开始 离线30秒自动托管 ";
        if (s2CClubRoomInfoBase.roomType === 0) {
            this.ruleStr += "7张 "
        }
        let gameParamObj = JSON.parse(s2CClubRoomInfoBase.gameParam);

        this.ruleStr += `${gameParamObj.maxFanNum}番封顶 `;
        let rules: number[] = gameParamObj.rules;

        if (rules) {
            rules.forEach((v, i) => {
                let ruleName = MahjongVipRule.getRuleName(v);
                if (ruleName) {
                    this.ruleStr += ruleName + " ";
                }
                if (v === MahjongVipRule.TIAN_DI_HU) {
                    this.ruleStr += "对对胡 ";
                }
            })
        }

        if(s2CClubRoomInfoBase.roomType === 0){
            this.ruleStr = "首局自动开始，离线30秒自动托管，低于带入自动解散。天地胡，听牌提示，点杠花（自摸）门清中张，4番封顶，点炮可平胡，自摸加番，夹心五，对对胡两番，幺九，海底涝，海底炮，7张";
        }else if(s2CClubRoomInfoBase.roomType === 1){
            this.ruleStr = "首局自动开始，离线30秒自动托管，低于带入自动解散。两方，天地胡，听牌提示，点杠花（自摸）门清中张，4番封顶，换三张，自摸加番，夹心五，对对胡两番，幺九将对，海底涝，海底炮，两番起胡";
        }else if(s2CClubRoomInfoBase.roomType === 2){
            this.ruleStr = "首局自动开始，离线30秒自动托管，低于带入自动解散。天地胡，听牌提示，点杠花（自摸）门清中张，4番封顶，自摸加番，夹心五，对对胡两番，幺九将对，海底涝，海底炮，两番起胡，放牛必须过庄，GPS防作弊（500米）IP防作弊";
        }else if(s2CClubRoomInfoBase.roomType === 3){
            this.ruleStr = "首局自动开始，离线30秒自动托管，低于带入自动解散。天地胡，听牌提示，点杠花（自摸）换三张，点炮可平胡。门清中张，4番封顶，自摸加番，夹心五，对对胡两番，幺九将对，海底涝，海底炮，放牛必须过庄，GPS防作弊（500米）IP防作弊";
        }
    }

    setDeskBG() {
        if (this._maxPlayerNum === 2) {
            this.deskBG.getComponent("ExtendSprite").index = 0;
        } else if (this._maxPlayerNum === 3) {
            this.deskBG.getComponent("ExtendSprite").index = 1;
        } else if (this._maxPlayerNum === 4) {
            this.deskBG.getComponent("ExtendSprite").index = 2;
        }
    }

    isHuanSanZhang(gameParamObj: any) {
        for (const rule of gameParamObj.rules) {
            if (rule === 16) {
                return true;
            }
        }
        return false;
    }

    setRoundCount(currentGameCount: number, gameCount: number) {
        if (gameCount > 0) {
            this.roundCountLabel.string = `第${currentGameCount}/${gameCount}局`;
        } else {
            this.roundCountLabel.string = "";
        }
    }

    /**
     * 获得坐下的人数
     */
    getSitDownCount() {
        let count = this.head1.node.active ? 1 : 0;
        count += this.head2.node.active ? 1 : 0;
        count += this.head3.node.active ? 1 : 0;
        count += this.head4.node.active ? 1 : 0;
        return count;
    }

    isFull() {
        return this.getSitDownCount() == this._maxPlayerNum;
    }

    sitDown(head: string, nickname: string, seatNo: number) {
        let headSprite: cc.Sprite = null;
        if (seatNo === 1) {
            headSprite = this.head1;
        } else if (seatNo === 2) {
            headSprite = this.head2;
        } else if (seatNo === 3) {
            headSprite = this.head3;
        } else if (seatNo === 4) {
            headSprite = this.head4;
        }

        headSprite.node.active = true;
        let nicknameLabel = headSprite.node.getChildByName("Nickname").getComponent(cc.Label);
        nicknameLabel.string = nickname;

        SpriteLoadUtil.loadSprite(headSprite, head);
    }

    standUp(seatNo: number) {
        let headSprite: cc.Sprite = null;
        if (seatNo === 1) {
            headSprite = this.head1;
        } else if (seatNo === 2) {
            headSprite = this.head2;
        } else if (seatNo === 3) {
            headSprite = this.head3;
        } else if (seatNo === 4) {
            headSprite = this.head4;
        }

        let nicknameLabel = headSprite.node.getChildByName("Nickname").getComponent(cc.Label);
        nicknameLabel.string = "";
        headSprite.spriteFrame = null;
        headSprite.node.active = false;
    }

    getMaxPlayerNum() {
        return this._maxPlayerNum;
    }

    // update (dt) {}
}
