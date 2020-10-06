/*
 * @Author: weishere.huang
 * @Date: 2020-09-28 17:40:42
 * @LastEditTime: 2020-10-01 21:05:08
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
            if (tid) query['tid'] = tid;
            if (roundId) query['roundId'] = roundId;
            result = await RoundResult.find({ ...query, isDone: true });
            return result;
        } catch (e) {
            return [];
        }
    },
    getSimpleRoundResultList: async ({ tid, roundId, uid }, count) => {
        try {
            let result = {};
            let query = {}
            if (uid) query['uid'] = uid;
            if (tid) query['tid'] = tid;
            if (roundId) query['roundId'] = roundId;
            result = await RoundResult.find({ ...query, isDone: true });
            count = +count;
            if (count) result = result.splice(result.length - count <= 0 ? 0 : result.length - count, count);
            result = result.map(item => {
                const { profit, symbol, uid, tid, roundId, startTime, endTime, inCosting, outCosting } = item;
                return { profit, symbol, uid, tid, roundId, startTime, endTime, inCosting, outCosting };
            });
            return result;
        } catch (e) {
            return [];
        }
    }
}