/*
 * @Author: weishere.huang
 * @Date: 2020-07-22 15:53:13
 * @LastEditTime: 2020-09-14 18:14:30
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const {
  SystemConfig
} = require('../config')

// 截取字符串，多余的部分用...代替
const setString = (str, len) => {
  let StrLen = 0
  let s = ''
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 128) {
      StrLen += 2
    } else {
      StrLen++
    }
    s += str.charAt(i)
    if (StrLen >= len) {
      return s + '...'
    }
  }
  return s
}

// 格式化设置
const OptionFormat = (GetOptions) => {
  let options = '{'
  for (let n = 0; n < GetOptions.length; n++) {
    options = options + '\'' + GetOptions[n].option_name + '\':\'' + GetOptions[n].option_value + '\''
    if (n < GetOptions.length - 1) {
      options = options + ','
    }
  }
  return JSON.parse(options + '}')
}

// 替换SQL字符串中的前缀
const SqlFormat = (str) => {
  if (SystemConfig.mysql_prefix !== 'api_') {
    str = str.replace(/api_/g, SystemConfig.mysql_prefix)
  }
  return str
}

// 数组去重
const HovercUnique = (arr) => {
  const n = {}
  const r = []
  for (var i = 0; i < arr.length; i++) {
    if (!n[arr[i]]) {
      n[arr[i]] = true
      r.push(arr[i])
    }
  }
  return r
}

// 获取json长度
const getJsonLength = (jsonData) => {
  var arr = []
  for (var item in jsonData) {
    arr.push(jsonData[item])
  }
  return arr.length
}
const reExecute = async (method, interval) => {
  const fn = async () => {
    const result = await method();
    if (result) {
      return new Promise((resovle) => {
        setTimeout(async () => {
          await fn();
        }, interval);
      })
    } else {
      return result;
    }
  }
  await fn();
}
module.exports = {
  setString, OptionFormat, SqlFormat, HovercUnique, getJsonLength, reExecute
}