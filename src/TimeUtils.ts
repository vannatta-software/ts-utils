export class TimeUtils {
    static async timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static async sleep(fn, ...args) {
        await TimeUtils.timeout(3000);
        return fn(...args);
    }
}