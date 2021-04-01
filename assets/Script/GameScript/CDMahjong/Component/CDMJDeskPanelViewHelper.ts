import CardItemView from '../../Component/DdYiMahjong/CardItemView';
import CDMJDeskPanelView from './CDMJDeskPanelView';

export default {
    /**换三张的抽出牌helper，是否可以抽出 */
    bindSwitchExtractionUpHelper: function (cardNumber) {
        const self: CDMJDeskPanelView = this;
        const wan = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const tong = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        const tiao = [19, 20, 21, 22, 23, 24, 25, 26, 27];
        //const faceArr = [{ name: 'wan', list: wan }, { name: 'tong', list: tong }, { name: 'tiao', list: tiao }];
        const faceArr = [wan, tong, tiao];
        

        const chooseSwitchCard = self.mainCardList.filter(card => (card.getComponent("CardItemView") as CardItemView).isChoose).map(card => (card.getComponent("CardItemView") as CardItemView).cardNumber);
        let lastFace = chooseSwitchCard.length === 0 ? [] : faceArr.find(item => {
            return item.indexOf(chooseSwitchCard[0]) !== -1 ? true : false;
        });
        if (!lastFace) return true;
        if (lastFace.indexOf(cardNumber) === -1) {
            //当前选择的牌是否与之前的选择的花色不同，之前的全部落下
            this.mainCardList.forEach(card => (card.getComponent("CardItemView") as CardItemView).reSetChooseFalse());
        } else {
            //花色相同
            if (chooseSwitchCard.length === 3) return false;
        }
        let thenFace: Array<number> = faceArr.find(item => {
            return item.indexOf(cardNumber) !== -1 ? true : false;
        });
        //先判断点出来的牌的同花色数量是否小于3
        let _count = 0;
        if (thenFace.indexOf(self.getData().gameData.myCards.handCard) !== -1) _count++;
        _count += self.getData().gameData.myCards.curCardList.filter(item => {
            return thenFace.indexOf(item) !== -1 ? true : false;
        }).length;
        return _count < 3 ? false : true;
    }
}