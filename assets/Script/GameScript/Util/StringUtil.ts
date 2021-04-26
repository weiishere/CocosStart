export class StringUtil {
    static hidePhoneNo(phoneNo: string): string {
        return `${phoneNo.substring(0, 3)}****${phoneNo.substring(phoneNo.length - 4, phoneNo.length)}`
    }
}