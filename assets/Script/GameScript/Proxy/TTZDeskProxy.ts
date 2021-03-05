import BaseProxy from "./BaseProxy";
import { TTZDeskRepository, GameData, DeskData } from '../repositories/TTZDeskRepository';
import { ConfigProxy } from './ConfigProxy';

export class TuiTongZiProxy extends BaseProxy {
    private repository: TTZDeskRepository;
    private dataBackup: { gameData: GameData, deskData: DeskData } = null;


    public constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.repository = new TTZDeskRepository();
        this.dataBackup = JSON.parse(JSON.stringify(this.repository));
    }
    /**初始化自己玩家用户 */
    updateSelfPlayerData(): void {

    }
    /**刷新玩家列表 */
    updatePlayerData(): void {

    }
    /**刷新拼庄用户 */
    updateApplyMasterPlayer(): void {

    }
    /**更新牌组 */
    updateCardDataList(): void {

    }
    /**下注数据更新 */
    updateAnteDate(): void {

    }
    
    getGameData(): GameData {
        return this.repository.gameData;
    }
    getDeskData(): DeskData {
        return this.repository.deskData;
    }
}
