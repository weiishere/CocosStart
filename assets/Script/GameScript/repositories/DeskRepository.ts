export type GameData = {
    myCards: {
        curCardList: Array<number>,
        handCard: number,
        touchCard: Array<number>,
        barCard: Array<number>,
        hadHuCard: number,
        outCardList: Array<number>,
        setFace: number
    },
    partnerCardsList: Array<{
        playerId: string,
        //gameIndex: number,
        partnerCards: {
            curCardCount: number,
            curCardList?: Array<number>,
            isHandCard: boolean,
            handCard?: Array<number>,
            touchCard: Array<number>,
            barCard: Array<number>,
            hadHuCard: number,
            outCardList: Array<number>,
            setFace: number,
            status: {
                isHadHu: boolean
            }
        },

    }>,
    countDownTime: number,
    positionIndex: number,
    remainCard: number,
    eventData: {
        deskEventData: {
            eventName: '' | 'playerIn' | 'playerOut' | 'playerOffline' | 'playerOnline' | 'chat' | 'roundGameBegin' | 'roundGameEnd'
            correlationInfoData?: Object
        },
        gameEventData: {
            myGameEvent: {
                eventName: Array<'' | 'show' | 'touch' | 'bar' | 'hu' | 'ready' | 'setFace'>,
                correlationInfoData?: Object
            },
            /**其他玩家的事件 */
            deskGameEvent: {
                eventName: '' | 'gameBegin' | 'gameEnd' | 'chat' | 'faceAction' | 'show' | 'touch' | 'bar' | 'hu' | 'setFace',
                correlationInfoData?: Object
            }
        }
    },

}
export type DeskData = {
    /**玩家状态 */
    playerList: Array<{
        playerId: string,
        gameIndex: number,
        playerGold: number,
        playerGender: number,
        playerHeadImg: string,
        playerName: string,
        gameReadyStatus: boolean,
        master: boolean,
    }>,
    /**配置 */
    gameSetting: {
        playerSetNum: number,
        bgmusic: {
            musicInfo: string,
            isPlayMusic: boolean
        },
        /**局数 */
        gameRoundNum: number,
        baseScore: number,
        fanTime: number
    },
    /**牌局记录 */
    roundRecordArr: Array<{
        roundIndex: number,
        gameRoundArr: {
            playerId: string,
            winType: string,
            desc: string,
            score: number
        }
    }>
}


export class DeskRepository {

    public gameData: GameData = {
        /**玩家自己的牌列 */
        myCards: {
            curCardList: [6, 7, 8, 16],//[2, 5, 6, 7, 7, 9, 10, 11, 14, 15],
            handCard: 2,
            touchCard: [1],
            barCard: [18],
            hadHuCard: -1,
            outCardList: [5, 6, 7, 2, 10, 11, 17, 16, 2, 4, 1, 7, 6, 4, 3, 4, 1, 7, 6, 4, 3, 14, 12, 19, 10],
            setFace: 3
        },
        /**对手方牌列数据 */
        partnerCardsList: [{
            playerId: '',

            partnerCards: {
                curCardCount: 4,
                //curCardList: [],
                isHandCard: true,
                //handCard: [],
                touchCard: [8, 10],
                barCard: [4],
                hadHuCard: 9,
                outCardList: [4, 5, 8, 10, 12, 16, 13, 1, 7, 6, 4, 3, 14, 12, 19, 10, 11, 17, 18],
                setFace: 0,
                status: {
                    isHadHu: false
                }
            },
        }],
        countDownTime: 0,
        positionIndex: 0,
        remainCard: 0,
        eventData: {
            deskEventData: {
                eventName: '',
                correlationInfoData: {}
            },
            gameEventData: {
                myGameEvent: {
                    eventName: ['show'],
                    correlationInfoData: {}
                },
                /**其他玩家的事件 */
                deskGameEvent: {
                    eventName: '',
                    correlationInfoData: {}
                }
            }
        },
    }

    public deskData: DeskData = {
        /**玩家状态 */
        playerList: [{
            playerId: '4047487',
            gameIndex: 0,//2
            playerGold: 0,
            playerGender: 0,
            playerHeadImg: '',
            playerName: '',
            gameReadyStatus: false,
            master: false,
        }, {
            playerId: '222',
            gameIndex: 2,//2
            playerGold: 0,
            playerGender: 0,
            playerHeadImg: '',
            playerName: '',
            gameReadyStatus: false,
            master: false,
        }],
        /**配置 */
        gameSetting: {
            playerSetNum: 2,
            bgmusic: {
                musicInfo: '',
                isPlayMusic: true
            },
            /**局数 */
            gameRoundNum: 10,
            baseScore: 1,
            fanTime: 2
        },
        /**牌局记录 */
        roundRecordArr: [{
            roundIndex: 0,
            gameRoundArr: {
                playerId: '',
                winType: '',
                desc: '',
                score: 0
            }
        }]
    }
}