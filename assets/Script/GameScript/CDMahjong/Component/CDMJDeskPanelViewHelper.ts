import CDMJDeskPanelView from './CDMJDeskPanelView';

export default {
    /**换三张的抽出牌helper */
    bindExtractionUpHelper: function (cardNumber) {
        const self: CDMJDeskPanelView = this;
        const wan = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const tong = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        const tiao = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29];
        //const faceArr = [{ name: 'wan', list: wan }, { name: 'tong', list: tong }, { name: 'tiao', list: tiao }];
        const faceArr = [wan, tong, tiao];
        let face: Array<number>;
        //先判断点出来的牌的同花色数量是否小于3
        let _count = 0;
        if (face.indexOf(self.getData().gameData.myCards.handCard) !== -1) _count++;
        faceArr.forEach(item => {
            item.indexOf(cardNumber) !== -1 && (face = item);
        });
        _count += self.getData().gameData.myCards.curCardList.filter(item => {
            return face.indexOf(item) !== -1 ? true : false;
        }).length;
        return _count < 3 ? false : true;
    }
}