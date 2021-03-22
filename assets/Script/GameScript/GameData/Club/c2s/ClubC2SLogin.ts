/**
 * 俱乐部登录消息
 */
export class ClubC2SLogin {
    token: string;
    clubNo: number;
    gameNo: number;
    constructor(token: string, clubNo: number, gameNo: number) {
        this.token = token;
        this.clubNo = clubNo;
        this.gameNo = gameNo;
    }
}