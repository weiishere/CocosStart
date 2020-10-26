class Position {
    constructor() {
        this.avgPrice = 0;//平均开仓价格
        this.quantity = 0;//开仓数量(保证金数)
        this.symbol = 'BTCUSDTF';
        this.profit = 0;
        this.commission = 0;
        this.tradeList = [];
        this.state = 'out';//in-场内、out-场外
    }
    addTrade(info) {
        const trade = new Trade(info);
        trade.profit = 10;
        if (trade.side === 'SELL') {
            this.quantity -= trade.executedQty;
        } else {
            this.quantity += trade.executedQty;
            this.state = 'in';
        }
        this.commission += trade.commission;
        this.tradeList.push(trade);
    }
    securityRefresh(btcPrice) {
        if (btcPrice) this.security = Number((btcPrice / this.quantity / 100).toFixed(2));
    }
}


module.exports = class Trade {
    constructor({ executedQty, orderId, time, type, side }) {
        this.executedQty = executedQty;
        this.orderId = orderId;
        this.time = time;
        this.type = type;//'MARKET';
        this.side = side;//'SELL';
        this.profit = 0;
        this.commission = 0;
    }
}

module.exports = class PositionLong extends Position {
    constructor(btcPrice) {
        this.security = 0;//保证金
        this.orderInfo = {}//订单信息
        this.securityRefresh(btcPrice);
    }

}

module.exports = class PositionShort extends Position {
    constructor(btcPrice) {
        this.security = 0;//保证金
        this.orderInfo = {}//订单信息
        this.securityRefresh(btcPrice);
    }
}