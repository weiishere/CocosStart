/*
 * @Author: weishere.huang
 * @Date: 2020-07-24 16:08:57
 * @LastEditTime: 2020-07-24 18:01:45
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const Binance = require('binance-api-node').default


const client = Binance({
    apiKey: 'bfVEzz5KwA960lS88TfeIY8aEcdRcOaXd5KDJFoKwiedWpd2iBrZrJtyc8VLAYPH',
    apiSecret: '2SsfZtgIGIUhepNWj5uNX3ykgSBhmOqMkHCv6fGaIzJmSr8uqiFOHJen6WjNe59a',
    getTime: Date.now(), // time generator function, optional, defaults to () => Date.now()
})

module.exports = {
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