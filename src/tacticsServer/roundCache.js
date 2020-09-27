
const { default: Item } = require('antd/lib/list/Item');
const { ExchangeDB } = require('../db');
const roundCache = {};

const syncFromDB = async () => {
    require('./TacticesLauncher').getInstance().tacticsList.forEach(Item => {
        (await ExchangeDB.find({ tid: Item.id })).forEach()
        // roundCache['t_' + Item.id]
    })
}