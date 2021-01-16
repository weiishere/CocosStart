export class SpriteLoadUtil {
    /**
     * 加载图片
     * @param sprite 
     * @param url 
     */
    static loadSprite(sprite: cc.Sprite, url) {
        let texture = cc.loader.getRes(url, cc.Texture2D);
        if (texture) {
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        } else {
            cc.loader.load(url, (error, item) => {
                sprite.spriteFrame = new cc.SpriteFrame(item)
            });
        }
    }
}