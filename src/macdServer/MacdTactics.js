const { default: Item } = require("antd/lib/list/Item");


module.exports = class MacdTactics {
    constructor(macdData, klines, opation = {}) {
        this.macdData = macdData;
        this.klines = klines;
        this.direction = 0;//0：无，1：多，2：空
        this.tradeInfo = null;//交易数据
        this.statistics = []//统计数据
        const { redPeak, greenPeak } = this.initPeakList();
        this.redPeak = redPeak;
        this.greenPeak = greenPeak;
        this.diffMacd = opation.diffMacd || 10;
        this.diffKvalue = opation.diffKvalue || 100;
    }
    initPeakList() {
        const redPeak = [], greenPeak = [];
        let start = 0, end = 0;
        let LastValue = 0;
        let _peak;
        this.macdData.reduce((prev, cur, index) => {
            if (cur) {
                if (!prev) {
                    //_peak = cur < 0 ? redPeak : greenPeak;
                    start = index;
                    _peak = [];
                    _peak.push(cur);
                } else {
                    if (prev * cur < 0) {
                        //与上一个值正负不一致
                        const arr = prev < 0 ? redPeak : greenPeak;
                        //end = index;
                        const top = prev < 0 ? Math.min(..._peak) : Math.max(..._peak)
                        arr.push({
                            start, end: index - 1, data: _peak.slice(),
                            top, topIndex: _peak.indexOf(top),
                            kline: this.klines[start + _peak.indexOf(top)]
                        });
                        start = index;
                        _peak = [];

                    }
                    _peak.push(cur);
                }
                if (index === this.macdData.length) {
                    //最后一个
                    const arr = cur < 0 ? redPeak : greenPeak;
                    const top = prev < 0 ? Math.min(..._peak) : Math.max(..._peak);
                    arr.push({
                        start, end: index - 1, data: _peak.slice(),
                        top, topIndex: _peak.indexOf(top),
                        kline: this.klines[start + _peak.indexOf(top)]
                    });
                }
            }
            return cur;
        });
        return { redPeak, greenPeak }
    }
    findLastPeakOld(type, index) {
        const factor = (reverse) => ((type === 'red' && !reverse) ? p => p > 0 : p => p < 0);
        //寻找上一个峰的封顶
        let lastPeak = [];
        let switchNum = 3;//至少要隔多少个柱才算换柱
        let isPassGreenPeak = false;
        let lastPeakIndex = 0;
        for (let i = index; i >= 0; i--) {
            if (!isPassGreenPeak) {
                //if (this.macdData[i] > 0) {
                if (factor(false)(this.macdData[i])) {
                    if (switchNum === 1) {
                        isPassGreenPeak = true;
                    } else {
                        switchNum--;
                    }
                } else if (!this.macdData[i]) {
                    //没有找到上一个峰（没数据）
                    return false;
                }
            } else {
                if (factor(true)(this.macdData[i]) || !this.macdData[i]) {
                    //if (this.macdData[i] < 0 || !this.macdData[i]) {
                    lastPeak.push(this.macdData[i]);
                } else {
                    lastPeakIndex = i + 1;//上一座峰完结index
                    break;
                }
            }
        }
        return { lastPeak, lastPeakIndex };
    }
    //获取序号所处的有效峰，如果柱小于3，则跳往上一个
    getThisValidPeak(type, index) {
        const peak = type === "red" ? this.redPeak : this.greenPeak;
        for (let i = peak.length - 1; i >= 0; i--) {
            const item = peak[i];
            if (item.start <= index && index <= item.end) {
                if (item.end - item.start < 3) {
                    const lastPeak = i >= 1 ? peak[i - 1] : null;
                    return lastPeak ? this.getThisValidPeak(type, lastPeak.end) : {};
                } else {
                    return { thisPeak: item, peakIndex: i };
                }
            }
        }
        return {};
    }
    //寻找上一座峰、上上做峰
    findLastPeak(type, index) {
        const peak = type === "red" ? this.redPeak : this.greenPeak;
        // for (let i = peak.length - 1; i >= 0; i--) {
        //     const item = peak[i];
        //     if (item.start <= index && index <= item.end) {
        //         const lastPeak = i >= 1 ? peak[i - 1] : null;
        //         const lastAndlastPeak = i >= 2 ? peak[i - 2] : null;
        //         //if (lastPeak && lastPeak.data.length <= 3) {
        //         if (lastPeak && (item.end - item.start) < 3) {
        //             return this.findLastPeak(type, lastPeak.end);
        //         } else {
        //             return { lastAndlastPeak, lastPeak, thisPeak: item };
        //         }
        //     }
        // }

        const { thisPeak, peakIndex } = this.getThisValidPeak(type, index) || {};
        if (thisPeak) {
            const lastPeak = peakIndex > 0 ? this.getThisValidPeak(type, peak[peakIndex - 1].end).thisPeak : null;
            const lastAndLastPeak = peakIndex > 1 ? this.getThisValidPeak(type, peak[peakIndex - 2].end).thisPeak : null;
            return { thisPeak, lastPeak, lastAndLastPeak }
        } else {
            return {};
        }

    }
    /**做多 */
    isDoLong(index) {
        //获取上一个有效红峰
        const { lastAndLastPeak, lastPeak, thisPeak } = this.findLastPeak('red', index);
        if (lastPeak) {
            //#region 按照3线原理（3条线形成起伏即，不考虑多顶峰）
            // if (this.macdData[index] < 0 && this.macdData[index - 1] < 0 && this.macdData[index - 2] < 0) {
            //     if (this.macdData[index] > this.macdData[index - 1] && this.macdData[index - 1] < this.macdData[index - 2]) {
            //         if (+this.klines[lastPeak.start + lastPeak.topIndex + 2][4] > +this.klines[index - 1][4] && this.macdData[index - 1] > lastPeak.top) {
            //             //封顶对应的价格在下降，红峰顶在上升
            //             return true;
            //         }
            //     }
            // }
            //#endregion

            //#region 换柱时处理
            if (this.macdData.length > index + 1 && this.macdData[index] * this.macdData[index + 1] < 0) {
                //if (thisPeak.top > lastPeak.top && +this.klines[lastPeak.start + lastPeak.topIndex + 2][4] > +this.klines[index][4]) {//如果这样，胜率好像还不错(用切柱时候的价格做比较)
                //if (thisPeak.top > lastPeak.top && +this.klines[lastPeak.start + lastPeak.topIndex + 2][4] > +this.klines[thisPeak.start + thisPeak.topIndex + 2][4]) {

                // if (thisPeak.top - lastPeak.top > this.diffMacd && +this.klines[lastPeak.start + lastPeak.topIndex + 2][4] - this.klines[thisPeak.start + thisPeak.topIndex + 2][4] > this.diffKvalue) {
                //     return true;
                // }
                // if (lastAndLastPeak && (thisPeak.top - lastAndLastPeak.top > this.diffMacd && +this.klines[lastAndLastPeak.start + lastAndLastPeak.topIndex + 2][4] - this.klines[thisPeak.start + thisPeak.topIndex + 2][4] > this.diffKvalue)) {
                //     return true;
                // }

                if (thisPeak.top - lastPeak.top > this.diffMacd && +lastPeak.kline[4] - thisPeak.kline[4] > this.diffKvalue) {
                    return true;
                }
                if (lastAndLastPeak && (thisPeak.top - lastAndLastPeak.top > this.diffMacd && +lastAndLastPeak.kline[4] - thisPeak.kline[4] > this.diffKvalue)) {
                    return true;
                }
            }
            //#endregion
        }
        return false;
    }
    isDoShort(index) {
        //获取上一个有效绿峰
        const { lastAndLastPeak, lastPeak, thisPeak } = this.findLastPeak('green', index);
        if (lastPeak) {
            //#region 按照3线原理（3条线形成起伏即，不考虑多顶峰）
            // if (this.macdData[index] > 0 && this.macdData[index - 1] > 0 && this.macdData[index - 2] > 0) {
            //     if (this.macdData[index] < this.macdData[index - 1] && this.macdData[index - 1] > this.macdData[index - 2]) {
            //         if (+this.klines[lastPeak.start + lastPeak.topIndex + 2][4] > +this.klines[index - 1][4] && this.macdData[index - 1] < lastPeak.top) {
            //             //封顶对应的价格在上升，绿峰顶在下降
            //             return true;
            //         }
            //     }
            // }
            //#endregion
            //#region 换柱时处理
            if (this.macdData.length > index + 1 && this.macdData[index] * this.macdData[index + 1] < 0) {
                //if (thisPeak.top < lastPeak.top && +this.klines[lastPeak.start + lastPeak.topIndex + 2][4] < +this.klines[thisPeak.start + thisPeak.topIndex + 2][4]) {

                // if (lastPeak.top - thisPeak.top > this.diffKvalue && +this.klines[thisPeak.start + thisPeak.topIndex + 2][4] - this.klines[lastPeak.start + lastPeak.topIndex + 2][4] > this.diffKvalue) {
                //     return true;
                // }
                // if (lastAndlastPeak && (lastAndlastPeak.top - thisPeak.top > this.diffKvalue && +this.klines[thisPeak.start + thisPeak.topIndex + 2][4] - this.klines[lastAndlastPeak.start + lastAndlastPeak.topIndex + 2][4] > this.diffKvalue)) {
                //     return true;
                // }

                if (lastPeak.top - thisPeak.top > this.diffMacd && +thisPeak.kline[4] - lastPeak.kline[4] > this.diffKvalue) {
                    return true;
                }
                if (lastAndLastPeak && (lastAndLastPeak.top - thisPeak.top > this.diffMacd && +thisPeak.kline[4] - lastAndLastPeak.kline[4] > this.diffKvalue)) {
                    return true;
                }
            }
            //#endregion
        }
        return false;
    }
    run() {

    }
    backTest() {
        // let index = 0;
        // this.macdData.forEach((item, index) => {
        //     let result = false;
        //     if (item) {
        //         // //判断当前是出于红峰还是绿峰，若是出于绿峰则判断是否做空，反则判断是否做多
        //         // result = item < 0 ? this.isDoLong(index) : this.isDoShort(index);
        //         if (item < 0 && this.isDoLong(index)) {
        //             this.statistics.push({ index, type: 'long', macd: this.macdData[index], kline: this.klines[index] });
        //         }
        //         if (item > 0 && this.isDoShort(index)) {
        //             this.statistics.push({ index, type: 'short', macd: this.macdData[index], kline: this.klines[index] });
        //         }
        //     }
        // });
        this.macdData.reduce((prev, cur, index) => {
            let result = false;
            if (prev && prev * cur < 0) {
                //切峰的时候才判断
                // result = item < 0 ? this.isDoLong(index) : this.isDoShort(index);
                if (index === 331) {
                    debugger
                }
                if (cur < 0 && this.isDoShort(index - 1)) {
                    this.statistics.push({ index, type: 'short', macd: this.macdData[index], kline: this.klines[index] });
                }
                if (cur > 0 && this.isDoLong(index - 1)) {
                    this.statistics.push({ index, type: 'long', macd: this.macdData[index], kline: this.klines[index] });
                }
            }
            return cur;
        });
    }
}