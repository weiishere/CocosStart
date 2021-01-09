/**
 * 俱乐部登录消息
 */
export class ClubC2SLogin {
    token: string;
    clubNo: number;
    constructor(token: string, clubNo: number) {
        this.token = token;
        this.clubNo = clubNo;
    }
}