import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { AudioNotificationTypeDefine } from '../MahjongConst/AudioNotificationTypeDefine';
export class DymjMusicManager {

    static dymjAudioPath = "audio/dymj/";

    static put(mjValue: number, defaultSex = 0) {
        let type = "t";

        // 判断筒子还是条子
        if (mjValue >= 9 && mjValue < 18) {
            type = "t";
        } else if (mjValue >= 18 && mjValue <= 27) {
            type = "s";
        }

        let audioUrl = this.dymjAudioPath + defaultSex + "/s_" + defaultSex + "_" + type + "_" + (mjValue % 9 + 1);
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static peng(defaultSex = 0) {
        let pengValue = ["s_" + defaultSex + "_peng_0", "s_" + defaultSex + "_peng_1", "s_" + defaultSex + "_peng_2"];
        let randomIndex = Math.floor((Math.random() * pengValue.length));
        let pengUrl = this.dymjAudioPath + defaultSex + "/" + pengValue[randomIndex];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, pengUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static gang(defaultSex = 0) {
        let gangValue = ["s_" + defaultSex + "_gang_0", "s_" + defaultSex + "_gang_1", "s_" + defaultSex + "_gang_2"];
        let randomIndex = Math.floor((Math.random() * gangValue.length));
        let gangUrl = this.dymjAudioPath + defaultSex + "/" + gangValue[randomIndex];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, gangUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static dianPao(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_dian_hu_0", "s_" + defaultSex + "_dian_hu_1"];
        let randomIndex = Math.floor((Math.random() * huValue.length));
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[randomIndex];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static ziMo(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_zimo"];
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[0];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static tianHu(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_tian_hu"];
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[0];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static diHu(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_di_hu"];
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[0];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static baoHu(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_bao_hu"];
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[0];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static qingHu(defaultSex = 0) {
        let huValue = ["s_" + defaultSex + "_qing_hu"];
        let huUrl = this.dymjAudioPath + defaultSex + "/" + huValue[0];

        Facade.Instance.sendNotification(CommandDefine.AudioCommand, huUrl, AudioNotificationTypeDefine.PlayEffect);
    }

}