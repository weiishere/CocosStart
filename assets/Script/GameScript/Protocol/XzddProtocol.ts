import { OperationDefine } from '../GameConst/OperationDefine';
const COCOS_MAHJONG_PROTOCOL: number = 0x12400000;
export class XzddProtocol {
    /** 客户端调用心跳 */
    static C_HEARTBEAT: number = (COCOS_MAHJONG_PROTOCOL + 0x001);
    /** 服务器主动调用心跳 */
    static S_HEARTBEAT: number = -XzddProtocol.C_HEARTBEAT;
    /** 提示消息 */
    static S_SERVER_MSG: number = (COCOS_MAHJONG_PROTOCOL + 0x002);

    /** 客户端登录 */
    static C_PLAYER_LOGIN: number = (COCOS_MAHJONG_PROTOCOL + 0x003);
    /** 服务端用户登录返回 */
    static S_PLAYER_LOGIN: number = -XzddProtocol.C_PLAYER_LOGIN;

    /** 更新金额 */
    static S_UPDATE_MONEY: number = (COCOS_MAHJONG_PROTOCOL + 0x004);
    /** 更新房卡数量 */
    static S_UPDATE_VIP_ROOM_CARD: number = (COCOS_MAHJONG_PROTOCOL + 0x009);

    //////////////////
    /// 麻将游戏的主大厅，没有选择任何游戏
    /** 进入游戏大厅 ENTER_HALL */
    static C_ENTER_HALL: number = COCOS_MAHJONG_PROTOCOL + 0x005;
    /** 服务器进入游戏大厅返回 */
    static S_ENTER_HALL: number = -XzddProtocol.C_ENTER_HALL;
    /** 退出游戏大厅 EXIT_HALL */
    static C_EXIT_HALL: number = COCOS_MAHJONG_PROTOCOL + 0x006;
    /** 退出游戏大厅返回 */
    static S_EXIT_HALL: number = -XzddProtocol.C_EXIT_HALL;

    ////////////////////
    /// 进入某一个游戏房间，房间有准入点数，底分等基本参数。
    /** 进入游戏台 ENTER_ROOM */
    static C_ENTER_ROOM: number = COCOS_MAHJONG_PROTOCOL + 0x007;
    /** 进入游戏台 返回 */
    static S_ENTER_ROOM: number = -XzddProtocol.C_ENTER_ROOM;
    /** 退出游戏台 EXIT_ROOM */
    static C_EXIT_ROOM: number = COCOS_MAHJONG_PROTOCOL + 0x008;
    /** 退出游戏台返回 */
    static S_EXIT_ROOM: number = -XzddProtocol.C_EXIT_ROOM;
    /** 发起解散消息 */
    static C_SPONSOR_DISSOLVE: number = COCOS_MAHJONG_PROTOCOL + 0x009;
    /** 发起解散消息返回 */
    static S_SPONSOR_DISSOLVE: number = -XzddProtocol.C_SPONSOR_DISSOLVE;
    /** 确认解散消息 */
    static C_CONFIRM_DISSOLVE: number = COCOS_MAHJONG_PROTOCOL + 0x010;
    /** 确认解散消息返回 */
    static S_CONFIRM_DISSOLVE: number = -XzddProtocol.C_CONFIRM_DISSOLVE;

    /** 退出游戏 */
    static LOGOUT: number = COCOS_MAHJONG_PROTOCOL + 0x011;
    /** 发送互动消息 */
    static C_SEND_INTERACT_MSG: number = COCOS_MAHJONG_PROTOCOL + 0x012;

    //:number ========================================== 游戏操作 start
    //:number =============================================
    /**
     * 准备开始 READY 玩家前台ui准备就绪就自动发送。 以后选桌时，再考虑玩家手动操作就绪再发该消息。 后台暂不响应。
     */
    static C_READY: number = COCOS_MAHJONG_PROTOCOL + 0x100;

    /** 继续游戏 GO_ON */
    static C_GO_ON: number = COCOS_MAHJONG_PROTOCOL + 0x0101;
    // 服务端响应(服务端需要确认玩家是否可以继续：余额是否充足等)
    static S_GO_ON: number = -XzddProtocol.C_GO_ON;

    //////////////////////////////
    /// 麻将游戏中的交互，这时主动权交给后台服务器了，玩家能进行的操作都是后台驱动（发起）
    /** 游戏结算 通知玩家游戏结果 */
    static S_Game_Result_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x102);

    /** 客户端请求重连 */
    static C_Game_Reconn_V2: number = (COCOS_MAHJONG_PROTOCOL + 0x204);
    /** 服务端返回重连 */
    static S_Game_Reconn_V2: number = -XzddProtocol.C_Game_Reconn_V2;
    /** 玩家断线重连进入游戏后，把当局游戏数据给玩家，前台恢复ui， */
    static S_Game_Reconn: number = (COCOS_MAHJONG_PROTOCOL + 0x103);
    //	/** 玩家ui就绪后，给后台一条消息，告知可以接收后台消息了 ，如果不给响应，
    //	 * 后台发的消息前台需要依次处理，不能忽略，避免其他玩家的出牌消息没处理，
    //	 * 导致牌的数据不对，这也可能是甲方先前需要等待本家操作才给数据的原因。
    //	 * 这里可能需要再仔细设计
    //	 */
    //	static C_Game_ReconnRsp:number = (COCOS_MAHJONG_PROTOCOL + 0x20e);

    /** 通知用户游戏开局，并将本桌玩家的发牌数据告知用户 */
    // 将玩家，骰子，和牌等数据发送给前台，前台根据这些数据进行发牌操作
    static S_Game_BeginDeal_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x104);
    /** 前台UI准备就绪（发牌特效等）后，告知后台发牌结束 */
    static C_Game_DealOver: number = (COCOS_MAHJONG_PROTOCOL + 0x105);

    /** 所有用户准备就绪后，告知用户可以进行的操作 */
    /** 通知用户游戏开始了，麻将就是庄家可以出牌了 （并且告知庄家当前可能进行的操作 */
    /**
     * Server端要求用户打牌，通常摸牌后用户就知道打牌，不需要该消息 但是如摸牌后有胡/杠/听操作时，如果玩家选择了取消， 则需要再次通知前台打牌
     * 修改为更通用的请求，
     */
    static S_Game_DoNextOperation_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x106);

    /** 通知所有玩家摸牌消息，本家摸牌数据里面包括有当前用户可以进行的操作，非本家没有数据 */
    static S_Game_Get: number = (COCOS_MAHJONG_PROTOCOL + 0x107);

    /** 玩家出牌 ，前一个消息摸牌或开始出牌中都包括可能进行的打牌操作中有非法的手牌，即不能打出的牌，避免前台进行游戏规则的计算，只是看是否在该值中即可 */
    static C_Game_Put: number = (COCOS_MAHJONG_PROTOCOL + 0x108);
    /** 通知所有玩家该出牌消息 */
    static S_Game_PutRsp_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x109);

    /**
     * 其他用户的操作引起的玩家可能进行的操作 MahjongOperationType {CHI,PENG,GANG,TING,HU,XIAO};
     * 甩牌SHUAI/定张等所有玩家都需要进行的操作，还是特殊处理。 这里的操作都是收到该消息的玩家可以进行的操作。
     */
    static S_Game_ShowOperation: number = (COCOS_MAHJONG_PROTOCOL + 0x10a);

    /** 其他用户的操作引起的玩家可能进行的操作 */
    static C_Game_Operation: number = (COCOS_MAHJONG_PROTOCOL + 0x10b);
    /** 通知所有用户玩家进行的消以外的操作 */
    static S_Game_OperationRsp_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x10c);

    //////////////////////////
    /// 不同地方麻将的特定规则
    /// 1. 兰州麻将的甩牌
    /** 通知前台甩牌 ，每个用户可以告知其可以甩牌的值，便于前台进行合法性检查 */
    static S_Game_ThrowMahjongs_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x110);
    /** 兰州麻将的甩牌 */
    static C_Game_ThrowMahjongs: number = (COCOS_MAHJONG_PROTOCOL + 0x111);
    /** 告知所有玩家甩牌信息 */
    static S_Game_ThrowMahjongsRsp_BroadCast: number = (COCOS_MAHJONG_PROTOCOL + 0x112);

    /// 2. 四川麻将的定张，因为其他麻将都是同一处理打牌，
    /// 要做到现在银基麻将的先扣牌，再翻牌的效果，需要额外增加一些消息。
    /** 四川麻将 广播定张操作 S --> C */
    static S_Game_ShowDingzhang: number = (COCOS_MAHJONG_PROTOCOL + 0x010D);
    /** 四川麻将 定张操作 C --> S */
    static C_Game_Dingzhang: number = (COCOS_MAHJONG_PROTOCOL + 0x010E);
    /** 四川麻将 定张操作反馈 S --> C */
    static S_Game_Dingzhang: number = (COCOS_MAHJONG_PROTOCOL + 0x010F);
    /** 四川麻将 广播所有玩家定张类型 S --> C */
    static S_Game_Put_Dingzhang: number = (COCOS_MAHJONG_PROTOCOL + 0x0113);

    /// 3. 换3张，因为其他麻将都是同一处理打牌，
    /** 广播换3张操作 S --> C */
    static S_Game_ShowHuan3Zhang: number = (COCOS_MAHJONG_PROTOCOL + 0x0114);
    /** 换3张操作 C --> S */
    static C_Game_Huan3Zhang: number = (COCOS_MAHJONG_PROTOCOL + 0x0115);
    /** 换3张操作反馈 S --> C */
    static S_Game_Huan3Zhang: number = (COCOS_MAHJONG_PROTOCOL + 0x0116);
    /** 广播所有玩家换3张类型 S --> C */
    static S_Game_Put_Huan3Zhang: number = (COCOS_MAHJONG_PROTOCOL + 0x0117);

    //// 游戏中的交互基本结束
    /////////////////////////////////////////////////

    //:number ========================================== 游戏辅助 start
    //:number =============================================
    /** 更新玩家游戏点数 */
    static S_UPDATE_PLAYERS_CREDIT: number = COCOS_MAHJONG_PROTOCOL + 0x0200;
    /** 托管 ENTRUST */
    // ps：如果是服务端主动托管，处理方案为：断掉客户端的连接。
    // 客户端请求
    static C_ENTRUST: number = COCOS_MAHJONG_PROTOCOL + 0x0201;
    static S_ENTRUST: number = -XzddProtocol.C_ENTRUST;

    /** 玩家查看自己的可胡牌情况 */
    static C_CHECKHU: number = COCOS_MAHJONG_PROTOCOL + 0x0202;
    static S_CHECKHU: number = -XzddProtocol.C_CHECKHU;

    /** 用户选择继续与否通过如下方式通知服务端 */
    static C_SUPPLEMENTARY_CREDIT: number = COCOS_MAHJONG_PROTOCOL + 0x0203;

    /** 比赛准备数据 */
    static C_MATCH_READY: number = COCOS_MAHJONG_PROTOCOL + 0x0306;
    /** 获取比赛排行榜 */
    static C_GET_MATCH_RANKING: number = COCOS_MAHJONG_PROTOCOL + 0x0309;
    /** 进行下一场比赛 */
    static C_NEXT_MATCH: number = COCOS_MAHJONG_PROTOCOL + 0x0311;

    /** 推送桌子里的玩家列表 */
    static S_PUSH_DESK_PLAYER_LIST: number = (COCOS_MAHJONG_PROTOCOL + 0x0300);
    /** 推送重新排队的消息 */
    static S_PUSH_DESK_ANEW_QUEUE: number = (COCOS_MAHJONG_PROTOCOL + 0x0301);
    /** 推送玩家认输消息 */
    static S_PUSH_PLAYER_GIVE_UP: number = (COCOS_MAHJONG_PROTOCOL + 0x0302);
    /** 推送玩家充值的消息 */
    static S_PUSH_PLAYER_RECHARGE: number = (COCOS_MAHJONG_PROTOCOL + 0x0303);
    /** 推送游戏公告 */
    static S_PUSH_GAME_NOTICE: number = (COCOS_MAHJONG_PROTOCOL + 0x0304);
    /** 推送玩家退出游戏 */
    static S_PUSH_EXIT_ROOM: number = (COCOS_MAHJONG_PROTOCOL + 0x0305);
    /** 推送报名人数 */
    static S_PUSH_MATCH_APPLY_COUNT: number = COCOS_MAHJONG_PROTOCOL + 0x0307;
    /** 推送排名 */
    static S_PUSH_MATCH_UPDATE_RANK: number = COCOS_MAHJONG_PROTOCOL + 0x0308;
    /** 推送桌子的结算结果 */
    static S_PUSH_MATCH_DESK_BALANCE: number = COCOS_MAHJONG_PROTOCOL + 0x0310;
    /** 推送比赛轮数信息 */
    static S_PUSH_MATCH_BOUT_INFO: number = COCOS_MAHJONG_PROTOCOL + 0x0312;
    /** 推送比赛为结束游戏的桌子数 */
    static S_MATCH_NOT_OVER_DESK_NUMBER: number = COCOS_MAHJONG_PROTOCOL + 0x0313;
    /** 推送玩家的晋级淘汰消息 */
    static S_PUSH_PLAYER_WIN_OR_WEEDOUT: number = COCOS_MAHJONG_PROTOCOL + 0x0314;
    /** 推送推送同桌晋级比赛轮数信息 */
    static S_PUSH_ONE_TABLE_MATCH_BOUT_INFO: number = COCOS_MAHJONG_PROTOCOL + 0x0315;
    /** 推送发起解散消息 */
    static S_PUSH_SPONSOR_DISSOLVE: number = COCOS_MAHJONG_PROTOCOL + 0x0316;
    /** 推送确认解散消息 */
    static S_PUSH_CONFIRM_DISSOLVE: number = COCOS_MAHJONG_PROTOCOL + 0x0317;
    /** 推送解散包间结果消息 */
    static S_PUSH_DISSOLVE_RESULT: number = COCOS_MAHJONG_PROTOCOL + 0x0318;
    /** 推送踢出玩家消息 */
    static S_PUSH_KICK_OUT_PLAYER: number = COCOS_MAHJONG_PROTOCOL + 0x0319;

    /** 测试消息，收到消息后删除房间信息 */
    static TEST_DELETE_DESK: number = (COCOS_MAHJONG_PROTOCOL + 0x0901);

    /**
     * 消息转换方法，下面几个消息比较特殊，发送的和返回的消息号是不同的，在前面加了一个负号
     * @param msgType 
     */
    static dymjMsgTypeConvert(msgType: number): number {
        if (msgType === XzddProtocol.C_PLAYER_LOGIN) {
            return XzddProtocol.S_PLAYER_LOGIN;
        } else if (msgType === XzddProtocol.C_HEARTBEAT) {
            return XzddProtocol.S_HEARTBEAT;
        } else if (msgType === XzddProtocol.C_ENTER_HALL) {
            return XzddProtocol.S_ENTER_HALL;
        } else if (msgType === XzddProtocol.C_EXIT_HALL) {
            return XzddProtocol.S_EXIT_HALL;
        } else if (msgType === XzddProtocol.C_ENTER_ROOM) {
            return XzddProtocol.S_ENTER_ROOM;
        } else if (msgType === XzddProtocol.C_EXIT_ROOM) {
            return XzddProtocol.S_EXIT_ROOM;
        } else if (msgType === XzddProtocol.C_SPONSOR_DISSOLVE) {
            return XzddProtocol.S_SPONSOR_DISSOLVE;
        } else if (msgType === XzddProtocol.C_CONFIRM_DISSOLVE) {
            return XzddProtocol.S_CONFIRM_DISSOLVE;
        } else if (msgType === XzddProtocol.C_GO_ON) {
            return XzddProtocol.S_GO_ON;
        } else if (msgType === XzddProtocol.C_Game_Reconn_V2) {
            return XzddProtocol.S_Game_Reconn_V2;
        } else if (msgType === XzddProtocol.C_ENTRUST) {
            return XzddProtocol.S_ENTRUST;
        } else if (msgType === XzddProtocol.C_CHECKHU) {
            return XzddProtocol.S_CHECKHU;
        }

        return msgType;
    }
}