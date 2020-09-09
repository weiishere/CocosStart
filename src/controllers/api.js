/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-09-09 18:26:01
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { Symbol } = require('../db');
const { TacticesCommand } = require('../tacticsServer')
const { apiDateCode, System } = require('../config');
const dateFormat = require('format-datetime');

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
      const result = TacticesCommand.getInstance().initTactics(uid, symbol, name || '', {});
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
      const _tacticesCommand = TacticesCommand.getInstance();
      const tactice = _tacticesCommand.tacticsList.find(item => item.id === tid);
      if (tacticesCommand.tacticsList.some(item => (item.symbol === symbol && item.id !== tid))) {
        resultData = {
          msg: '已经存在此交易对的实例，不可重复添加~',
          code: apiDateCode.logicError
        }
      } else {
        tactice.initialize(symbol);
        _tacticesCommand.mapTotacticsList(tactice.uid, tactice.id, true);
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
      const _tacticesCommand = TacticesCommand.getInstance();
      const tactics = _tacticesCommand.mapTotacticsList(uid, id, true);
      tactics && _tacticesCommand.pushHistory(uid, id, {
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
      const _tacticesCommand = TacticesCommand.getInstance();
      const tactices = _tacticesCommand.tacticsList.find(item => item.id == tid);
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
            _tacticesCommand.removeTactics(tid);
            break;
        }
        _tacticesCommand.mapTotacticsList(tactices.uid, tactices.id, true);
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
    const _tacticesCommand = TacticesCommand.getInstance();
    const tactices = _tacticesCommand.tacticsList.find(item => item.id == id);
    let resultData = {};
    if (tactices) {
      tactices.parameterBackup[key] = tactices.parameter[key] = value;
      resultData = {
        code: apiDateCode.success,
        data: tactices.getInfo()
      }
      _tacticesCommand.mapTotacticsList(tactices.uid, id, true);
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
    const _tacticesCommand = TacticesCommand.getInstance();
    const tactices = _tacticesCommand.tacticsList.find(item => item.id == id);
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
    const tactices = TacticesCommand.getInstance().tacticsList.find(item => item.id == tid);
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
  }
};
const getKDJ = ({ klineData5m, KDJ5m }, n) => {
  let result = [];
  klineData5m.forEach((item, i) => {
    if (i > n) {
      const klineData5mForN = [...klineData5m].splice(i, n);
      const L9 = klineData5mForN.sort((a, b) => (a[3] - b[3]))[0][3];
      const H9 = klineData5mForN.sort((a, b) => (b[2] - a[2]))[0][2];
      const RSV = ((item[4] - L9) / (H9 - L9)) * 100;
      //算法1
      let lastKDJ5m = result.find(kdj => kdj.startTime === klineData5m[i - 1][0]);//上一个
      lastKDJ5m = lastKDJ5m ? lastKDJ5m : { K: 50, D: 50 };
      const K = (2 / 3) * lastKDJ5m.K + (1 / 3) * RSV;
      const D = (2 / 3) * lastKDJ5m.D + (1 / 3) * K;


      // //算法2
      // let K, D;
      // if (result.length <= 3) {
      //   K = 50;
      //   D = 50;
      // } else {
      //   const lastKDJData = [...result].splice(result.length - 3 - 1, 3);
      //   //const isRsvNull = lastKDJData.some(item => !item.RSV);
      //   K = lastKDJData.reduce((pre, cur) => pre + cur.RSV, 0) / 3;
      //   D = lastKDJData.reduce((pre, cur) => pre + cur.K, 0) / 3;
      // }
      const J = 3 * K - 2 * D;
      const startTime = item[0];
      const formartStartTime = dateFormat(new Date(startTime), "yyyy/MM/dd HH:mm")
      result.push({ startTime, formartStartTime, K, D, J, RSV })
    }
  })
  return result;
}
/**
    1499040000000,      // 开盘时间
    "0.01634790",       // 开盘价
    "0.80000000",       // 最高价
    "0.01575800",       // 最低价
    "0.01577100",       // 收盘价(当前K线未结束的即为最新价)
    "148976.11427815",  // 成交量
    1499644799999,      // 收盘时间
    "2434.19055334",    // 成交额
    308,                // 成交笔数
    "1756.87402397",    // 主动买入成交量
    "28.46694368",      // 主动买入成交额
    "17928899.62484339" // 请忽略该参数
 */

// export const Get = (ctx, next) => {
//   ctx.body = {
//     result: 'get',
//     name: ctx.params.name,
//     para: ctx.query
//   }

//   next()
// }

// export const Post = async (ctx, next) => {
//   ctx.body = {
//     result: 'post',
//     name: ctx.params.name,
//     para: ctx.request.body
//   }

//   next()
// }

// export const Put = (ctx, next) => {
//   ctx.body = {
//     result: 'put',
//     name: ctx.params.name,
//     para: ctx.request.body
//   }

//   next()
// }

// export const Delete = (ctx, next) => {
//   ctx.body = {
//     result: 'delete',
//     name: ctx.params.name,
//     para: ctx.request.body
//   }

//   next()
// }
