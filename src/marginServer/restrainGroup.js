/*
 * @Author: weishere.huang
 * @Date: 2020-10-27 17:48:23
 * @LastEditTime: 2020-10-27 17:50:36
 * @LastEditors: weishere.huang
 * @Description: 
 * @symbol_custom_string_obkoro1: ~~
 */


module.exports = [
    {
        key: 'symbolDriveMod',
        label: '切币驱动模式',
        desc: '选币驱动模式，会保持选币一直运行，如果有新币产生，即尽快出场(盈利或亏损在0.5个点内)并切币进入，打开此开关需保证有及其严格的选币方案',
        param: {
            maxLoss: [0.005, 0.01],//盈亏在此范围就可以切币
            isNowBuy: true,
            checkCount: 0
        },
        method: async (marginObj) => {
            return false;
        }
    }
]