export enum XzddErrorCode {
    SUCCEED = 0,
    /** 退出房间失败 */
    EXIT_ROOM_FAILURE = 100001,
    /** 低于准入限制 */
    UNDER_LIMIT = 100002,
    /** 高于准入限制 */
    EXCEED_LIMIT = 100003,
    /** 用户现金不足 */
    PLAYER_CASH_STORTAGE = 100004,
    /** 玩家不在房间中 */
    PLAYER_NOT_ROOM_IN = 100006,
    /** 游戏关闭 */
    GAME_CLOSE = 100007,
    /** 房间不存在 */
    ROOM_NOT_EXIST = 100008,
    /** 房间被禁用了 */
    ROOM_DISABLE = 100009,
    /** 比赛报名失败 */
    MATCH_APPLY_FAILURE = 100010,
    /** 比赛中被淘汰了 */
    MATCH_WEED_OUT = 100011,
    /** 比赛报名费不足 */
    MATCH_APPLY_FEE_LCAK = 100012,
    /** 比赛低于准入限制 */
    MATCH_UNDER_ENTER_LIMIT = 100013,
    /** 已报名比赛，不能进入麻将 */
    ALREADY_APPLY_MATCH = 100014,
    /** 获得包间用户数据失败 */
    GET_VIP_PLAYER_DATA_FAILURE = 100015,
    /** 包间不存在 */
    VIP_NOT_EXIST = 100016,
    /** 包间被解散了 */
    VIP_ROOM_DISSOLVE = 100017,
    /** 亲友圈被解散了 */
    FRIENDS_DISSOLVE = 100018,
    /** 开始包间失败 */
    BEGIN_VIP_ROOM_FAILURE = 100019,
    /** 目前正在解散中 */
    NOW_IN_DISSOLVE = 100020,
    /** 游戏中不能发起解散 */
    GAME_IN_NOT_SPONSOR_DISSOLVE = 100021,
    /** 不是房主不能解散包间 */
    NOT_OWNER_NOT_DISSOLVE = 100022,
    /** 房间人数满了 */
    ROOM_FULL = 100023,
    /** 包间游戏没有结束，不能进入其他游戏的麻将 */
    VIP_GAME_NOT_OVER_UNABLE_ENTER_GAME_TYPE_MAHJONG = 100024,
    /** 低于离场准入限制 */
    UNDER_QUIT_ROOM_LIMIT = 100025,
    /** 包间解散失败 */
    VIP_ROOM_DISSOLVE_FAILURE = 100026,
}