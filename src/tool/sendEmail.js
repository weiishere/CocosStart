/*
 * @Author: weishere.huang
 * @Date: 2020-10-02 12:58:05
 * @LastEditTime: 2020-10-02 21:18:15
 * @LastEditors: weishere.huang
 * @Description: 
 * @~~
 */
const nodemailer = require("nodemailer");
const { SendEmail } = require('../config');//解析参数

const { smtp, mailFrom, pop3_authorization } = SendEmail;

const emailTo = (email, subject, text, html, callback) => {
    const transporter = nodemailer.createTransport({
        host: smtp,
        auth: {
            user: mailFrom,
            pass: pop3_authorization //授权码,通过QQ获取

        }
    });
    const mailOptions = {
        from: mailFrom, // 发送者
        to: email, // 接受者,可以同时发送多个,以逗号隔开
        subject: subject, // 标题
    };
    if (text != undefined) {
        mailOptions.text = text;// 文本
    }
    if (html != undefined) {
        mailOptions.html = html;// html
    }

    const result = {
        httpCode: 200,
        message: '发送成功!',
    }
    try {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                result.httpCode = 500;
                result.message = err;
                callback(result);
                return;
            }
            callback(result);
        });
    } catch (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
    }

}

async function main({subject,content}) {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: smtp,
        //port: 587,
        secure: false, 
        auth: {
            user: '279012130@qq.com', // generated ethereal user
            pass: pop3_authorization, // generated ethereal password
        },
    });
    let info = await transporter.sendMail({
        from: '"量化服务" <' + mailFrom + '>',//'"Fred Foo 👻" <foo@example.com>', // sender address
        to: '"黄伟" <huangweilly@126.com>',//'"用户1" <huangweilly@126.com>, "用户2" <邮箱地址2>',//"bar@example.com, baz@example.com", // list of receivers
        subject, // Subject line
        //text: "最新交易", // plain text body
        html: content,//"<b>Hello world?</b>", // html body
    });

    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


module.exports = {
    emailTo,
    mailTo: (content) => {
        main(content).catch(console.error);
    }
};