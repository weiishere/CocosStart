import { SpriteLoadUtil } from "../../Other/SpriteLoadUtil";
import { LocationUtil } from "../../Util/LocationUtil";

const { ccclass, property } = cc._decorator;

export type PlayerData = {
    userName: string,
    nickname: string,
    seatId: number,//座位号，从0开始
    head: string,
    latitude: number,//纬度
    longitude: number//经度
}

@ccclass
export default class CDMJPosition extends cc.Component {

    head1: cc.Node;
    head2: cc.Node;
    head3: cc.Node;
    head4: cc.Node;

    line01: cc.Node;
    line02: cc.Node;
    line03: cc.Node;
    line12: cc.Node;
    line13: cc.Node;
    line23: cc.Node;

    onLoad() {
        this.init();
    }

    init() {
        let bgNode = this.node.getChildByName("bg");

        bgNode.getChildByName("closeBtn").on(cc.Node.EventType.TOUCH_END, () => {
            this.node.destroy();
        });

        this.head1 = bgNode.getChildByName("head1");
        this.head2 = bgNode.getChildByName("head2");
        this.head3 = bgNode.getChildByName("head3");
        this.head4 = bgNode.getChildByName("head4");

        this.line01 = bgNode.getChildByName("line01");
        this.line02 = bgNode.getChildByName("line02");
        this.line03 = bgNode.getChildByName("line03");
        this.line12 = bgNode.getChildByName("line12");
        this.line13 = bgNode.getChildByName("line13");
        this.line23 = bgNode.getChildByName("line23");

        this.head1.active = false;
        this.head2.active = false;
        this.head3.active = false;
        this.head4.active = false;
        this.line01.active = false;
        this.line02.active = false;
        this.line03.active = false;
        this.line12.active = false;
        this.line13.active = false;
        this.line23.active = false;
    }

    start() {
        // this.test();
    }

    setHead(headNode: cc.Node, headUrl: string, nickname: string) {
        headNode.active = true;
        headNode.getChildByName("nickname").getComponent(cc.Label).string = nickname;
        SpriteLoadUtil.loadSprite(headNode.getComponent(cc.Sprite), headUrl);
    }

    setLine(lineNode: cc.Node, dist: number) {
        lineNode.active = true;
        lineNode.getChildByName("label").getComponent(cc.Label).string = `${parseInt(dist.toFixed(0))}米`;
    }

    test() {
        let playerDatas = [];

        let playerData: PlayerData = {
            userName: '1111',
            nickname: "111",
            seatId: 0,
            head: "http://139.9.242.13/static/userHead/r1380.png",
            latitude: 30.666263206127073,
            longitude: 103.98439487213136,
        }
        // playerDatas.push(playerData);

        playerData = {
            userName: '222',
            nickname: "222",
            seatId: 1,
            head: "http://139.9.242.13/static/userHead/r1380.png",
            latitude: 30.666263206127073,
            longitude: 103.98439487213136,
        }
        playerDatas.push(playerData);
        playerData = {
            userName: '333',
            nickname: "333",
            seatId: 2,
            head: "http://139.9.242.13/static/userHead/r1380.png",
            latitude: 39.87345046683832,
            longitude: 116.35594367980957,
        }
        playerDatas.push(playerData);
        playerData = {
            userName: '444',
            nickname: "444",
            seatId: 3,
            head: "http://139.9.242.13/static/userHead/r1380.png",
            latitude: 39.8453174337574,
            longitude: 116.44640922546387,
        }
        playerDatas.push(playerData);

        this.loadData(playerDatas, 4, "222");
    }

    /**
     * 加载数据
     * @param playerDatas 玩家数据
     * @param gameCount 游戏总的人数
     * @param userName 自己的账号
     */
    loadData(playerDatas: PlayerData[], gameCount: number, userName: string) {
        this.changePlayerSeatNo(playerDatas, gameCount, userName);

        playerDatas.sort((v1, v2) => { return v1.seatId - v2.seatId });

        for (let i = 0; i < playerDatas.length; i++) {
            const playerData1 = playerDatas[i];
            for (let j = i + 1; j < playerDatas.length; j++) {
                const playerData2 = playerDatas[j];

                if (playerData1.seatId === playerData2.seatId) {
                    continue;
                }

                let dist = LocationUtil.getGeographicalDistance(playerData1, playerData2);
                let seatStr = playerData1.seatId + "" + playerData2.seatId;
                if (seatStr === "01") {
                    this.setLine(this.line01, dist);
                } else if (seatStr === "02") {
                    this.setLine(this.line02, dist);
                } else if (seatStr === "03") {
                    this.setLine(this.line03, dist);
                } else if (seatStr === "12") {
                    this.setLine(this.line12, dist);
                } else if (seatStr === "13") {
                    this.setLine(this.line13, dist);
                } else if (seatStr === "23") {
                    this.setLine(this.line23, dist);
                }
            }
        }

        for (const playerData of playerDatas) {
            if (gameCount === 3) {
                if (playerData.seatId === 0) {
                    this.setHead(this.head1, playerData.head, playerData.nickname);
                } else if (playerData.seatId === 1) {
                    this.setHead(this.head2, playerData.head, playerData.nickname);
                } else if (playerData.seatId === 2) {
                    this.setHead(this.head4, playerData.head, playerData.nickname);
                }
            } else {
                if (playerData.seatId === 0) {
                    this.setHead(this.head1, playerData.head, playerData.nickname);
                } else if (playerData.seatId === 1) {
                    this.setHead(this.head2, playerData.head, playerData.nickname);
                } else if (playerData.seatId === 2) {
                    this.setHead(this.head3, playerData.head, playerData.nickname);
                } else if (playerData.seatId === 3) {
                    this.setHead(this.head4, playerData.head, playerData.nickname);
                }
            }
        }
    }

    /** 变更玩家座位 */
    changePlayerSeatNo(playerDatas: PlayerData[], gameCount: number, userName: string) {
        let seatId = this.getPlayerData(playerDatas, userName).seatId;
        if (seatId === 0) {
            return;
        }

        for (const playerData of playerDatas) {
            playerData.seatId -= seatId;
            if (playerData.seatId < 0) {
                if (gameCount === 2) {
                    playerData.seatId = 2;
                } else {
                    playerData.seatId += gameCount;
                }
            }
        }
    }

    /** 获得玩家位置 */
    getPlayerData(playerDatas: PlayerData[], userName: string) {
        for (const playerData of playerDatas) {
            if (playerData.userName === userName) {
                return playerData;
            }
        }
        return null;
    }

    // update (dt) {}
}
