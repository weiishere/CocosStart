// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class PageCommand {

    public pageCount = 0;//页数
    public currentPage = 1;//当前第几页
    public pageSize = 0;
    public recordCount = 0;
    private pageDo: (self: PageCommand) => void;
    init(recordCount, pageSize) {
        this.recordCount = recordCount;
        this.pageSize = pageSize;
        const p = parseInt((recordCount / pageSize) + '');
        this.pageCount = (recordCount % pageSize) > 0 ? (p + 1) : p;
        if (this.recordCount === 0) this.pageCount = 1;
    }
    bindPageDo(pageDo) {
        this.pageDo = pageDo;
    }
    firstPage() {
        //if (this.recordCount === 0) return;
        this.currentPage = 1;
        this.pageDo(this);
    }
    endPage() {
        //if (this.recordCount === 0) return;
        this.currentPage = this.pageCount;
        this.pageDo(this);
    }
    nextPage() {
        //if (this.recordCount === 0) return;
        if (this.currentPage === this.pageCount) {
            return;
        } else {
            this.currentPage++;
            this.pageDo(this);
        }
    }
    previousPage() {
        //if (this.recordCount === 0) return;
        if (this.currentPage === 1) {
            return;
        } else {
            this.currentPage--;
            this.pageDo(this);
        }
    }
}
