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

    initData(data: GameRecordInfo, userName: string) {
        super.initData(data, userName);
        this.anteLabel.string = `底注：${data.anteStr}`;

        // 把自己排序放在前面
        data.roomPlayerCreditDtos.sort((a, b) => {
            let a1 = a.userName === userName ? 0 : 1;
            let b1 = b.userName === userName ? 0 : 1;

            return a1 - b1;
        })

        let playerInfoNode = this.node.getChildByName("playerInfo");
        data.roomPlayerCreditDtos.forEach(v => {
            let palyerItem = this.createPlayerItem(v);
            playerInfoNode.addChild(palyerItem);
        });
    }
}
