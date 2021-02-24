export enum OperationDefine {
    /**
	 * 登陆(预留)
	 */
	Authorization = 1,

	/**
	 * 鉴权,身份验证, 验证token
	 */
	Authentication = 2,

	/**
	 * 心跳 (GGW <-> Client GGW主动请求)
	 */
	GGW2C_Heartbeat = 3,

	/**
	 * 用户基本信息变更
	 */
	UserBaseInfoUpdate = 4,

	/**
	 * 强制用户下线
	 */
	ForceOffline = 5,

	/**
	 * 服务器连接心跳 (GGW <-> GameServer 暂时无用)
	 **/
	Server_Heartbeat = 6,

	/**
	 * 强制服务端的用户下线
	 */
	Server_ForceOffline = 7,

	/**
	 * 服务停掉
	 */
	Server_Shutdown = 8,

	/**
	 * 服务失联
	 */
	Server_Goneaway = 9,

	/**
	 * 心跳 (Client <-> GGW Client主动请求)
	 */
	C2GGW_Heartbeat = 10,

	/**
	 * 金币变化通知
	 */
	USER_GOLD_CHANGE = 11,

	/**
	 * 公告更新
	 */
	NOTICE_UPDATE = 12,

	/**
	 * 锁定强制用户下线
	 */
	LOCK_ForceOffline = 13,

	/**
	 * 俱乐部服务
	 */
	CLUB_SERVICE = 10000,

	/**
	 * 大邑二人麻将
	 */
	DA_YI_ER_REN_MAHJONG = 11000,

	/**
	 * 血战到底
	 */
	XUE_ZHAN_DAO_DI = 12000,

	/**
	 * 推筒子
	 */
	TUI_TONG_ZI = 13000,

	/**
	 * 对战牛牛
	 */
	DUI_ZHAN_NIU_NIU = 45000,
}