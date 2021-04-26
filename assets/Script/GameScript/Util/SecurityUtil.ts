import md5 from "./MD5";

export class SecurityUtil {
    static SECRET_KEY: string = ".ziyungeSecret";

    /**
     * 构建密钥，根据时间戳，在10秒生成时间戳加上密钥
     * @returns 
     */
    static buildSecret(): string {
        let time = 10000;
        return md5(new Date(parseInt((new Date().getTime() / time) + '') * time).getTime() + this.SECRET_KEY);
    }
}