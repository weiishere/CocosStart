/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-08-08 18:15:43
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { TacticesCommand } = require('../tacticsServer')
const { apiDateCode, System } = require('../config');

module.exports = {
  initTactics: async (ctx, next) => {
    const { name, symbol } = ctx.request.body;
    let resultData = {};
    if (!name || !symbol) {
      resultData = {
        msg: '参数name或者symbol不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const result = TacticesCommand.getInstance().initTactics(symbol, name || '', {});
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
  switchTactics: async (ctx, next) => {
    const { id } = ctx.query;
    let resultData = {};
    if (!id) {
      resultData = {
        msg: 'switchTactics:参数id不能为空',
        code: apiDateCode.nullError
      }
    } else {
      const _tacticesCommand = TacticesCommand.getInstance();
      _tacticesCommand.setPresentSymbleId(id);
      const tactics = _tacticesCommand.mapTotacticsList(id, false);
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
            tactices.powerSwitch();
            //tactices.powerSwitch();
            break;
          case 'remove':
            //删除实例
            _tacticesCommand.removeTactics(tid);
            break;
        }
        resultData = {
          code: apiDateCode.success,
          data: tactices ? tactices.getInfo() : {}
        }
      }
      _tacticesCommand.mapTotacticsList(tactices.id);
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
      tactices.parameter[key] = value;
      resultData = {
        code: apiDateCode.success,
        data: tactices.getInfo()
      }
      _tacticesCommand.mapTotacticsList(id);
    } else {
      resultData = {
        msg: 'updateParameter:未找到对应的实例',
        code: apiDateCode.nullError
      }
    }

    ctx.body = resultData;
    next();
  }
};



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
