export class NumberUtils {
    public static round(value: number, precision: number) {
        let fixed = Math.pow(10, precision);
        
        return Math.floor(value * fixed) / fixed;
    }
}