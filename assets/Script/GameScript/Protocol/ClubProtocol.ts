import { OperationDefine } from '../GameConst/OperationDefine';
export enum ClubProtocol {
    SERVER_PUSH = 500;
    
    /** 获得自己创建的普通包间列表 */
    C2S_GENERAL_ROOM_LIST = OperationDefine.CLUB_SERVICE + 1,
    /** 获得自己加入的俱乐部列表 */
    C2S_GET_CLUB_LIST = OperationDefine.CLUB_SERVICE + 2,
    /** 进入俱乐部 */
    C2S_JOIN_CLUB = OperationDefine.CLUB_SERVICE + 3,
    /** 退出俱乐部 */
    C2S_QUIT_CLUB = OperationDefine.CLUB_SERVICE + 4,
    /** 进入包间 */
    C2S_JOIN_ROOM = OperationDefine.CLUB_SERVICE + 5,
    /** 退出包间 */
    C2S_QUIT_ROOM = OperationDefine.CLUB_SERVICE + 6,
    /** 创建俱乐部 */
    C2S_CREATE_CLUB = OperationDefine.CLUB_SERVICE + 7,
    /** 创建俱乐部房间 */
    C2S_CREATE_CLUB_ROOM = OperationDefine.CLUB_SERVICE + 8,
    /** 创建普通房间 */
    C2S_CREATE_GENERAL_ROOM = OperationDefine.CLUB_SERVICE + 9,
    /** 登录俱乐部 */
    C2S_LOGIN_CLUB = OperationDefine.CLUB_SERVICE + 10,
    /** 登出俱乐部 */
    C2S_LOGOUT_CLUB = OperationDefine.CLUB_SERVICE + 11,
    /** 申请加入俱乐部 */
    C2S_APPLY_JOIN_CLUB = OperationDefine.CLUB_SERVICE + 12,
    /** 申请加入俱乐部 */
    C2S_DELETE_ROOM = OperationDefine.CLUB_SERVICE + 13,
    /** 申请加入俱乐部 */
    C2S_UPDATE_ROOM = OperationDefine.CLUB_SERVICE + 14,
    /** 删除俱乐部用户 */
    C2S_DELETE_USER = OperationDefine.CLUB_SERVICE + 15,
    /** 删除俱乐部 */
    C2S_DELETE_CLUB = OperationDefine.CLUB_SERVICE + 16,
    /** 更新俱乐部 */
    C2S_UPDATE_CLUB = OperationDefine.CLUB_SERVICE + 17,

    S2C_HEARTBEAT = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 0,
    /** 推送添加房间 */
    S2C_PUSH_ADD_ROOM = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 1,
    /** 玩家坐下 */
    S2C_PUSH_ROOM_SIT_DOWN = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 2,
    /** 玩家站起 */
    S2C_PUSH_ROOM_STAND_UP = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 3,
    /** 推送房间删除 */
    S2C_PUSH_ROOM_DELETE = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 4,
    /** 推送房间更新 */
    S2C_PUSH_ROOM_UPDATE = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 5,
    /** 推送解散俱乐部消息 */
    S2C_PUSH_CLUB_DISSOLVE = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 6,
    /** 推送房间的局数 */
    S2C_PUSH_ROOM_ROUND = OperationDefine.CLUB_SERVICE + SERVER_PUSH + 7,
}