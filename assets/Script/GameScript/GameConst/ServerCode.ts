export enum ServerCode {
    /** 成功 */
    SUCCEED = 0,
    /** 通用错误 */
    ERROR = -1,
    /** 用户名不存在 */
    USER_NOT_EXIST = -2,
    /** 密码错误 */
    PWD_ERROR = -3,
    /** 用户名已经存在了 */
    USER_EXIST = -4,
    /** token错误 */
    TOKEN_ERROR = -5,
    /** 邀请码不能为null */
    INVITATION_CODE_NULL = -6,
    /** 手机号码存在了 */
    PHONE_NO_EXIST = -7,
    /** 验证码错误 */
    SECURITY_CODE_ERROR = -8,
    /** 系统维护中 */
    SYSTEM_MAINTAIN = -9,
}