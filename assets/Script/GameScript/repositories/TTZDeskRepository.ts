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
    cards: Array<number>,
    glods: Array<{ userInfo: UserInfo, amount: number }>,
    history: Array<number>,
    allAmount: number,
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
        subData: {
            shun: SubAreaData,
            qian: SubAreaData,
            wei: SubAreaData
        }
    }
}