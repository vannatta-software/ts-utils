export class NumberUtils {
    /**
     * Rounds a number to the specified precision.
     */
    public static round(value: number, precision: number): number {
      const fixed = Math.pow(10, precision);
      return Math.round(value * fixed) / fixed;
    }
  
    /**
     * Floors a number to the specified precision.
     */
    public static floor(value: number, precision: number): number {
      const fixed = Math.pow(10, precision);
      return Math.floor(value * fixed) / fixed;
    }
  
    /**
     * Ceils a number to the specified precision.
     */
    public static ceil(value: number, precision: number): number {
      const fixed = Math.pow(10, precision);
      return Math.ceil(value * fixed) / fixed;
    }
  
    /**
     * Checks if a number is within a specified range (inclusive).
     */
    public static inRange(value: number, min: number, max: number): boolean {
      return value >= min && value <= max;
    }
  
    /**
     * Clamps a number to a specified range.
     */
    public static clamp(value: number, min: number, max: number): number {
      return Math.max(min, Math.min(max, value));
    }
  
    /**
     * Generates a random number between min and max (inclusive).
     */
    public static random(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }
  
    /**
     * Generates a random integer between min and max (inclusive).
     */
    public static randomInt(min: number, max: number): number {
      return Math.floor(NumberUtils.random(min, max + 1));
    }
  
    /**
     * Checks if a value is a valid finite number.
     */
    public static isFinite(value: unknown): boolean {
      return typeof value === "number" && isFinite(value);
    }
  
    /**
     * Checks if a value is a valid integer.
     */
    public static isInteger(value: unknown): boolean {
      return Number.isInteger(value);
    }
  
    /**
     * Formats a number with commas as thousands separators.
     */
    public static formatWithCommas(value: number): string {
      return value.toLocaleString();
    }
  
    /**
     * Converts a number to a percentage string with specified precision.
     */
    public static toPercentage(value: number, precision: number = 2): string {
      return `${(value * 100).toFixed(precision)}%`;
    }
  
    /**
     * Converts a value to a number, returning NaN if conversion fails.
     */
    public static toNumber(value: unknown): number {
      return Number(value);
    }
  
    /**
     * Maps a number from one range to another.
     */
    public static mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
      return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
    }
  
    /**
     * Checks if a number is approximately equal to another within a tolerance.
     */
    public static approximatelyEqual(value: number, target: number, tolerance: number): boolean {
      return Math.abs(value - target) <= tolerance;
    }
  
    /**
     * Returns the factorial of a number.
     */
    public static factorial(value: number): number {
      if (value < 0) throw new Error("Factorial is not defined for negative numbers.");
      return value === 0 ? 1 : value * NumberUtils.factorial(value - 1);
    }
  
    /**
     * Converts degrees to radians.
     */
    public static degreesToRadians(degrees: number): number {
      return (degrees * Math.PI) / 180;
    }
  
    /**
     * Converts radians to degrees.
     */
    public static radiansToDegrees(radians: number): number {
      return (radians * 180) / Math.PI;
    }
  
    /**
     * Returns the greatest common divisor (GCD) of two numbers.
     */
    public static gcd(a: number, b: number): number {
      return b === 0 ? Math.abs(a) : NumberUtils.gcd(b, a % b);
    }
  
    /**
     * Returns the least common multiple (LCM) of two numbers.
     */
    public static lcm(a: number, b: number): number {
      return (Math.abs(a) / NumberUtils.gcd(a, b)) * Math.abs(b);
    }
  }
  