import { S2CClubRoomInfoBase } from './S2CClubRoomInfoBase';
export class S2CJoinClubInfo {
    clubNo: number;
    clubName: string;
    ownerId: string;
    /** 是否打烊 */
    isClosing: boolean;
    /** 公告 */
    notice: string;
    /** 房间列表 */
    roomInfos: Array<S2CClubRoomInfoBase>;
}