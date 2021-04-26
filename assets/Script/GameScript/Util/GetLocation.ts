// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const getLocation = () => {
    let Longgitude = ''; //经度
    let Latitude = '';   //纬度
    if (cc.sys.OS_ANDROID === cc.sys.os) {
        Latitude = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getLatitude", "()Ljava/lang/String;");
        Longgitude = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getLongitude", "()Ljava/lang/String;");
    } else if (cc.sys.OS_IOS === cc.sys.os) {
        Latitude = jsb.reflection.callStaticMethod("AppController", "getLatitude", '');
        Longgitude = jsb.reflection.callStaticMethod("AppController", "getLonggitude", '');
    }
    return { Latitude, Longgitude }
}
export default getLocation;