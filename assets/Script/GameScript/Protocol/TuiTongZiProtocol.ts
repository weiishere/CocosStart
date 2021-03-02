const NIU_NIU_PROTOCOL: number = 0x13700000;
export class TuiTongZiProtocol {
    /** 服务器主动推送基础号 */
    public static SERVER_PUSH = 0x10000;

    /**************************************************
     *********** 用户与服务之间的消息 **************
     **************************************************/
    /** 用户登录 */
    public static C2S_PLAYER_LOGIN = NIU_NIU_PROTOCOL + 0x00003;
    /** 玩家退出登录 */
    public static C2S_PLAYER_LOGIN_OUT = NIU_NIU_PROTOCOL + 0x00004;
    /** 加入房间 */
    public static C2S_JOIN_ROOM = NIU_NIU_PROTOCOL + 0x00005;
    /** 离开房间 */
    public static C2S_QUIT_ROOM = NIU_NIU_PROTOCOL + 0x00006;
    /** 玩家下注 */
    public static C2S_BET = NIU_NIU_PROTOCOL + 0x00007;
    /** 玩家取消下注 */
    public static C2S_CANCEL_BET = NIU_NIU_PROTOCOL + 0x00008;
    /** 玩家上庄 */
    public static C2S_UP_BANKER = NIU_NIU_PROTOCOL + 0x00009;
    /** 玩家获得历史记录 客户端没有处理了 */
    public static C2S_GET_ROOM_HISTORY = NIU_NIU_PROTOCOL + 0x00010;
    /** 玩家切换座位 */
    public static C2S_CHANGE_SEAT = NIU_NIU_PROTOCOL + 0x00011;
    /** 玩家下庄 */
    public static C2S_DOWN_BANKER = NIU_NIU_PROTOCOL + 0x00012;
    /** 玩家结束结算动画 */
    public static C2S_OVER_BALANCE_ANIME = NIU_NIU_PROTOCOL + 0x00013;
    /** 玩家下载保单 客户端没有处理了 */
    public static C2S_DOWNLOAD_POLICY = NIU_NIU_PROTOCOL + 0x00014;

    public static S2C_HEARTBEAT = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00001;
    /** 推送游戏维护消息 */
    public static S2C_GAME_MAINTAIN = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00002;
    /** 推送游戏公告信息 */
    public static S2C_PUSH_GAME_NOTICE = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00004;
    /** 推送大厅历史数据 */
    public static S2C_PUSH_DESK_WAIT_BET_COUNTDOWN = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00008;
    /** 推送房间座位变化到大厅 */
    public static S2C_PUSH_ROOM_SEAT_CHANGE_TO_HALL = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00009;
    /** 推送庄家位变更消息 */
    public static S2C_PUSH_BANKER_CHANGE_TO_HALL = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00010;
    /** 推送推送房间倒计时到大厅 */
    public static S2C_PUSH_ROOM_STATUS_TO_HALL = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00011;

    /** 推送其他玩家下注 */
    public static S2C_PUSH_OTHER_PLAYER_BET = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00100;
    /** 推送玩家加入房间 */
    public static S2C_PUSH_PLAYER_JOIN_ROOM = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00101;
    /** 推送玩家退出房间 */
    public static S2C_PUSH_PLAYER_QUIT_ROOM = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00102;
    /** 推送休息期间的倒计时 */
    public static S2C_PUSH_REST_COUNTDOWN = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00103;
    /** 推送庄家信息 */
    public static S2C_PUSH_BANKER_PLAYER = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00104;
    /** 推送下注倒计时 */
    public static S2C_PUSH_BET_COUNTDOWN = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00105;
    /** 推送房间牌数据 */
    public static S2C_PUSH_ROOM_POKER = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00106;
    /** 推送其他玩取消下注的消息 */
    public static S2C_PUSH_OTHER_PLAYER_CANCEL_BET = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00107;
    /** 推送分数变化 */
    public static S2C_PUSH_CREDIT_UPDATE = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00108;
    /** 推送座位变更消息 */
    public static S2C_PUSH_SEAT_CHANGE = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00109;
    /** 推送庄家队列列表 */
    public static S2C_PUSH_BANKER_QUEUE_LIST = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00110;
    /** 推送确认上庄消息 */
    public static S2C_PUSH_AFFIRM_BANKER = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00111;
    /** 推送下庄消息 */
    public static S2C_PUSH_DOWN_BANKER = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00112;
    /** 推送房间禁用消息 */
    public static S2C_PUSH_ROOM_DISABLE = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00113;
    /** 推送发牌消息 */
    public static S2C_PUSH_DEAL = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00114;
    /** 推送保单密码 */
    public static S2C_PUSH_POLICY_PWD = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00115;
    /** 推送多人下注消息 */
    public static S2C_PUSH_MULTIPLAYER_BET = NIU_NIU_PROTOCOL + TuiTongZiProtocol.SERVER_PUSH + 0x00116;
}