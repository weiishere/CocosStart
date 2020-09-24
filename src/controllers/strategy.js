/*
 * @Author: weishere.huang
 * @Date: 2020-09-23 16:21:28
 * @LastEditTime: 2020-09-23 20:54:39
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { Strategy } = require('../db');
const { apiDateCode, System } = require('../config');
const dateFormat = require('format-datetime');
const { TacticesLauncher } = require('../tacticsServer')

const getloadUpBuyHelperOptions = (tid) => {
    const _tacticesLauncher = TacticesLauncher.getInstance();
    const tactices = _tacticesLauncher.tacticsList.find(item => item.id === tid);
    const { dynamicGrids, intervalTime, isStopRise, mod, restrainEnable, target } = tactices.loadUpBuyHelper;
    return {
        parameter: tactices.parameter,
        loadUpBuyHelper: { dynamicGrids, intervalTime, isStopRise, mod, restrainEnable, target },
        advancedOption: tactices.advancedOption
    }
}
module.exports = {
    getStrategy: async (ctx, next) => {
        const { uid } = ctx.query;
        const result = await Strategy.find({ uid });
        ctx.body = {
            code: apiDateCode.success,
            data: result
        };
        next();
    },
    createStrategy: async (ctx, next) => {
        const { tid, strategy } = ctx.request.body;
        strategy.options = getloadUpBuyHelperOptions(tid);
        const result = await Strategy.create(strategy, e => {
            ctx.body = {
                code: apiDateCode.serverError,
                msg: e
            };
        });
        if (result) {
            const _tacticesLauncher = TacticesLauncher.getInstance();
            const tactices = _tacticesLauncher.tacticsList.find(item => item.id === tid);
            if (tactices) {
                tactices.tacticesHelper.setStrategy(result.id);
            }
            ctx.body = {
                code: apiDateCode.success,
                data: {},
                msg: 'success'
            };
        }
        next();
    },
    updateStrategy: async (ctx, next) => {
        const { _id, tid, strategy } = ctx.request.body;
        strategy.options = getloadUpBuyHelperOptions(tid);
        const result = await Strategy.findOneAndUpdate({ _id }, strategy, e => {
            ctx.body = {
                code: apiDateCode.serverError,
                msg: e
            };
        });
        if (result) {
            ctx.body = {
                code: apiDateCode.success,
                data: {},
                msg: 'success'
            };
        }
        next();
    },
    setStrategy: async (ctx, next) => {
        const { tid, strategyId, version } = ctx.request.body;
        let resultData = {
            code: apiDateCode.success,
            mes: '已完成策略应用'
        }
        if (version !== System.version) {
            resultData = {
                code: apiDateCode.serverError,
                mes: '策略版本不对应，无法应用'
            }
        } else {
            const _tacticesLauncher = TacticesLauncher.getInstance();
            const tactices = _tacticesLauncher.tacticsList.find(item => item.id === tid);
            if (tactices) {
                tactices.tacticesHelper.setStrategy(strategyId === tactices.strategy.id ? undefined : strategyId);
            } else {
                resultData = {
                    code: apiDateCode.nullError,
                    mes: '未找到实例'
                }
            }
        }
        ctx.body = resultData;
        next();
    },
    remove: async (ctx, next) => {
        try {
            const { id } = ctx.request.body;
            await Strategy.findOneAndRemove(id);
            const _tacticesLauncher = TacticesLauncher.getInstance();
            //将所有应用此策略的任务取消掉
            _tacticesLauncher.tacticsList.filter(item => item.strategy.id === id).forEach(item => item.strategy = {})
            ctx.body = {
                code: apiDateCode.success,
                msg: 'success'
            };
            next();
        } catch (e) {
            ctx.body = {
                code: apiDateCode.serverError,
                msg: '删除策略出错'
            };
            next();
        }
    },
    unbind: async (ctx, next) => {
        try {
            const { tid } = ctx.request.body;
            const _tacticesLauncher = TacticesLauncher.getInstance();
            const tactices = _tacticesLauncher.tacticsList.find(item => item.id === tid);
            tactices.strategy = {};
            _tacticesLauncher.mapTotacticsList(tactices.uid, tid, true);
            ctx.body = {
                code: apiDateCode.success,
                msg: 'success'
            };
            next();
        } catch (e) {
            ctx.body = {
                code: apiDateCode.serverError,
                msg: '解除策略出错'
            };
            next();
        }
    }
}