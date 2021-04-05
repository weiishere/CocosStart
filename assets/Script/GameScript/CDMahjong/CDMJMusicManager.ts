import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { AudioNotificationTypeDefine } from '../MahjongConst/AudioNotificationTypeDefine';

const BoySoundConfig = {
    values: [
        {//条子
            name: "1tiao",
            res: ["sc_boy_1tiao0", "sc_boy_1tiao1", "sc_boy_1tiao2"]
        }, {
            name: "2tiao",
            res: ["sc_boy_2tiao0", "sc_boy_2tiao1", "sc_boy_2tiao2", "sc_boy_2tiao3"]
        }, {
            name: "3tiao",
            res: ["sc_boy_3tiao"]
        }, {
            name: "4tiao",
            res: ["sc_boy_4tiao", "sc_boy_4tiao0"]
        }, {
            name: "5tiao",
            res: ["sc_boy_5tiao"]
        }, {
            name: "6tiao",
            res: ["sc_boy_6tiao", "sc_boy_6tiao0"]
        }, {
            name: "7tiao",
            res: ["sc_boy_7tiao"]
        }, {
            name: "8tiao",
            res: ["sc_boy_8tiao", "sc_boy_8tiao0", "sc_boy_8tiao1", "sc_boy_8tiao2"]
        }, {
            name: "9tiao",
            res: ["sc_boy_9tiao", "sc_boy_9tiao0"]
        }, {//筒子
            name: "1tong",
            res: ["sc_boy_1tong0", "sc_boy_1tong1", "sc_boy_1tong2", "sc_boy_1tong3"]
        }, {
            name: "2tong",
            res: ["sc_boy_2tong0", "sc_boy_2tong1"]
        }, {
            name: "3tong",
            res: ["sc_boy_3tong", "sc_boy_3tong0", "sc_boy_3tong1"]
        }, {
            name: "4tong",
            res: ["sc_boy_4tong", "sc_boy_4tong0", "sc_boy_4tong1"]
        }, {
            name: "5tong",
            res: ["sc_boy_5tong", "sc_boy_5tong0", "sc_boy_5tong1"]
        }, {
            name: "6tong",
            res: ["sc_boy_6tong"]
        }, {
            name: "7tong",
            res: ["sc_boy_7tong"]
        }, {
            name: "8tong",
            res: ["sc_boy_8tong", "sc_boy_8tong0"]
        }, {
            name: "9tong",
            res: ["sc_boy_9tong", "sc_boy_9tong0", "sc_boy_9tong1"]
        }, {//万字
            name: "1wan",
            res: ["sc_boy_1wan0", "sc_boy_1wan1", "sc_boy_1wan2", "sc_boy_1wan3"]
        }, {
            name: "2wan",
            res: ["sc_boy_2wan0", "sc_boy_2wan1"]
        }, {
            name: "3wan",
            res: ["sc_boy_3wan", "sc_boy_3wan0"]
        }, {
            name: "4wan",
            res: ["sc_boy_4wan", "sc_boy_4wan0", "sc_boy_4wan1"]
        }, {
            name: "5wan",
            res: ["sc_boy_5wan"]
        }, {
            name: "6wan",
            res: ["sc_boy_6wan"]
        }, {
            name: "7wan",
            res: ["sc_boy_7wan"]
        }, {
            name: "8wan",
            res: ["sc_boy_8wan"]
        }, {
            name: "9wan",
            res: ["sc_boy_9wan", "sc_boy_9wan0"]
        }
    ]
}
const GrilSoundConfig = {
    values: [
        {//条子
            name: "1tiao",
            res: ["sc_girl_1tiao", "sc_girl_1tiao0", "sc_girl_1tiao1", "sc_girl_1tiao2"]
        }, {
            name: "2tiao",
            res: ["sc_girl_2tiao0", "sc_girl_2tiao1", "sc_girl_2tiao2", "sc_girl_2tiao"]
        }, {
            name: "3tiao",
            res: ["sc_girl_3tiao"]
        }, {
            name: "4tiao",
            res: ["sc_girl_4tiao", "sc_girl_4tiao0"]
        }, {
            name: "5tiao",
            res: ["sc_girl_5tiao"]
        }, {
            name: "6tiao",
            res: ["sc_girl_6tiao", "sc_girl_6tiao0"]
        }, {
            name: "7tiao",
            res: ["sc_girl_7tiao"]
        }, {
            name: "8tiao",
            res: ["sc_girl_8tiao", "sc_girl_8tiao0", "sc_girl_8tiao1", "sc_girl_8tiao2"]
        }, {
            name: "9tiao",
            res: ["sc_girl_9tiao", "sc_girl_9tiao0"]
        }, {//筒子
            name: "1tong",
            res: ["sc_girl_1tong0", "sc_girl_1tong1", "sc_girl_1tong2", "sc_girl_1tong"]
        }, {
            name: "2tong",
            res: ["sc_girl_2tong0", "sc_girl_2tong"]
        }, {
            name: "3tong",
            res: ["sc_girl_3tong", "sc_girl_3tong0", "sc_girl_3tong1"]
        }, {
            name: "4tong",
            res: ["sc_girl_4tong", "sc_girl_4tong0", "sc_girl_4tong1"]
        }, {
            name: "5tong",
            res: ["sc_girl_5tong", "sc_girl_5tong0", "sc_girl_5tong1"]
        }, {
            name: "6tong",
            res: ["sc_girl_6tong"]
        }, {
            name: "7tong",
            res: ["sc_girl_7tong"]
        }, {
            name: "8tong",
            res: ["sc_girl_8tong", "sc_girl_8tong0"]
        }, {
            name: "9tong",
            res: ["sc_girl_9tong", "sc_girl_9tong0", "sc_girl_9tong1"]
        }, {//万字
            name: "1wan",
            res: ["sc_girl_1wan0", "sc_girl_1wan1", "sc_girl_1wan2"]
        }, {
            name: "2wan",
            res: ["sc_girl_2wan0", "sc_girl_2wan"]
        }, {
            name: "3wan",
            res: ["sc_girl_3wan", "sc_girl_3wan0"]
        }, {
            name: "4wan",
            res: ["sc_girl_4wan", "sc_girl_4wan0", "sc_girl_4wan1"]
        }, {
            name: "5wan",
            res: ["sc_girl_5wan"]
        }, {
            name: "6wan",
            res: ["sc_girl_6wan"]
        }, {
            name: "7wan",
            res: ["sc_girl_7wan"]
        }, {
            name: "8wan",
            res: ["sc_girl_8wan"]
        }, {
            name: "9wan",
            res: ["sc_girl_9wan", "sc_girl_9wan0"]
        }
    ]
}

export class CDMJMusicManager {
    static cdmjAudioPath = "audio/cdmj/";

    static isPth: boolean = true;

    static put(mjValue: number, defaultSex = 'boy') {
        let type = "wan";
        let resName = "";

        if (!this.isPth) {
            // 判断筒子还是条子
            if (mjValue >= 0 && mjValue < 9) {
                type = "wan";
            } else if (mjValue >= 9 && mjValue < 18) {
                type = "tong";
            } else if (mjValue >= 18 && mjValue <= 27) {
                type = "tiao";
            }

            mjValue = (mjValue % 9 + 1);
            if (defaultSex === "boy") {
                for (const value of BoySoundConfig.values) {
                    if (value.name === mjValue + type) {
                        let index = Math.floor(Math.random() * value.res.length);
                        resName = value.res[index];
                        break;
                    }
                }
            } else if (defaultSex === "girl") {
                for (const value of GrilSoundConfig.values) {
                    if (value.name === mjValue + type) {
                        let index = Math.floor(Math.random() * value.res.length);
                        resName = value.res[index];
                        break;
                    }
                }
            }
        } else {
            // 普通话
            // 判断筒子还是条子
            if (mjValue >= 0 && mjValue < 9) {
                type = "1";
            } else if (mjValue >= 9 && mjValue < 18) {
                type = "2";
            } else if (mjValue >= 18 && mjValue <= 27) {
                type = "3";
            }
            mjValue = (mjValue % 9 + 1);
            resName = `pth/mjt${type}_${mjValue}`;
        }

        let audioUrl = this.cdmjAudioPath + resName;
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);

        this.chuPai();
    }

    /** 出牌的声音 */
    static chuPai() {
        let audioUrl = this.cdmjAudioPath + "chupai";
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    /** 开始游戏播放的声音 */
    static startGame() {
        let audioUrl = this.cdmjAudioPath + "kaiju";
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    /** 选择牌发出的声音 */
    static selectPoker() {
        let audioUrl = this.cdmjAudioPath + "xuanpai";
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    /** 定张结束播放的声音 */
    static dingzhangOver() {
        let audioUrl = this.cdmjAudioPath + "dingque";
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static peng(defaultSex = 'boy') {
        let pengUrl = "";
        if (!this.isPth) {
            let pengValue = ["sc_" + defaultSex + "_peng", "sc_" + defaultSex + "_peng0", "sc_" + defaultSex + "_peng1", "sc_" + defaultSex + "_peng2"];
            let randomIndex = Math.floor((Math.random() * pengValue.length));
            pengUrl = this.cdmjAudioPath + pengValue[randomIndex];
        } else {
            pengUrl = `${this.cdmjAudioPath}pth/peng`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, pengUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static gangGuaFeng(defaultSex = 'boy') {
        let gangUrl = "";

        if (!this.isPth) {
            let gangValue = ["sc_" + defaultSex + "_gang", "sc_" + defaultSex + "_gang0", "sc_" + defaultSex + "_gang3"];
            let randomIndex = Math.floor((Math.random() * gangValue.length));
            gangUrl = this.cdmjAudioPath + gangValue[randomIndex];
        } else {
            gangUrl = `${this.cdmjAudioPath}pth/gang`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, gangUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static gangXiaYu(defaultSex = 'boy') {
        let gangUrl = "";

        if (!this.isPth) {
            let gangValue = ["sc_" + defaultSex + "_gang", "sc_" + defaultSex + "_gang1", "sc_" + defaultSex + "_gang3"];
            let randomIndex = Math.floor((Math.random() * gangValue.length));
            gangUrl = this.cdmjAudioPath + gangValue[randomIndex];
        } else {
            gangUrl = `${this.cdmjAudioPath}pth/gang`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, gangUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static dianPao(defaultSex = 'boy') {
        let huUrl = "";

        if (!this.isPth) {
            let huValue = ["sc_" + defaultSex + "_hu", "sc_" + defaultSex + "_hu0", "sc_" + defaultSex + "_hu1"];
            let randomIndex = Math.floor((Math.random() * huValue.length));
            huUrl = this.cdmjAudioPath + huValue[randomIndex];
        } else {
            huUrl = `${this.cdmjAudioPath}pth/hu`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
        this.he();
    }

    static ziMo(defaultSex = 'boy') {
        let huUrl = "";

        if (!this.isPth) {
            let huValue = ["sc_" + defaultSex + "_hu", "sc_" + defaultSex + "_hu1", "sc_" + defaultSex + "_hu_zimo"];
            let randomIndex = Math.floor((Math.random() * huValue.length));
            huUrl = this.cdmjAudioPath + huValue[randomIndex];
        } else {
            huUrl = `${this.cdmjAudioPath}pth/zimo`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
        this.he();
    }

    static tianHu(defaultSex = 'boy') {
        this.ziMo(defaultSex);
        this.he();
    }

    static diHu(defaultSex = 'boy') {
        let huUrl = "";
        if (!this.isPth) {
            let huValue = ["sc_" + defaultSex + "_hu"];
            // let randomIndex = Math.floor((Math.random() * huValue.length));
            huUrl = this.cdmjAudioPath + huValue[0];
        } else {
            huUrl = `${this.cdmjAudioPath}pth/hu`;
        }

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
        this.he();
    }

    /** 胡牌的音效 */
    static he() {
        let audioUrl = this.cdmjAudioPath + "he";
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }
}