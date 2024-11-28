export class MaskUtils {
  private static DIGIT = "9";
  private static ALPHA = "A";
  private static ALPHANUM = "S";

  /**
   * Applies a custom mask pattern to a given value.
   */
  public static customMask(value: string, pattern: string): string {
    const patternChars = pattern.replace(/\W/g, "");
    const output = pattern.split("");
    const values = value.toString().replace(/\W/g, "");
    const charsValues = values.replace(/\W/g, "");
    let index = 0;

    for (let i = 0; i < output.length; i++) {
      if (index >= values.length) {
        if (patternChars.length === charsValues.length) {
          return output.join("");
        } else {
          break;
        }
      }

      if (
        (output[i] === MaskUtils.DIGIT && values[index].match(/[0-9]/)) ||
        (output[i] === MaskUtils.ALPHA && values[index].match(/[a-zA-Z]/)) ||
        (output[i] === MaskUtils.ALPHANUM && values[index].match(/[0-9a-zA-Z]/))
      ) {
        output[i] = values[index++];
      } else if (
        output[i] === MaskUtils.DIGIT ||
        output[i] === MaskUtils.ALPHA ||
        output[i] === MaskUtils.ALPHANUM
      ) {
        return output.slice(0, i).join("");
      } else if (output[i] === values[index]) {
        index++;
      }
    }
    return output.join("");
  }

  /**
   * Formats a number as currency.
   */
  public static moneyMask(
    number: number,
    symbol: string = "$",
    places: number = 2,
    thousand: string = ",",
    decimal: string = "."
  ): string {
    const negative = number < 0 ? "-" : "";
    const absNumber = Math.abs(number).toFixed(places);
    const [intPart, decimalPart] = absNumber.split(".");
    const formattedIntPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousand);

    return (
      symbol +
      negative +
      formattedIntPart +
      (places ? decimal + (decimalPart || "").padEnd(places, "0") : "")
    );
  }

  /**
   * Masks a phone number (e.g., (XXX) XXX-XXXX).
   */
  public static phoneMask(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned
      .replace(/^(\d{3})(\d{3})(\d{1,4}).*/, "($1) $2-$3")
      .substr(0, 14);
  }

  /**
   * Masks a Social Security Number (e.g., XXX-XX-XXXX).
   */
  public static ssnMask(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, "");
    return cleaned
      .replace(/^(\d{3})(\d{0,2})(\d{0,4})$/, (_, g1, g2, g3) => {
        return [g1, g2, g3].filter(Boolean).join("-");
      });
  }
  
  /**
   * Formats a credit card number with spaces every 4 digits.
   */
  public static creditCardMask(card: string): string {
    const cleaned = card.replace(/\D/g, "");
    return cleaned
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .substr(0, 19);
  }
}
