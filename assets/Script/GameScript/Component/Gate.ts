
const { ccclass, property } = cc._decorator;
//import Facade from "../../Framework/care/Facade";
import { MahjongFacade } from "../../MahjongFacade";
import { CommandDefine } from "../MahjongConst/CommandDefine"
import { NotificationTypeDefine } from "../MahjongConst/NotificationTypeDefine"

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
        
        
    }
    // update (dt) {}
}