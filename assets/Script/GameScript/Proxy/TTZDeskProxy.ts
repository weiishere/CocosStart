import BaseProxy from "./BaseProxy";
import { TTZDeskRepository, GameData, DeskData, UserInfo } from '../repositories/TTZDeskRepository';
import { ConfigProxy } from './ConfigProxy';
import { DeskPlayer } from "../GameData/TuiTongZi/s2c/DeskPlayer";
import { DeskBankerPlayer } from "../GameData/TuiTongZi/s2c/DeskBankerPlayer";
import { S2CPushBetInfo } from "../GameData/TuiTongZi/s2c/S2CPushBetInfo";
import { PlayerBet } from "../GameData/TuiTongZi/s2c/PlayerBet";
import { CommandDefine } from "../TuiTongZiConst/CommandDefine";
import { HistoryItem } from "../GameData/TuiTongZi/s2c/HistoryItem";
import { BankerQueuePlayer } from "../GameData/TuiTongZi/s2c/BankerQueuePlayer";
import { S2CPushRoomPoker } from "../GameData/TuiTongZi/s2c/S2CPushRoomPoker";

export class TTZDeskProxy extends BaseProxy {
    public repository: TTZDeskRepository;
    private dataBackup: { gameData: GameData, deskData: DeskData } = null;


    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new TTZDeskRepository();
        this.dataBackup = JSON.parse(JSON.stringify(this.repository));
    }
    /**初始化自己玩家用户 */
    updateSelfPlayerData(player: DeskPlayer): void {
        this.repository.deskData.playerList.mySelf = this.createUserInfo(player);
    }

    isMy(userName: string): boolean {
        return this.repository.deskData.playerList.mySelf.uid === userName;
    }

    /**初始化玩家列表 */
    initPlayerData(players: DeskPlayer[]): void {
        //console.log('-------------initPlayerData------------------')
        let subPlayer = [];
        for (const deskPlayer of players) {
            if (this.isMy(deskPlayer.name)) {
                continue;
            }
            subPlayer.push(this.createUserInfo(deskPlayer));
        }
        this.repository.deskData.playerList.subPlayer = subPlayer;
    }
    /**添加玩家 */
    createUserInfo(deskPlayer: DeskPlayer): UserInfo {
        let userInfo: UserInfo = {
            uid: deskPlayer.name,
            nickName: deskPlayer.nickname,
            gender: deskPlayer.sex === "w" ? 0 : 1,
            headImg: deskPlayer.headName,
            score: deskPlayer.money,
            phone: "",
            openId: "",
            seatNo: deskPlayer.pos
        }
        return userInfo;
    }

    /**
     * 添加玩家（数组批量）
     * @param players 
     */
    addPlayerData(players: DeskPlayer[]): void {
        console.log('-------------addPlayerData------------------')
        let subPlayers = this.repository.deskData.playerList.subPlayer;
        for (const deskPlayer of players) {
            let has = false;
            for (const subPlayer of subPlayers) {
                if (subPlayer.uid === deskPlayer.name) {
                    has = true;
                    break;
                }
            }
            if (!has) {
                subPlayers.push(this.createUserInfo(deskPlayer));
            }
        }
        this.facade.sendNotification(CommandDefine.RefreshPlayerPush, null, '');
    }

    /**
     * 删除用户
     * @param players 
     * @returns 
     */
    removePlayerData(players: string[]) {
        let subPlayers = this.repository.deskData.playerList.subPlayer;
        if (!subPlayers) {
            return;
        }

        for (const userName of players) {
            for (let index = 0; index < subPlayers.length; index++) {
                const player = subPlayers[index];
                if (player.uid === userName) {
                    subPlayers.slice(index, 1);
                    break;
                }
            }
        }
    }

    /**刷新拼庄用户 */
    updateApplyMasterPlayer(deskBankerPlayers: DeskBankerPlayer[]): void {
        if (!deskBankerPlayers) return;
        this.repository.deskData.playerList.masterPlayer = [];
        for (const deskBankerPlayer of deskBankerPlayers) {
            let userInfo: UserInfo = {
                uid: deskBankerPlayer.acctName,
                nickName: deskBankerPlayer.nickname,
                gender: deskBankerPlayer.sex === "w" ? 0 : 1,
                headImg: deskBankerPlayer.headName,
                score: deskBankerPlayer.money,
                phone: "",
                openId: "",
                seatNo: 0
            }
            this.repository.deskData.playerList.masterPlayer.push({ userInfo: userInfo, percent: deskBankerPlayer.percent });
        }
        this.facade.sendNotification(CommandDefine.RefreshMasterPlayerPush, null, '');
    }

    /**更新牌组 */
    updateCardDataList(pokers: string[], isInit: boolean): void {
        for (let index = 0; index < 4; index++) {
            let start = index * 2;
            let end = start + 2;

            if (index === 0) {
                let positionPokers = pokers.slice(start, end);
                this.repository.gameData.masterData.cards.frist.card = this.convertMahjongValue(parseInt(positionPokers[0]));
                this.repository.gameData.masterData.cards.frist.isShow = true;
                if (positionPokers[1]) {
                    this.repository.gameData.masterData.cards.second.card = this.convertMahjongValue(parseInt(positionPokers[1]));
                    this.repository.gameData.masterData.cards.second.isShow = true;
                } else {
                    this.repository.gameData.masterData.cards.second.card = 0;
                    this.repository.gameData.masterData.cards.second.isShow = false;
                }
            } else if (index === 1) {
                let positionPokers = pokers.slice(start, end);
                this.repository.gameData.subData.shun.cards.frist.card = this.convertMahjongValue(parseInt(positionPokers[0]));
                this.repository.gameData.subData.shun.cards.frist.isShow = true;
                if (positionPokers[1]) {
                    this.repository.gameData.subData.shun.cards.second.card = this.convertMahjongValue(parseInt(positionPokers[1]));
                    this.repository.gameData.subData.shun.cards.second.isShow = true;
                } else {
                    this.repository.gameData.subData.shun.cards.second.card = 0;
                    this.repository.gameData.subData.shun.cards.second.isShow = false;
                }
            } else if (index === 2) {
                let positionPokers = pokers.slice(start, end);
                this.repository.gameData.subData.qian.cards.frist.card = this.convertMahjongValue(parseInt(positionPokers[0]));
                this.repository.gameData.subData.qian.cards.frist.isShow = true;
                if (positionPokers[1]) {
                    this.repository.gameData.subData.qian.cards.second.card = this.convertMahjongValue(parseInt(positionPokers[1]));
                    this.repository.gameData.subData.qian.cards.second.isShow = true;
                } else {
                    this.repository.gameData.subData.qian.cards.second.card = 0;
                    this.repository.gameData.subData.qian.cards.second.isShow = false;
                }
            } else if (index === 3) {
                let positionPokers = pokers.slice(start, end);
                this.repository.gameData.subData.wei.cards.frist.card = this.convertMahjongValue(parseInt(positionPokers[0]));
                this.repository.gameData.subData.wei.cards.frist.isShow = true;
                if (positionPokers[1]) {
                    this.repository.gameData.subData.wei.cards.second.card = this.convertMahjongValue(parseInt(positionPokers[1]));
                    this.repository.gameData.subData.wei.cards.second.isShow = true;
                } else {
                    this.repository.gameData.subData.wei.cards.second.card = 0;
                    this.repository.gameData.subData.wei.cards.second.isShow = false;
                }
            }
        }
        this.sendNotification(CommandDefine.RefreshCardPush, { isInit, isAction: true });
        this.sendNotification(CommandDefine.RefreshGameScorePush);
        if (isInit) {
            this.sendNotification(CommandDefine.RefreshGameScorePush);
        }
    }

    /**
     * 转换为客户端的牌值，推筒子的记录牌值为 0-8是1-9筒，10为幺鸡
     * @param value 
     */
    convertMahjongValue(value: number) {
        if (value === 10) {
            return 19;
        } else {
            return 10 + value;
        }
    }

    getUserInfo(userName: string): UserInfo {
        if (userName === this.repository.deskData.playerList.mySelf.uid) {
            return this.repository.deskData.playerList.mySelf;
        } else {
            let subPlayers = this.repository.deskData.playerList.subPlayer;
            if (subPlayers) {
                for (const subPlayer of subPlayers) {
                    if (subPlayer.uid === userName) {
                        return subPlayer;
                    }
                }
            }
        }

        let masterPlayers = this.repository.deskData.playerList.masterPlayer;
        if (masterPlayers) {
            for (const masterPlayer of masterPlayers) {
                if (masterPlayer.userInfo.uid === userName) {
                    return masterPlayer.userInfo;
                }
            }
        }

        return null;
    }

    initAnteData(playerBetInfo: PlayerBet[]) {
        for (const betInfo of playerBetInfo) {
            let userInfo = this.getUserInfo(betInfo.name);
            if (userInfo) {
                let betValList = betInfo.betValList;
                for (const betVal of betValList) {
                    if (betVal.betType === 0) {
                        this.repository.gameData.subData.shun.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        this.repository.gameData.subData.shun.totalGold += betVal.betVal;

                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.shun += betVal.betVal;
                        }
                    } else if (betVal.betType === 1) {
                        this.repository.gameData.subData.qian.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        this.repository.gameData.subData.qian.totalGold += betVal.betVal;
                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.qian += betVal.betVal;
                        }
                    } else if (betVal.betType === 2) {
                        this.repository.gameData.subData.wei.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        this.repository.gameData.subData.wei.totalGold += betVal.betVal;
                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.wei += betVal.betVal;
                        }
                    }
                }
            }
        }
        this.sendNotification(CommandDefine.RefreshGameScorePush);
    }

    /**
     * 更新玩家下注数据
     * @param betInfos 
     */
    updateAnteData(betInfos: S2CPushBetInfo[]): void {
        for (const betInfo of betInfos) {
            let userInfo = this.getUserInfo(betInfo.playerName);
            if (userInfo) {
                let betValList = betInfo.betValList;
                for (const betVal of betValList) {
                    if (betVal.betType === 0) { //顺门的下注
                        this.repository.gameData.subData.shun.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        // 累计这个位置的总的下注
                        this.repository.gameData.subData.shun.totalGold += betVal.betVal;
                        // 累计自己的下注数据
                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.shun += betVal.betVal;
                        }
                        //const {serInfo, subArea, amount} = 
                        this.sendNotification(CommandDefine.PlayerPutAntePush, { userInfo, subArea: 'shun', amount: betVal.betVal });
                    } else if (betVal.betType === 1) {//迁门的下注
                        this.repository.gameData.subData.qian.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        // 累计这个位置的总的下注
                        this.repository.gameData.subData.qian.totalGold += betVal.betVal;
                        // 累计自己的下注数据
                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.qian += betVal.betVal;
                        }
                        this.sendNotification(CommandDefine.PlayerPutAntePush, { userInfo, subArea: 'qian', amount: betVal.betVal });
                    } else if (betVal.betType === 2) {//尾门的下注
                        this.repository.gameData.subData.wei.glods.push({ userInfo: userInfo, amount: betVal.betVal });
                        // 累计这个位置的总的下注
                        this.repository.gameData.subData.wei.totalGold += betVal.betVal;
                        // 累计自己的下注数据
                        if (this.isMy(userInfo.uid)) {
                            this.repository.gameData.myAnteData.wei += betVal.betVal;
                        }
                        this.sendNotification(CommandDefine.PlayerPutAntePush, { userInfo, subArea: 'wei', amount: betVal.betVal });
                    }
                }
            }
        }
        this.sendNotification(CommandDefine.RefreshGameScorePush);

    }

    /**
     * 初始化历史记录
     * @param historyItems 
     */
    initHistory(historyItems: HistoryItem[]) {
        this.repository.gameData.historys = historyItems;
    }

    /**
     * 添加历史记录
     * @param historyItem 
     */
    addHistory(historyItem: HistoryItem) {
        if (this.repository.gameData.historys.length >= 20) {
            this.repository.gameData.historys.shift();
        }
        this.repository.gameData.historys.push(historyItem);

    }

    /**
     * 更新游戏状态字符串
     * @param str 
     */
    updateGameStateStr(str: string) {
        this.repository.gameData.stateStr = str;
        this.sendNotification(CommandDefine.RefreshGamePromptPush);
    }

    /**
     * 更新等待排队的庄家列表
     */
    updateWaitBankerList(bankerWaitList: BankerQueuePlayer[]) {
        let users = [];
        for (const bankerQueuePlayer of bankerWaitList) {
            let userInfo = this.getUserInfo(bankerQueuePlayer.name);
            if (userInfo) {
                users.push(userInfo);
            }
        }
        this.repository.deskData.playerList.applyMasterPlayer = users;
    }

    /**
     * 游戏结果
     * @param s2CPushRoomPoker 结算数据
     */
    gameResult(s2CPushRoomPoker: S2CPushRoomPoker) {
        this.updateCardDataList(s2CPushRoomPoker.pokers, false);
        this.repository.gameData.presentResult = s2CPushRoomPoker;
        this.repository.gameData.subData.shun.totalGold = 0;
        this.repository.gameData.subData.qian.totalGold = 0;
        this.repository.gameData.subData.wei.totalGold = 0;
        this.sendNotification(CommandDefine.ShowResult);
    }

    /**更新玩家金币变化 */
    updatePlayerGlod(playerId: string, glod: number) {

        this.sendNotification(CommandDefine.RefreshPlayerGload, { playerId, glod });
    }

    getGameData(): GameData {
        return this.repository.gameData;
    }
    getDeskData(): DeskData {
        return this.repository.deskData;
    }
}
