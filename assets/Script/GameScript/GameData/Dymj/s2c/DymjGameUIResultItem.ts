export class DymjGameUIResultItem {
    /** 此项类型。可选值："total"(总计), "gongdian"(公点), "item"(输赢项)； */
    type: string; //此项类型。可选值："total"(总计), "gongdian"(公点), "item"(输赢项)；
    /** 此项名称。如：“总计” “公点” “点炮” “自摸1翻”等。 */
    name: string; //此项名称。如：“总计” “公点” “点炮” “自摸1翻”等。

    //各方位玩家此项的输赢。赢为正数，输为负数。
    azimuth1: number;
    azimuth2: number;
    azimuth3: number;
    azimuth4: number;
    /** 项类型  */
	itemType:number;
}