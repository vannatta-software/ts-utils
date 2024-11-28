import { NumberUtils } from "../NumberUtils";

describe("NumberUtils", () => {
  test("round should round to the specified precision", () => {
    expect(NumberUtils.round(1.2345, 2)).toBe(1.23);
    expect(NumberUtils.round(1.2355, 2)).toBe(1.24);
  });

  test("floor should floor to the specified precision", () => {
    expect(NumberUtils.floor(1.2345, 2)).toBe(1.23);
  });

  test("ceil should ceil to the specified precision", () => {
    expect(NumberUtils.ceil(1.2345, 2)).toBe(1.24);
  });

  test("inRange should check if a number is within a range", () => {
    expect(NumberUtils.inRange(5, 1, 10)).toBe(true);
    expect(NumberUtils.inRange(0, 1, 10)).toBe(false);
  });

  test("clamp should constrain a number to a range", () => {
    expect(NumberUtils.clamp(5, 1, 10)).toBe(5);
    expect(NumberUtils.clamp(0, 1, 10)).toBe(1);
  });

  test("random should generate a random number in a range", () => {
    const value = NumberUtils.random(1, 10);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(10);
  });

  test("randomInt should generate a random integer in a range", () => {
    const value = NumberUtils.randomInt(1, 10);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(10);
    expect(Number.isInteger(value)).toBe(true);
  });

  test("factorial should compute the factorial of a number", () => {
    expect(NumberUtils.factorial(5)).toBe(120);
    expect(NumberUtils.factorial(0)).toBe(1);
  });

  test("degreesToRadians and radiansToDegrees should convert correctly", () => {
    expect(NumberUtils.degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(NumberUtils.radiansToDegrees(Math.PI)).toBeCloseTo(180);
  });

  test("gcd should compute the greatest common divisor", () => {
    expect(NumberUtils.gcd(48, 18)).toBe(6);
  });

  test("lcm should compute the least common multiple", () => {
    expect(NumberUtils.lcm(4, 6)).toBe(12);
  });

  test("approximatelyEqual should check for approximate equality", () => {
    expect(NumberUtils.approximatelyEqual(1.001, 1, 0.01)).toBe(true);
    expect(NumberUtils.approximatelyEqual(1.1, 1, 0.01)).toBe(false);
  });
});
