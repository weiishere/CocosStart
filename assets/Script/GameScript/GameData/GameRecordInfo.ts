import { RoomPlayerCredit } from './RoomPlayerCredit';
export class GameRecordInfo {
    roomNo: number;
    bankerType: string;
    anteStr: string;
    robBankerOdds: number;
    roundNumber: number;
    endTime: string;
    roomPlayerCreditDtos: RoomPlayerCredit[];
    ownerUserName: string;
    /** 房主 */
    ownerNickname: string;
    roomRoundNo: string;
    gameSubClass: number;
}