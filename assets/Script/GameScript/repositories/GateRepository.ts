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
    public userInfo: UserInfo = {
        uid: '',
        nickName: '',
        gender: 0,
        headImg: '',
        score: 0,
        phone: '',
        openId: ''
    }
    public loginPhoneNumber: string = ""
    public verificationCode: string = ""


}