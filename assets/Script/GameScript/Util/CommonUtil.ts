import Facade from "../../Framework/care/Facade";
import { CommandDefine } from "../MahjongConst/CommandDefine";

export class CommonUtil {
    static toast(content) {
        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: content, toastOverlay: false }, '');
    }
}