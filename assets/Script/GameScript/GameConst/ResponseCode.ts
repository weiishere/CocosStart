export enum ResponseCode {
    SUCCESS = 1,
    ERROR = -1,
    SERVICE_NOT_AVAILABLE = 2,

    /** 用户不存在 */
    USER_NOT_EXIST = 100,
    /** 用户密码错误 */
    USER_PWD_ERROR = 101,
    /** 用户被禁用 */
    USER_DISABLE = 102,
    /** 注册太频繁了 */
    REGISTER_OFTEN = 103,
    /** 金币不足 */
    GOLD_LACK = 104,
    /** 手机号存在了 */
    PHONE_NO_EXIST = 105,
    /** 游戏中不能下分 */
    GAME_NOT_DOWN_SCORE = 106,

    /** TOKEN不存在或者已过期 */
    LOGIN_TOKEN_NOT_EXIST = 201,
    /** TOKEN错误 */
    LOGIN_TOKEN_ERROR = 202,
    /** 系统维护中 */
    SERVER_MAINTAIN = 203,

    /** 创建房间的参数错误 */
    CREATE_ROOM_PARAM_ERROR = 301,
    /** 创建房间失败 */
    CREATE_ROOM_FAILURE = 302,
    /** 创建房间达到上限 */
    CREATE_ROOM_COUNT_LIMIT = 303,
    /** 解散包间失败 */
    DISSOLVE_ROOM_FAILURE = 304,
    /** 俱乐部不存在 */
    CLUB_NOT_EXIST = 305,
}