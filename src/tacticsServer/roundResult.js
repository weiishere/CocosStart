/*
 * @Author: weishere.huang
 * @Date: 2020-09-28 17:40:42
 * @LastEditTime: 2020-09-28 17:54:40
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { RoundResult } = require('../db');

module.exports = {
    getRoundResultList: async ({ tid, roundId, uid }) => {
        try {
            let result = {};
            let query = {}
            if (uid) query['uid'] = uid;
            if (tid) query['uid'] = tid;
            if (roundId) query['uid'] = roundId;
            result = RoundResult.find({ ...query, isDone: true });
            return result;
        } catch (e) {
            return [];
        }
    },
    getSimpleRoundResultList: async ({ tid, roundId, uid }) => {
        try {
            let result = {};
            let query = {}
            if (uid) query['uid'] = uid;
            if (tid) query['uid'] = tid;
            if (roundId) query['uid'] = roundId;
            result = RoundResult.find({ ...query, isDone: true });
            result = result.map(item => {
                const { profit, symbol, uid, tid, roundId } = item;
                return { profit, symbol, uid, tid, roundId };
            });
            return result;
        } catch (e) {
            return [];
        }
    }
}