/**
 * 手机号码注册或者登录请求数据
 */
export class PhoneRegisterOrLoginData {
    public phoneNo: string;
    // 验证码
    public code: string;
    // 邀请码
    public invitationCode: string;
    public nickname: string = '';

    constructor(phoneNo: string, code: string, invitationCode: string) {
        this.phoneNo = phoneNo;
        this.code = code;
        this.invitationCode = invitationCode;
    }
}