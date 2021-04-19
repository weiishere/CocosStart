import Facade from "../../Framework/care/Facade";
import { CommandDefine } from "../MahjongConst/CommandDefine";

export class TSSDKTool {
    public static isAndroid = cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID
    public static isIOS = cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS

    /**
     * 调取native微信授权
    */
    public static wxLogin() {
        console.log("wxLogin");

        if (this.isAndroid) {
            //调用Java代码进行微信登录
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "weixin_login", "(Ljava/lang/String;)V", "weixin_login");
        }
    }

    /**
     * 接收native微信授权的code
     * @param errCode 
     */
    public static wxLoginResult(errCode) {
        console.log("wxLoginResultcode=" + errCode);
        Facade.Instance.sendNotification(CommandDefine.OpenToast, { content: 'wxLoginResultcode:' + errCode, toastOverlay: true }, '');
        if (this.isAndroid) {

        }
    }
}

cc["TSSDKTool"] = TSSDKTool;