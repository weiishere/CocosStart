export class DymjBaseRoomData {
    roomId:number; //厅id 
	value:number;  //底分
	fanNum:number;//番数。（预留，兰州麻将中可不用）
	isDouble:boolean; //庄双倍。即：与庄家有关的操作，输赢翻倍。（预留）
	standardPoint:number; //准入点数。
	currency:string; //币种。可能值："CASH", "TANG_COIN"。
	serviceURL:string; //该厅对应的游戏服务器地址。（预留，当前无用）
	paiTotalNum:number; //牌总数。不同麻将类型，不同规则牌总数上有不同。
	putTime:number; //出牌时间，单位：s。默认出牌时间为：20s。
	
	isHuan3Zhang:boolean; //是否支持换3张
}