/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 16:08:57
 * @LastEditTime: 2020-08-06 18:24:56
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const Binance = require('binance-api-node').default;
const { System } = require('../config')

const client = Binance({
    apiKey: System.user_4620.apiKey,//'bfVEzz5KwA960lS88TfeIY8aEcdRcOaXd5KDJFoKwiedWpd2iBrZrJtyc8VLAYPH',
    apiSecret: System.user_4620.apiSecret,//'2SsfZtgIGIUhepNWj5uNX3ykgSBhmOqMkHCv6fGaIzJmSr8uqiFOHJen6WjNe59a',
    //getTime: Date.now(), // time generator function, optional, defaults to () => Date.now()
})

module.exports = {
    client,
    auth: async function () {

    },
    testConnect: async function () {
        return await client.ping();
    },
    scoketExampl: function () {
        const clean = client.ws.depth('ETHBTC', depth => {
            console.log(depth)
        })

        // After you're done
        clean()
    }
};