/*
 * @Author: weishere.huang
 * @Date: 2020-08-17 17:20:16
 * @LastEditTime: 2020-08-17 17:38:37
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */

const { mongoose } = require('./mongoMaster');


const userModel = mongoose.model('User', new mongoose.Schema({
    account: String,
    pwd: String,
    name: String,
    apiKey: String,
    apiSecret: String,
    userJson: String
}));


module.exports = {
    create: function (user, callback, error) {
        new userModel(user).save(function (err, user) {
            if (err) error(err); else callback(user);
        });
    }
}