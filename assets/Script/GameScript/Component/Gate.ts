
const { ccclass, property } = cc._decorator;
//import Facade from "../../Framework/care/Facade";
import { MahjongFacade } from "../../MahjongFacade";
import { CommandDefine } from "../MahjongConst/CommandDefine"
import { NotificationDefine } from "../MahjongConst/NotificationDefine"

@ccclass
export default class Gate extends cc.Component {


    @property(cc.Prefab)
    LoginView: cc.Prefab = null;

    @property(cc.Prefab)
    AccountPanel: cc.Prefab = null;

    @property(cc.Prefab)
    GameList: cc.Prefab = null;

    onLoad() {

    }

    start() {
        
        MahjongFacade.Instance.sendNotification(CommandDefine.GateCommand, {}, NotificationDefine.CheckLogin);
    }
    // update (dt) {}
}