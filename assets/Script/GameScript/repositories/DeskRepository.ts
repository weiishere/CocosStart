export type PlayerInfo = {
    /**玩家ID */
    playerId: string,
    /**玩家的座位方向序号 */
    gameIndex: number,
    /**玩家金币 */
    playerGold: number,
    /**玩家性别 */
    playerGender: number,
    /**玩家头像 */
    playerHeadImg: string,
    /**玩家昵称 */
    playerName: string,
    /**游戏是否进行中（可不用） */
    gameReadyStatus?: boolean,
    /**是否是庄家 */
    master: boolean,
}

export type BarType = {
    barCard: number,
    /** 杠类型 0:点杠 1:弯杠 2:暗杠 */
    barType: 0 | 1 | 2,
}

export type RecordType = {
    /**牌局第几局 */
    roundIndex: number,
    gameRoundArr: Array<{
        /**玩家ID */
        playerId: string,
        /**胡牌类型 */
        winType: string,
        /**描述 */
        desc: string,
        /** 牌组 */
        cardList: {
            carCardList: number[],
            touchCardList: number[],
            barCardList: number[],
            huCardList: number[],
        }
        /**输赢分数 */
        score: number
    }>
}

export type PartnerCard = {
    /**对家ID */
    playerId: string,
    //gameIndex: number,
    /**对家牌组 */
    partnerCards: {
        /**对家可操作牌列数 */
        curCardCount: number,
        /**对家可操作牌列数（可不传） */
        curCardList?: Array<number>,
        /**是否收到新摸牌 */
        isHandCard: boolean,
        /**新摸到的牌 */
        handCard?: Array<number>,
        /**对家碰牌 */
        touchCard: Array<number>,
        /**对家杠牌 */
        barCard: Array<BarType>,
        /**对家已经胡的牌 */
        hadHuCard: number,
        /**对家已经出的牌 */
        outCardList: Array<number>,
        /**对家定章 */
        setFace: number,
        /**对家的状态 */
        status: {
            /**对家是否已经胡牌 */
            isHadHu: boolean,
            /** 是否报胡 */
            isBaoHu: boolean
        }
    },

}

export type GameData = {
    myCards: {
        /**可操作牌列 */
        curCardList: Array<number>,
        /**手牌（摸到的牌） */
        handCard: number,
        /**碰牌 */
        touchCard: Array<number>,
        /**杠牌 */
        barCard: Array<BarType>,
        /**已经胡的牌 */
        hadHuCard: number,
        /**出牌牌列 */
        outCardList: Array<number>,
        /**定章 */
        setFace: number,
        /**自己的状态 */
        status: {
            /**对家是否已经胡牌 */
            isHadHu: boolean,
            /** 是否报胡 */
            isBaoHu: boolean
        }
    },
    partnerCardsList: Array<PartnerCard>,
    /**倒计时 */
    countDownTime: number,
    /**当前应出牌的方向序列号 */
    positionIndex: number,
    /**剩余牌数量 */
    remainCard: number,
    /**事件信息 */
    eventData: {
        /**桌面事件 */
        deskEventData: {
            /**桌面事件名称 */
            eventName: '' | 'gameBegin' | 'gameEnd' | 'faceAction' | 'playerIn' | 'playerOut' | 'playerReady' | 'playerOffline' | 'playerOnline' | 'notice' | 'roundGameBegin' | 'roundGameEnd'
            /**桌面事件相关信息 */
            correlationInfoData?: any
        },
        /**游戏事件 */
        gameEventData: {
            /**玩家（本方）游戏事件名称（杠、碰、胡等） */
            myGameEvent: {
                /**游戏事件队列（杠和胡一般一起传） */
                eventName: Array<'' | 'show' | 'touch' | 'bar' | 'hu' | 'ready' | 'setFace' | 'ting'>,
                /**游戏事件相关信息 */
                correlationInfoData?: any
            },
            /**对家的事件（show：出牌） */
            deskGameEvent: {
                eventName: '' | 'show' | 'touch' | 'bar' | 'hu' | 'setFace' | 'ting',
                correlationInfoData?: any
            }
        }
    },

}
export type DeskData = {
    /**玩家状态 */
    playerList: Array<PlayerInfo>,
    /**配置 */
    gameSetting: {
        /**音效 */
        sound: {
            musicInfo: string,
            isPlay: boolean
        },
        /*背景音 */
        bgmusic: {
            musicInfo: string,
            isPlay: boolean
        },
        /**局数 */
        gameRoundNum: number,
        /**总局数 */
        totalRound: number,
        /**底分 */
        baseScore: number,
        /**翻数 */
        fanTime: number
    },
    /**牌局记录 */
    roundRecordArr: Array<RecordType>
}


export class DeskRepository {

    public gameData: GameData = {
        /**玩家自己的牌列 */
        myCards: {
            curCardList: [6, 7, 8, 16],//[2, 5, 6, 7, 7, 9, 10, 11, 14, 15],
            handCard: 2,
            touchCard: [1],
            barCard: [],
            hadHuCard: -1,
            outCardList: [5, 6, 7, 2, 10, 11, 17, 16, 2, 4, 1, 7, 6, 4, 3, 4, 1, 7, 6, 4, 3, 14, 12, 19, 10],
            setFace: 3,
            status: {
                isHadHu: false,
                isBaoHu: false
            }
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
                barCard: [],
                hadHuCard: 9,
                outCardList: [4, 5, 8, 10, 12, 16, 13, 1, 7, 6, 4, 3, 14, 12, 19, 10, 11, 17, 18],
                setFace: 0,
                status: {
                    isHadHu: false,
                    isBaoHu: false
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
            sound: {
                musicInfo: '',
                isPlay: true
            },
            bgmusic: {
                musicInfo: '',
                isPlay: true
            },
            /**局数 */
            gameRoundNum: 8,
            totalRound: 8,
            baseScore: 1,
            fanTime: 2
        },
        /**牌局记录 */
        roundRecordArr: []
    }
}