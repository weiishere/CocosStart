export class XzddPlayerInfo {
	azimuth: number;
	credit: number;
	changeCredit: number;
	nickname: string = "";
	head: string = "";
	sex: string = "m";
	vipLevel: number;
	isVipActive: boolean;
	acctName: string = "";

	/** 用户名 */
	username: string = "";

	/** 是否显示比赛的额外货币 */
	isMoneyValid: boolean;
	/** 经度 */
	longitude: number;
	/** 纬度 */
	latitude: number;
	/** 位置 */
	location;
	/** ip */
	ip: string;
}