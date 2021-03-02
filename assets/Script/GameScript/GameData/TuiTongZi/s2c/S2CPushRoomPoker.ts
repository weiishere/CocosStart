import { BankerBalance } from "./BankerBalance";
import { PlayerBalance } from "./PlayerBalance";
import { ResultData } from "./ResultData";

export class S2CPushRoomPoker {
    pokers: string[];
    results: ResultData[];
    winMoney: number[];
    winTypes: number[];
    money: number;
    playerBalance: PlayerBalance[];
    gameNo: string;
    bankerAnyBet: boolean;
    bankerBalance: BankerBalance[];
}