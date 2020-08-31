/*
 * @Author: weishere.huang
 * @Date: 2020-08-19 13:55:33
 * @LastEditTime: 2020-08-19 14:56:39
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const { connectDB } = require('../db/mongoMaster');
const SymbolServer = require('./symbolServer');

connectDB(async () => {
    const symbolServer = SymbolServer.getInstance();
    await symbolServer.initSymbolStorageFromDb();
    //await symbolServer.initializeKline();
    await symbolServer.incrementKlineData();
    await symbolServer.syncDataToDB();
},'symbolServer进程');

// module.exports = {
//     run: () => {

//     }
// }