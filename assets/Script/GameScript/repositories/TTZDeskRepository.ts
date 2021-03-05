/*
 * @Author: weishere.huang
 * @Date: 2021-03-05 17:55:35
 * @LastEditTime: 2021-03-05 18:05:38
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
export type UserInfo = {
    uid: string,
    nickName: string,
    gender: Number,
    headImg: string,
    score: Number,
    phone: string,
    openId: string,
    seatNo: number
}
export type SubAreaData = {
    cards: { frist: { card: number, isShow: boolean }, second: { card: number, isShow: boolean } },
    glods: Array<{ userInfo: UserInfo, amount: number }>,
    history: Array<number>,
    totalGold: number
}

export type DeskData = {
    playerList: {
        mySelf: UserInfo,
        subPlayer: Array<UserInfo>,
        masterPlayer: Array<{ userInfo: UserInfo, percent: string }>,
        applyMasterPlayer: Array<UserInfo>,
    },
    deskId: string
}
export type GameData = {
    state: number,
    masterData: {
        cards: { frist: { card: number, isShow: boolean }, second: { card: number, isShow: boolean } },
    },
    /**剩余可下注量 */
    reaminGlad: number,
    subData: {
        shun: SubAreaData,
        qian: SubAreaData,
        wei: SubAreaData
    },
    myAnteData: {
        shun: number,
        qian: number,
        wei: number
    }
}


export class TTZDeskRepository {
    public gameData: GameData = {
        state: 0,
        masterData: {
            cards: { frist: { card: 1, isShow: true }, second: { card: 1, isShow: false } }
        },
        /**剩余可下注量 */
        reaminGlad: 0,
        subData: {
            shun: {
                cards: { frist: { card: 0, isShow: false }, second: { card: 0, isShow: false } },
                glods: [],
                history: [],
                totalGold: 0
            },
            qian: {
                cards: { frist: { card: 0, isShow: false }, second: { card: 0, isShow: false } },
                glods: [],
                history: [],
                totalGold: 0
            },
            wei: {
                cards: { frist: { card: 0, isShow: false }, second: { card: 0, isShow: false } },
                glods: [],
                history: [],
                totalGold: 0
            }
        },
        myAnteData: {
            shun: 0,
            qian: 0,
            wei: 0
        }
    }

    public deskData: DeskData = {
        playerList: {
            mySelf: null,
            subPlayer: [],
            masterPlayer: [],
            applyMasterPlayer: [],
        },
        deskId: '000000'
    }
}