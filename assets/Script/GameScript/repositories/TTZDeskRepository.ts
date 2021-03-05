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
    cards: { frist: number, second: number },
    glods: Array<{ userInfo: UserInfo, amount: number }>,
    history: Array<number>
}

export class TTZDeskRepository {
    deskData: {
        playerList: {
            mySelf: UserInfo,
            subPlayer: Array<UserInfo>,
            masterPlayer: Array<{ userInfo: UserInfo, percent: number }>,
            applyMasterPlayer: Array<UserInfo>,
        },
        deskId: string
    }
    gameData: {
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
}