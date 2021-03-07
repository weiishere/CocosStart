import Facade from '../../Framework/care/Facade';
import { CommandDefine } from '../MahjongConst/CommandDefine';
import { AudioNotificationTypeDefine } from '../MahjongConst/AudioNotificationTypeDefine';
import { TuiTongZiSuitType } from '../GameData/TuiTongZi/TuiTongZiSuitType';
export class TTZMusicManager {

    static ttzAudioPath = "audio/ttz/";

    /**
     * 播放结果
     * @param type 结果类型
     * @param point 点数
     */
    static playResult(type: number, point: number) {
        let audioUrl = this.ttzAudioPath + "/";
        if (type === TuiTongZiSuitType.YAO_JI_PAIR) {
            audioUrl += "yaojidui";
        } else if (type === TuiTongZiSuitType.PAIR) {
            audioUrl += `tong${point}${point}`;
            if (point === 5) {
                audioUrl += "d";
            }
        } else if (type === TuiTongZiSuitType.TWO_EIGHT_GANG) {
            audioUrl += "tong28";
        } else if (type === TuiTongZiSuitType.AO_TEN) {
            audioUrl += "tong10";
        } else if (type === TuiTongZiSuitType.POINT_POKER) {
            if (point % 0.5 === 0) {
                audioUrl += `tong${point}5`;
            } else {
                audioUrl += `tong${point}`;
            }
        }
        // let audioUrl = this.dymjAudioPath + defaultSex + "/s_" + defaultSex + "_" + type + "_" + (mjValue % 9 + 1);
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static startBet() {
        let audioUrl = `${this.ttzAudioPath}/startBet`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static stopBet() {
        let audioUrl = `${this.ttzAudioPath}/stop`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }
}