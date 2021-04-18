/**
 * 手机号码注册或者登录请求数据
 */
export class PhoneRegisterOrLoginData {
    public phoneNo: string;
    public nickname: string;
    // 验证码
    public code: string;
    // 邀请码
    public invitationCode: string;

    constructor(phoneNo: string, code: string, invitationCode: string, nickname: string) {
        this.phoneNo = phoneNo;
        this.code = code;
        this.invitationCode = invitationCode;
        this.nickname = nickname;
    }
}