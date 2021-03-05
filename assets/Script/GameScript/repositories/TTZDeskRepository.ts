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
    openId: string
}
export type SubAreaData = {
    cards: { frist: { card: number, isShow: false }, second: { card: number, isShow: false } },
    glods: Array<{ userInfo: UserInfo, amount: number }>,
    history: Array<number>
}

export type DeskData = {
    playerList: {
        mySelf: UserInfo,
        subPlayer: Array<UserInfo>,
        masterPlayer: Array<{ userInfo: UserInfo, percent: number }>,
        applyMasterPlayer: Array<UserInfo>,
    },
    deskId: string
}
export type GameData = {
    state: number,
    masterData: {
        cards: Array<number>
    },
    /**剩余可下注量 */
    reaminGlad: number,
    subData: {
        shun: SubAreaData,
        qian: SubAreaData,
        wei: SubAreaData
    }
}


export class TTZDeskRepository {
    public gameData: GameData = {
        state: 0,
        masterData: {
            cards: []
        },
        /**剩余可下注量 */
        reaminGlad: 0,
        subData: {
            shun: {
                cards: { frist: 0, second: 0 },
                glods: [],
                history: []
            },
            qian: {
                cards: { frist: 0, second: 0 },
                glods: [],
                history: []
            },
            wei: {
                cards: { frist: 0, second: 0 },
                glods: [],
                history: []
            }
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