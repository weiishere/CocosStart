export type UserInfo = {
    uid: string,
    nickName: string,
    gender: Number,
    headImg: string,
    score: Number,
    phone: string,
    openId: string
}

export class GateRepository {
    public userInfo: UserInfo
    public loginPhoneNumber:string
    public verificationCode:string
}