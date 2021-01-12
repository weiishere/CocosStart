export type GameData = {
    myCards: {
        curCardList: Array<number>,
        handCard: Array<number>,
        touchCard: Array<number>,
        barCard: Array<number>,
        hadHuCard: Array<number>,
        outCardList: Array<number>,
        setFace: Array<number>
    }
    partnerCardsList: Array<{
        playerId: string,
        gameIndex: number,
        partnerCards: {
            curCardCount: number,
            curCardList?: Array<number>,
            isHandCard: boolean,
            handCard?: Array<number>,
            touchCard: number,
            barCard: Array<number>,
            hadHuCard: number,
            outCardList:Array<number>,
            
        },
        status: {
            isHadHu: boolean
        }
    }>
}



export class DeskRepository {

    public gameData = {
        myCards: {
            curCardList: [],
            handCard: [],
            touchCard: [],
            barCard: [],
            hadHuCard: 0,
            outCardList: [],
            setFace: ''
        }
    }

    public curCardList: Array<string> = [];
    public handCardList: string = '';
    public hadHuCard: string = '';
    public touchCard: Array<string> = [];
    public barCardList: Array<string> = [];
    public outCardList: Array<string> = [];


}