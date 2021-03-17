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
        let audioUrl = this.ttzAudioPath + "";
        if (type === TuiTongZiSuitType.YAO_JI_PAIR) {
            audioUrl += "yaojidui";
        } else if (type === TuiTongZiSuitType.PAIR) {
            // 服务器给的点数是从0开始的，所有这里要加1
            point++;
            audioUrl += `tong${point}${point}`;
            if (point === 5) {
                audioUrl += "d";
            }
        } else if (type === TuiTongZiSuitType.TWO_EIGHT_GANG) {
            audioUrl += "tong28";
        } else if (type === TuiTongZiSuitType.AO_TEN) {
            audioUrl += "tong10";
        } else if (type === TuiTongZiSuitType.POINT_POKER) {
            if (point % 1 === 0.5) {
                point -= 0.5;
                audioUrl += `tong${point}5`;
            } else {
                audioUrl += `tong${point}`;
            }
        }
        audioUrl += '.mp3';
        // let audioUrl = this.dymjAudioPath + defaultSex + "/s_" + defaultSex + "_" + type + "_" + (mjValue % 9 + 1);
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static startBet() {
        let audioUrl = `${this.ttzAudioPath}startbet.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static stopBet() {
        let audioUrl = `${this.ttzAudioPath}stop.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static glodBet() {
        let audioUrl = `${this.ttzAudioPath}bet2.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static winBet() {
        let audioUrl = `${this.ttzAudioPath}winGlod.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static newRound() {
        let audioUrl = `${this.ttzAudioPath}newRound.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }

    static overTurnCard(){
        let audioUrl = `${this.ttzAudioPath}fanpai.mp3`
        Facade.Instance.sendNotification(CommandDefine.AudioCommand, audioUrl, AudioNotificationTypeDefine.PlayEffect);
    }
}