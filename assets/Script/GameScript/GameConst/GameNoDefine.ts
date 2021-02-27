export class GameNoDefine {
    static DUI_ZHAN_NIU_NIU: number = 1;
    static CLUB_SERVER = 2;
    static DA_YI_ER_REN_MAHJONG = 3;
    static XUE_ZHAN_DAO_DI = 4;
    static TUI_TONG_ZI = 5;

    static getGameName(gameNo: number): string {
        if (this.DUI_ZHAN_NIU_NIU === gameNo) {
            return "牛牛";
        } else if (this.CLUB_SERVER === gameNo) {
            return "俱乐部";
        } else if (this.DA_YI_ER_REN_MAHJONG === gameNo) {
            return "断勾卡";
        } else if (this.XUE_ZHAN_DAO_DI === gameNo) {
            return "血战到底";
        } else if (this.TUI_TONG_ZI === gameNo) {
            return "推筒子";
        }
    }
}