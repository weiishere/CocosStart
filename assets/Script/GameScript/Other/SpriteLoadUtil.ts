export class SpriteLoadUtil {
    /**
     * 加载图片
     * @param sprite 
     * @param url 
     */
    // static loadSprite(sprite: cc.Sprite, url: string) {
    //     let texture = cc.loader.getRes(url, cc.Texture2D);
    //     if (texture) {
    //         sprite.spriteFrame = new cc.SpriteFrame(texture);
    //     } else {
    //         let extname: string = cc.path.extname(url);
    //         if (!extname) {
    //             extname = 'png';
    //         } else {
    //             extname = extname.replace(".", "");
    //         }
    //         cc.loader.load({ url: url, type: extname }, (error, item) => {
    //             if (error) {
    //                 cc.log("load sprite url : ", error);
    //                 return;
    //             }
    //             if (sprite && sprite.node && sprite.node.isValid) {
    //                 sprite.spriteFrame = new cc.SpriteFrame(item)
    //             }
    //         });
    //     }
    // }

    static loadSprite(sprite: cc.Sprite, url: string) {
        if (sprite && sprite.node && sprite.node.isValid) {
            this.__loadRes(sprite, url).then((value) => {
                if (sprite && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = value;
                }
            });
        }
    }

    static async __loadRes(sprite: cc.Sprite, url: string): Promise<cc.SpriteFrame> {
        return new Promise((resolve, reject) => {
            let spriteFrame = null;
            let texture = cc.loader.getRes(url, cc.Texture2D);
            if (texture) {
                spriteFrame = new cc.SpriteFrame(texture);
                resolve(spriteFrame);
            } else {
                let extname: string = cc.path.extname(url);
                if (!extname) {
                    extname = 'png';
                } else {
                    extname = extname.replace(".", "");
                }
                cc.loader.load({ url: url, type: extname }, (error, item) => {
                    if (error) {
                        cc.log("load sprite url : ", error);
                        return;
                    }
                    spriteFrame = new cc.SpriteFrame(item)
                    resolve(spriteFrame);
                });
            }
        });
    }
}