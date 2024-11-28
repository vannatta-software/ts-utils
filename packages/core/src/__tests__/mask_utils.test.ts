import { MaskUtils } from "../MaskUtils";

describe("MaskUtils", () => {
  test("customMask should apply a custom mask correctly", () => {
    expect(MaskUtils.customMask("1234567890", "(999) 999-9999")).toBe("(123) 456-7890");
    expect(MaskUtils.customMask("abc123", "AAA-999")).toBe("abc-123");
    expect(MaskUtils.customMask("123abc", "SSS-SSS")).toBe("123-abc");
    expect(MaskUtils.customMask("123abc456", "SSS-SSS-SSS")).toBe("123-abc-456");
  });

  test("moneyMask should format numbers as currency", () => {
    expect(MaskUtils.moneyMask(1234.56)).toBe("$1,234.56");
    expect(MaskUtils.moneyMask(-1234.56, "€")).toBe("€-1,234.56");
    expect(MaskUtils.moneyMask(12345678.9, "£", 0)).toBe("£12,345,679");
    expect(MaskUtils.moneyMask(1234.567, "$", 3)).toBe("$1,234.567");
  });

  test("phoneMask should format phone numbers correctly", () => {
    expect(MaskUtils.phoneMask("1234567890")).toBe("(123) 456-7890");
    expect(MaskUtils.phoneMask("(123) 456-7890")).toBe("(123) 456-7890");
    expect(MaskUtils.phoneMask("123456789")).toBe("(123) 456-789");
  });

  test("ssnMask should format SSNs correctly", () => {
    expect(MaskUtils.ssnMask("123456789")).toBe("123-45-6789");
    expect(MaskUtils.ssnMask("123-45-6789")).toBe("123-45-6789");
    expect(MaskUtils.ssnMask("12345")).toBe("123-45");
  });

  test("creditCardMask should format credit card numbers correctly", () => {
    expect(MaskUtils.creditCardMask("1234123412341234")).toBe("1234 1234 1234 1234");
    expect(MaskUtils.creditCardMask("1234-1234-1234-1234")).toBe("1234 1234 1234 1234");
    expect(MaskUtils.creditCardMask("12341234")).toBe("1234 1234");
  });
});
