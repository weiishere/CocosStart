import Facade from '../../../Framework/care/Facade';
import ViewComponent from '../../Base/ViewComponent';
import { GameRecordInfo } from '../../GameData/GameRecordInfo';
import { CommandDefine } from '../../MahjongConst/CommandDefine';
import BaseRecord from './BaseRecord';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DymjRecord extends BaseRecord {

    @property(cc.Node)
    detailBtn: cc.Node = null;
    @property(cc.Node)
    playerItemNode: cc.Node = null;

    protected bindUI(): void {
    }

    protected bindEvent(): void {
        this.detailBtn.on(cc.Node.EventType.TOUCH_END, (event) => {
            Facade.Instance.sendNotification(CommandDefine.OpenRecordDetailList, this.roomRoundNo, "");
        });
    }

    getPlayerItem() {
        return this.playerItemNode;
    }

    deskClickEvent() {
    }

    initData(data: GameRecordInfo) {
        super.initData(data);
        this.anteLabel.string = `底注：${data.anteStr}`;

        let playerInfoNode = this.node.getChildByName("playerInfo");
        data.roomPlayerCreditDtos.forEach(v => {
            let palyerItem = this.createPlayerItem(v);
            playerInfoNode.addChild(palyerItem);
        });
    }
}
