/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-09-28 17:51:48
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { Symbol, RoundResult } = require('../db');
const { TacticesLauncher } = require('../tacticsServer')
const { apiDateCode, System } = require('../config');
const dateFormat = require('format-datetime');
const { getRoundResultList, getSimpleRoundResultList } = require('../tacticsServer/roundResult');

module.exports = {
  initTactics: async (ctx, next) => {
    const { uid, name, symbol } = ctx.request.body;
    let resultData = {};
    if (!name || !symbol) {
      resultData = {
        msg: '参数name或者symbol不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const result = TacticesLauncher.getInstance().initTactics(uid, symbol, name || '', {});
      if (result) {
        resultData = {
          code: apiDateCode.success,
          data: result.getInfo()
        }
      }
    }
    ctx.body = resultData;
    next();
  },
  switchSymbol: async (ctx, next) => {
    const { tid, symbol } = ctx.request.body;
    let resultData = {};
    if (!tid || !symbol) {
      resultData = {
        msg: 'switchTactics:参数id或者symbol不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const _tacticesLauncher = TacticesLauncher.getInstance();
      const tactice = _tacticesLauncher.tacticsList.find(item => item.id === tid);
      if (_tacticesLauncher.tacticsList.some(item => (item.symbol === symbol && item.id !== tid))) {
        resultData = {
          msg: '已经存在此交易对的实例，不可重复添加~',
          code: apiDateCode.logicError
        }
      } else {
        tactice.initialize(symbol);
        _tacticesLauncher.mapTotacticsList(tactice.uid, tactice.id, true);
        resultData = {
          code: apiDateCode.success,
          data: tactice ? tactice.getInfo() : {}
        }
      }
    }

    ctx.body = resultData;
    next();
  },
  switchTactics: async (ctx, next) => {
    const { uid, id } = ctx.query;
    let resultData = {};
    if (!id) {
      resultData = {
        msg: 'switchTactics:参数id不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const _tacticesLauncher = TacticesLauncher.getInstance();
      //const tactics = _tacticesLauncher.mapTotacticsList(uid, id, true);//这里就不map了，regTid去做
      const tactics = _tacticesLauncher.tacticsList.find(item => item.id == id);
      tactics && _tacticesLauncher.pushHistory(uid, id, {
        history: tactics.history,
        historyForDeal: tactics.historyForDeal
      });
      resultData = {
        code: apiDateCode.success,
        data: tactics ? tactics.getInfo() : {}
      }
    }
    ctx.body = resultData;
    next();
  },
  tacticsOrder: async (ctx, next) => {
    const { tid, order } = ctx.request.body;
    let resultData = {};
    if (!tid || !order) {
      resultData = {
        msg: 'tacticsOrder:参数tid或order不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const _tacticesLauncher = TacticesLauncher.getInstance();
      const tactices = _tacticesLauncher.tacticsList.find(item => item.id == tid);
      if (!tactices) {
        resultData = {
          msg: 'tacticsOrder:未找到对于的实例',
          code: apiDateCode.nullError
        }

      } else {
        switch (order) {
          case 'run':
            //运行
            tactices.imitateRun = false;
            tactices.powerSwitch();
            break;
          case 'runAndBuy':
            //运行并马上入场
            tactices.imitateRun = true;
            tactices.powerSwitch(true);
            break;
          case 'imitateRun':
            //模拟运行
            tactices.imitateRun = true;
            tactices.powerSwitch();
            break;
          case 'pause':
            //暂停
            tactices.powerPause();
            break;
          case 'stop':
            //停止
            tactices.stop();
            //tactices.powerSwitch();
            break;
          case 'remove':
            //删除实例
            _tacticesLauncher.removeTactics(tid);
            break;
        }
        _tacticesLauncher.mapTotacticsList(tactices.uid, tactices.id, true);
        resultData = {
          code: apiDateCode.success,
          data: tactices ? tactices.getInfo() : {}
        }
      }

    }
    ctx.body = resultData;
    next();
  },
  updateParameter: async (ctx, next) => {
    const { id, key, value } = ctx.request.body;
    const _tacticesLauncher = TacticesLauncher.getInstance();
    const tactices = _tacticesLauncher.tacticsList.find(item => item.id == id);
    let resultData = {};
    if (tactices) {
      tactices.parameterBackup[key] = tactices.parameter[key] = value;
      resultData = {
        code: apiDateCode.success,
        data: tactices.getInfo()
      }
      _tacticesLauncher.mapTotacticsList(tactices.uid, id, true);
    } else {
      resultData = {
        msg: 'updateParameter:未找到对应的实例',
        code: apiDateCode.nullError
      }
    }

    ctx.body = resultData;
    next();
  },
  //获取高级约束数据结构
  getAdvancedRestran: async (ctx, next) => {
    const restrainGroup = require('../tacticsServer/restrainGroup');
    const data = {
      premiseForBase: restrainGroup.premiseForBase.map(item => ({ key: item.key, label: item.label, desc: item.desc })),
      premiseForBuy: restrainGroup.premiseForBuy.map(item => ({ key: item.key, label: item.label, desc: item.desc })),
      premiseForSell: restrainGroup.premiseForSell.map(item => ({ key: item.key, label: item.label, desc: item.desc })),
      dynamicParam: restrainGroup.dynamicParam.map(item => ({ key: item.key, label: item.label, desc: item.desc })),
      symbolElecter: restrainGroup.symbolElecter.map(item => ({ key: item.key, label: item.label, desc: item.desc })),
    }
    ctx.body = {
      code: apiDateCode.success,
      data
    };
    next();
  },
  updateAdvancedRestran: async (ctx, next) => {
    const { id, item, keys } = ctx.request.body;
    const _tacticesLauncher = TacticesLauncher.getInstance();
    const tactices = _tacticesLauncher.tacticsList.find(item => item.id == id);
    let resultData = {};
    if (tactices) {
      if (item === 'premiseJoin') {
        tactices.advancedOption.premiseJoin = JSON.parse(keys);
      } else {
        tactices.advancedOption[item] = keys ? keys.split(',') : [];
      }

      resultData = {
        code: apiDateCode.success,
        data: tactices.getInfo()
      }
    } else {
      resultData = {
        msg: 'updateParameter:未找到对应的信息',
        code: apiDateCode.nullError
      }
    }
    ctx.body = resultData;
    next();
  },
  //刷新推荐币
  refreshSymbol: async (ctx, next) => {
    const { tid } = ctx.query;
    const tactices = TacticesLauncher.getInstance().tacticsList.find(item => item.id == tid);
    let resultData = {};
    if (tactices) {
      const { symbols } = await tactices.findSymbol();
      resultData = {
        code: apiDateCode.success,
        data: symbols
      }
    } else {
      resultData = {
        msg: 'updateParameter:未找到对应的实例',
        code: apiDateCode.nullError
      }
    }

    ctx.body = resultData;
    next();
  },
  getIndicatorLine: async (ctx, next) => {
    const { symbol } = ctx.query;
    const result = await Symbol.find({ name: symbol });
    const { boll5m, KDJ5m } = result[0] || { boll5m: [], KDJ5m: [] };
    //const KDJ5m = getKDJ(result[0], 14);
    ctx.body = {
      code: apiDateCode.success,
      data: { boll5m, KDJ5m }
    };
    next();
  },
  clearNormalInfo: async (ctx, next) => {
    let { tid, order } = ctx.request.body;
    let resultData = {};
    if (!tid) {
      resultData = {
        msg: 'updateParameter:参数tid不能为空',
        code: apiDateCode.nullError
      }
    }
    const _tacticesLauncher = TacticesLauncher.getInstance();
    const tactices = _tacticesLauncher.tacticsList.find(item => item.id == tid);
    order = order + '';
    if (order === '1') {
      tactices.history = tactices.history.filter(item => !(item.type === 'info' && item.color === '#999'));
    } else if (order === '2') {
      tactices.history = tactices.history.filter(item => !((item.type !== 'info' && item.type !== 'buy' && item.type !== 'sell') || item.color !== '#999'));
    } else if (order === '3') {
      tactices.history = tactices.history.filter(item => !(item.type === 'buy' || item.type === 'sell'));
      tactices.historyForDeal = [];
      tactices.exchangeQueue = [];
    }
    //_tacticesLauncher.mapTotacticsList(tactices.uid, tid, true);
    _tacticesLauncher.pushHistory(tactices.uid, tactices.id, {
      history: tactices.history,
      historyForDeal: tactices.historyForDeal
    });
    resultData = {
      code: apiDateCode.success,
      data: 'success'
    }
    ctx.body = resultData;
    next();
  },
  updateLoadUpBuy: async (ctx, next) => {
    let { tid, loadUpBuy } = ctx.request.body;
    const _tacticesLauncher = TacticesLauncher.getInstance();
    const tactices = _tacticesLauncher.tacticsList.find(item => item.id == tid);
    const { mod, target, restrainEnable, isStopRise, dynamicGrids, intervalTime } = loadUpBuy;
    tactices.loadUpBuyHelper = Object.assign(tactices.loadUpBuyHelper, {
      mod, target, restrainEnable, isStopRise, dynamicGrids, intervalTime
    });
    let resultData = {};
    resultData = {
      code: apiDateCode.success,
      data: 'success'
    }
    ctx.body = resultData;
    next();
  },
  getRoundResultList: async (ctx, next) => {
    const { tid, roundId, uid } = ctx.query;
    let resultData = {};
    try {
      let result = await getRoundResultList({ tid, roundId, uid });
      resultData = result ? {
        code: apiDateCode.success,
        data: result,
        msg: 'success'
      } : {
          msg: 'getRoundResultList错误',
          code: apiDateCode.serverError
        }
    } catch (e) {
      resultData = {
        msg: 'getRoundResultList:获取错误' + e,
        code: apiDateCode.serverError
      }
    }
    ctx.body = resultData;
    next();
  },
  getSimpleRoundResultList: async (ctx, next) => {
    const { tid, roundId, uid } = ctx.query;
    let resultData = {};
    try {
      let result = getSimpleRoundResultList({ tid, roundId, uid });
      resultData = result ? {
        code: apiDateCode.success,
        data: result,
        msg: 'success'
      } : {
          msg: 'getSimpleRoundResultList错误:',
          code: apiDateCode.serverError
        }
    } catch (e) {
      resultData = {
        msg: 'getSimpleRoundResultList:获取错误:' + e,
        code: apiDateCode.serverError
      }
    }
    ctx.body = resultData;
    next();
  }
};

